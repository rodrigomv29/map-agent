export const MOCK_NEWS_RESPONSE = {
  query: "mock",
  totalResults: 5,
  articles: [
    {
      title: "Massive Earthquake Strikes Central Tokyo",
      description:
        "A 6.2 magnitude earthquake hit central Tokyo early this morning, causing widespread structural damage in the Shibuya and Shinjuku districts.",
      url: "https://example.com/tokyo-earthquake",
      urlToImage: null,
      publishedAt: "2026-02-13T08:00:00Z",
      source: "Mock News",
      author: "Yuki Tanaka",
    },
    {
      title: "Tech Giants Announce AI Summit in San Francisco",
      description:
        "Major technology companies are gathering in San Francisco for a three-day summit on artificial intelligence regulation and safety standards.",
      url: "https://example.com/sf-ai-summit",
      urlToImage: null,
      publishedAt: "2026-02-12T14:30:00Z",
      source: "Mock Tech Daily",
      author: "Sarah Chen",
    },
    {
      title: "Historic Flooding in London Disrupts Transit",
      description:
        "The Thames burst its banks overnight, flooding several Underground stations and forcing the closure of Waterloo Bridge.",
      url: "https://example.com/london-flooding",
      urlToImage: null,
      publishedAt: "2026-02-12T09:15:00Z",
      source: "Mock World Report",
      author: "James Wright",
    },
    {
      title: "NASA Launches Mars Sample Return Mission from Cape Canaveral",
      description:
        "NASA successfully launched its Mars Sample Return spacecraft from Cape Canaveral this morning, marking a historic step in planetary science.",
      url: "https://example.com/nasa-mars",
      urlToImage: null,
      publishedAt: "2026-02-11T11:00:00Z",
      source: "Mock Science Journal",
      author: "Maria Rodriguez",
    },
    {
      title: "Global Climate Accord Reached at UN Headquarters",
      description:
        "World leaders signed a landmark climate agreement at the United Nations headquarters in New York, pledging to cut emissions by 50% by 2035.",
      url: "https://example.com/un-climate",
      urlToImage: null,
      publishedAt: "2026-02-10T18:45:00Z",
      source: "Mock Global News",
      author: "David Park",
    },
  ],
};

// Pin locations matching the articles above
export const MOCK_PIN_LOCATIONS = [
  {
    title: "Massive Earthquake Strikes Central Tokyo",
    description: "6.2 magnitude earthquake in Shibuya and Shinjuku districts",
    location: "Tokyo, Japan",
    lat: 35.6762,
    lng: 139.6503,
  },
  {
    title: "Tech Giants Announce AI Summit in San Francisco",
    description: "Three-day AI regulation and safety summit",
    location: "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
  },
  {
    title: "Historic Flooding in London Disrupts Transit",
    description: "Thames flooding closes Underground stations and Waterloo Bridge",
    location: "London, UK",
    lat: 51.5074,
    lng: -0.1278,
  },
  {
    title: "NASA Launches Mars Sample Return Mission from Cape Canaveral",
    description: "Mars Sample Return spacecraft launched",
    location: "Cape Canaveral, FL",
    lat: 28.3922,
    lng: -80.6077,
  },
  {
    title: "Global Climate Accord Reached at UN Headquarters",
    description: "Landmark climate agreement signed at UN headquarters",
    location: "New York, NY",
    lat: 40.7489,
    lng: -73.968,
  },
];
