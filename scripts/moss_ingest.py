import json

import requests


def main():
    url = "https://yc-oss.github.io/api/companies/all.json"
    output_file = "yc_companies_formatted.json"
    max_entries = 1000
    written_count = 0
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        companies = resp.json()
    except Exception as e:
        print(f"Failed to fetch or parse JSON: {e}")
        return

    output_data = []
    for company in companies[:max_entries]:
        # Get id from slug
        slug = company.get("slug")
        if not slug:
            continue  # If no slug, skip
        _id = slug

        # Prepare text from all fields:
        company_details = "; ".join([f"{k}: {v}" for k, v in company.items()])

        # Prepare metadata (copy all fields except slug)
        metadata = {k: v for k, v in company.items() if k != "slug"}

        # Convert any array values in metadata to comma-separated strings
        for k, v in metadata.items():
            if isinstance(v, list):
                metadata[k] = ", ".join(str(item) for item in v)

        # Build output object
        out_json = {
            "id": _id,
            "text": company_details,
            "metadata": metadata,
        }
        output_data.append(out_json)
        written_count += 1

    with open(output_file, "w", encoding="utf-8") as fout:
        json.dump(output_data, fout, ensure_ascii=False, indent=2)

    print(f"Done. Written {written_count} records to {output_file}")


if __name__ == "__main__":
    main()
