"""
Survey/Outbound Calling Agent for LiveKit

Reads call configuration from Agent Dispatch metadata or room metadata:
- phone_number (string): callee's number
- recipient_name (string): callee's name
- questions (string[]): list of questions to ask
- row_index (int, optional): arbitrary index you may supply

By default, uses:
- STT: deepgram/nova-3 (requires DEEPGRAM_API_KEY)
- LLM: openai/gpt-4o-mini (requires OPENAI_API_KEY)
- TTS: elevenlabs/eleven_flash_v2 (requires ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID)
- VAD: silero (optional, will gracefully degrade if unavailable)

Required environment variables (must be set in .env file in project root):
- DEEPGRAM_API_KEY: Get from https://console.deepgram.com/
- OPENAI_API_KEY: Get from https://platform.openai.com/api-keys
- ELEVENLABS_API_KEY: Get from https://elevenlabs.io/
- ELEVENLABS_VOICE_ID: Voice ID from ElevenLabs (e.g., "21m00Tcm4TlvDq8ikWAM")

Optional:
- OPENAI_LLM_MODEL: Override LLM model (default: "gpt-4o-mini")
- ELEVEN_VOICE_ID: Alternative env var name for voice ID
"""

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

# Ensure psutil falls back when sysctl access is blocked in sandboxed environments.
try:
    import psutil  # type: ignore
except Exception:
    psutil = None
else:
    try:
        psutil.cpu_count()
    except Exception:
        _fallback_cpu_count = os.cpu_count() or 1

        def _safe_cpu_count(*args: Any, **kwargs: Any) -> int:
            return int(_fallback_cpu_count)

        psutil.cpu_count = _safe_cpu_count  # type: ignore

from livekit.agents import JobContext, WorkerOptions, cli
from livekit.agents.voice import Agent, AgentSession, RunContext
from livekit.agents.llm import function_tool
from livekit.plugins import deepgram, elevenlabs, openai

try:
    from livekit.plugins import silero
except Exception as exc:  # pragma: no cover - import-time guard
    silero = None  # type: ignore[assignment]
    SILERO_IMPORT_ERROR: Optional[Exception] = exc
else:
    SILERO_IMPORT_ERROR: Optional[Exception] = None

from livekit.api import DeleteRoomRequest


# Load env from project root .env
load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')

logger = logging.getLogger("outbound-calling-agent")
logger.setLevel(logging.INFO)

DATA_DIR = Path(__file__).parent


