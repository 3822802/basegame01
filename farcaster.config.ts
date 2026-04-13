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
    header: "eyJmaWQiOjk5ODE5NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDc4MzU0YzRFMTU4MDc0MjM3MUEwQTQzMjQ5RDk3MWU5M2Y1OTI2NEIifQ",
    payload: "eyJkb21haW4iOiJiYXNlZ2FtZTAxLXJvYW4udmVyY2VsLmFwcCJ9",
    signature: "OVHqi2MeCPYCGZ5CzEBLGvfmEcfyRIDOJXHpwPZllEMDWGklbsY5hgXi93xW2boajcgmCi2ncYX26qsyJAfZZxs="
  },
  miniapp: {
    version: "1",
    name: "Bear Tapper",
    subtitle: "Forest Tap Game",
    description: "Tap the bear, do daily onchain check-ins, and climb the leaderboard.",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#1f3f2e",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["game", "tap", "leaderboard", "onchain", "base"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Tap. Check in. Climb.",
    ogTitle: "Bear Tapper",
    ogDescription: "Daily onchain check-ins boost your tap multiplier.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;

