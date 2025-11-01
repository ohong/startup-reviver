export interface Startup {
  slug: string;
  name: string;
  small_logo_thumb_url: string;
  one_liner: string;
  batch: string;
  launched_at: number;
  website: string;
  status: "Active" | "Acquired" | "Inactive";
}

export const mockStartups: Startup[] = [
  {
    slug: "zirtual",
    name: "Zirtual",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/zirtual/card_image",
    one_liner: "On-demand virtual assistants for busy professionals",
    batch: "W11",
    launched_at: 1293840000,
    website: "https://zirtual.com",
    status: "Inactive"
  },
  {
    slug: "homejoy",
    name: "Homejoy",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/homejoy/card_image",
    one_liner: "On-demand home cleaning services",
    batch: "S10",
    launched_at: 1277942400,
    website: "https://homejoy.com",
    status: "Inactive"
  },
  {
    slug: "flightcar",
    name: "FlightCar",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/flightcar/card_image",
    one_liner: "Peer-to-peer car rental at airports",
    batch: "W13",
    launched_at: 1356998400,
    website: "https://flightcar.com",
    status: "Inactive"
  },
  {
    slug: "farmeron",
    name: "Farmeron",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/farmeron/card_image",
    one_liner: "Farm management software for livestock farmers",
    batch: "S12",
    launched_at: 1341100800,
    website: "https://farmeron.com",
    status: "Active"
  },
  {
    slug: "stayzilla",
    name: "Stayzilla",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/stayzilla/card_image",
    one_liner: "Alternative accommodations marketplace in India",
    batch: "W11",
    launched_at: 1293840000,
    website: "https://stayzilla.com",
    status: "Inactive"
  },
  {
    slug: "exec",
    name: "Exec",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/exec/card_image",
    one_liner: "On-demand cleaning and handyman services",
    batch: "W12",
    launched_at: 1325376000,
    website: "https://exec.com",
    status: "Inactive"
  },
  {
    slug: "thrively",
    name: "Thrively",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/thrively/card_image",
    one_liner: "Personalized learning platform for kids",
    batch: "S14",
    launched_at: 1404172800,
    website: "https://thrively.com",
    status: "Inactive"
  },
  {
    slug: "backops",
    name: "BackOps",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/backops/card_image",
    one_liner: "Back-office operations for SMBs",
    batch: "S15",
    launched_at: 1435708800,
    website: "https://backops.com",
    status: "Inactive"
  },
  {
    slug: "udemy",
    name: "Udemy",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/udemy/card_image",
    one_liner: "Online learning platform with courses on everything",
    batch: "S10",
    launched_at: 1277942400,
    website: "https://udemy.com",
    status: "Active"
  },
  {
    slug: "reddit",
    name: "Reddit",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/reddit/card_image",
    one_liner: "The front page of the internet",
    batch: "S05",
    launched_at: 1120176000,
    website: "https://reddit.com",
    status: "Active"
  },
  {
    slug: "sprig",
    name: "Sprig",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/sprig/card_image",
    one_liner: "Healthy meal delivery service",
    batch: "S13",
    launched_at: 1372636800,
    website: "https://sprig.com",
    status: "Inactive"
  },
  {
    slug: "kixeye",
    name: "Kixeye",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/kixeye/card_image",
    one_liner: "Hardcore strategy games",
    batch: "W07",
    launched_at: 1167609600,
    website: "https://kixeye.com",
    status: "Active"
  },
  {
    slug: "42floors",
    name: "42Floors",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/42floors/card_image",
    one_liner: "Commercial real estate search engine",
    batch: "S11",
    launched_at: 1309478400,
    website: "https://42floors.com",
    status: "Inactive"
  },
  {
    slug: "fetchr",
    name: "Fetchr",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/fetchr/card_image",
    one_liner: "AI personal shopper for clothes",
    batch: "W23",
    launched_at: 1672531200,
    website: "https://www.ycombinator.com/companies/fetchr",
    status: "Inactive"
  },
  {
    slug: "mealkitt",
    name: "Mealkitt",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/mealkitt/card_image",
    one_liner: "Recipe kit delivery service",
    batch: "S14",
    launched_at: 1404172800,
    website: "https://mealkitt.com",
    status: "Inactive"
  },
  {
    slug: "airbnb",
    name: "Airbnb",
    small_logo_thumb_url: "https://www.ycombinator.com/companies/airbnb/card_image",
    one_liner: "Book accommodations around the world",
    batch: "W09",
    launched_at: 1230768000,
    website: "https://airbnb.com",
    status: "Active"
  }
];