class OutboundSurveyAgent(Agent):
    def __init__(
        self,
        questions: List[str],
        recipient_name: Optional[str] = None,
        phone_number: Optional[str] = None,
        row_index: Optional[int] = None,
        job_context: Optional[JobContext] = None,
    ) -> None:
        self.questions = questions or []
        self.recipient_name = recipient_name or "there"
        self.phone_number = phone_number or "unknown"
        self.row_index = row_index
        self.job_context = job_context
        self.answers: List[str] = []

        greeting = (
            f"You are calling {self.recipient_name} on the phone. "
            "Be polite and professional. Introduce yourself as a researcher named 'Sam'. "
            "Ask the following questions one by one, waiting for an answer to each before moving on. "
            "Keep the call brief and focused on collecting their responses."
        )

        # Simple instruction block: the agent should ask all provided questions in order
        instructions = (
            greeting
            + "\nQuestions to ask in order:"\
            + "\n".join([f"- {q}" for q in self.questions])
            + "\nWhen you get an answer to a question, call record_answer(question, answer)."
            + "\nAfter all questions are answered, thank the person and end the call."
        )

        # Validate required API keys
        deepgram_key = os.getenv("DEEPGRAM_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")
        elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
        
        if not deepgram_key:
            raise ValueError(
                "DEEPGRAM_API_KEY environment variable is required. "
                "Get your API key from https://console.deepgram.com/"
            )
        if not openai_key:
            raise ValueError(
                "OPENAI_API_KEY environment variable is required. "
                "Get your API key from https://platform.openai.com/api-keys"
            )

        # Initialize VAD plugin (Silero) - optional, gracefully degrade if unavailable
        vad_plugin = None
        if silero:
            try:
                # Try different initialization methods depending on plugin version
                if hasattr(silero.VAD, 'load'):
                    vad_plugin = silero.VAD.load()
                else:
                    vad_plugin = silero.VAD()
                logger.info("Silero VAD initialized successfully")
            except Exception as exc:
                logger.warning("Silero VAD unavailable: %s", exc)
        elif SILERO_IMPORT_ERROR:
            logger.warning("Silero plugin not available: %s", SILERO_IMPORT_ERROR)

        # Get voice ID from env or use default
        voice_id_value = os.getenv("ELEVENLABS_VOICE_ID") or os.getenv("ELEVEN_VOICE_ID")

        if not voice_id_value:
            raise ValueError(
                "ELEVENLABS_VOICE_ID environment variable is required. "
                "Get your voice ID from https://elevenlabs.io/"
            )
        if not elevenlabs_key:
            raise ValueError(
                "ELEVENLABS_API_KEY environment variable is required. "
                "Get your API key from https://elevenlabs.io/"
            )

        # Initialize services with validated keys
        try:
            stt_service = deepgram.STT(model="nova-3", language="en")
        except Exception as exc:
            logger.error("Failed to initialize Deepgram STT: %s", exc)
            raise ValueError(f"Deepgram STT initialization failed: {exc}") from exc

        try:
            llm_service = openai.LLM(
                model=os.getenv("OPENAI_LLM_MODEL", "gpt-4o-mini"),
            )
        except Exception as exc:
            logger.error("Failed to initialize OpenAI LLM: %s", exc)
            raise ValueError(f"OpenAI LLM initialization failed: {exc}") from exc

        # TTS is required for voice agents
        try:
            tts_service = elevenlabs.TTS(
                model="eleven_flash_v2",
                voice_settings=elevenlabs.tts.VoiceSettings(
                    stability=0.9,
                    speed=1,
                    similarity_boost=0.9,
                    use_speaker_boost=True,
                ),
                voice_id=voice_id_value,
                streaming_latency=2,
            )
        except Exception as exc:
            logger.error("Failed to initialize ElevenLabs TTS: %s", exc)
            raise ValueError(f"ElevenLabs TTS initialization failed: {exc}") from exc

        super().__init__(
            instructions=instructions,
            stt=stt_service,
            llm=llm_service,
            tts=tts_service,
            vad=vad_plugin,
        )

    @function_tool
    async def record_answer(self, context: RunContext, question: str, answer: str):
        """Record an answer to a question."""
        logger.info("Recorded answer: %s -> %s", question, answer)
        self.answers.append(answer)
        return None, "Answer recorded"

    async def on_session_started(self, context: RunContext):
        # Start by greeting and prompting the first question
        await self.session.generate_reply()

    async def on_hangup(self, context: RunContext):
        # Persist results on hangup
        await self._persist_results_and_cleanup()

    async def _persist_results_and_cleanup(self):
        # Log answers (no CSV persistence)
        for i, q in enumerate(self.questions):
            ans = self.answers[i] if i < len(self.answers) else ""
            logger.info("Answer %d - %s => %s", i + 1, q, ans)

        # Give a short grace period and delete the room
        await asyncio.sleep(3)
        try:
            if self.job_context and self.job_context.room:
                await self.job_context.api.room.delete_room(
                    DeleteRoomRequest(room=self.job_context.room.name)
                )
        except Exception as e:
            logger.warning("Failed to delete room: %s", e)


async def entrypoint(ctx: JobContext):
    # Prefer agent dispatch metadata; fallback to room metadata
    md_json = ctx.job.metadata or (ctx.room.metadata or "{}")
    logger.info("Received metadata: %s", md_json)

    try:
        metadata: Dict[str, Any] = json.loads(md_json)
    except Exception:
        metadata = {}

    questions = metadata.get("questions") or []
    if isinstance(questions, str):
        # allow comma-separated string
        questions = [q.strip() for q in questions.split(",") if q.strip()]

    recipient_name = metadata.get("recipient_name")
    phone_number = metadata.get("phone_number") or metadata.get("to")
    row_index = metadata.get("row_index")

    if not questions:
        # Backward-compat: accept single 'question'
        q = metadata.get("question")
        if q:
            questions = [q]
        else:
            questions = [
                "Why was your startup failed?"
    "When did your startup officially shut down or pivot?",
    "What was your startup's core product or service?",
    "What was the primary reason your startup failed?",
    "What were the early warning signs you noticed (or missed)?",
    "If you could go back, what would you do differently?",
    "What was your biggest lesson learned from this experience?",
    "Did you experience founder conflicts or team issues? If so, what happened?",
    "How did you handle the emotional and mental challenges of failure?",
    "What advice would you give to founders facing similar challenges?",
    "Are you planning to start another venture? Why or why not?",
    "Do you prefer a morning or afternoon meeting for the interview?",
]

    session = AgentSession()
    agent = OutboundSurveyAgent(
        questions=questions,
        recipient_name=recipient_name,
        phone_number=phone_number,
        row_index=row_index,
        job_context=ctx,
    )

    await session.start(agent=agent, room=ctx.room)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
