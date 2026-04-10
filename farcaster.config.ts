const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const farcasterConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Bear Tapper",
    subtitle: "Forest Tap Game",
    description: "Tap the bear, do daily onchain check-ins, and climb the leaderboard.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/sphere.svg`,
    splashImageUrl: `${ROOT_URL}/sphere.svg`,
    splashBackgroundColor: "#1f3f2e",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["game", "tap", "leaderboard", "onchain", "base"],
    heroImageUrl: `${ROOT_URL}/sphere.svg`,
    tagline: "Tap. Check in. Climb.",
    ogTitle: "Bear Tapper",
    ogDescription: "Daily onchain check-ins boost your tap multiplier.",
    ogImageUrl: `${ROOT_URL}/sphere.svg`,
  },
} as const;

