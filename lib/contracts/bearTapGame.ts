export const bearTapGameAddress = "0xa865f97263b41862Db484aA46B66908401b3aB5B" as const;

export const BEAR_TAPPER_BUILDER_CODE = "bc_3kvzpilt";
export const BEAR_TAPPER_BUILDER_CODE_DATA_SUFFIX =
  "0x62635f336b767a70696c740b0080218021802180218021802180218021" as const;

export function withBearTapperBuilderCodeDataSuffix(data: `0x${string}`): `0x${string}` {
  return `${data}${BEAR_TAPPER_BUILDER_CODE_DATA_SUFFIX.slice(2)}` as `0x${string}`;
}

export const bearTapGameAbi = [
  {
    inputs: [{ internalType: "uint256", name: "_leaderboardSize", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "AlreadyCheckedInToday", type: "error" },
  {
    inputs: [],
    name: "checkIn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "InvalidTapCount", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint256", name: "streak", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "dayIndex", type: "uint256" },
    ],
    name: "CheckedIn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint256", name: "score", type: "uint256" },
    ],
    name: "LeaderboardUpdated",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "tapsCount", type: "uint256" }],
    name: "tap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint256", name: "taps", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "gainedPoints", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "totalScore", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "streak", type: "uint256" },
    ],
    name: "Tapped",
    type: "event",
  },
  {
    inputs: [],
    name: "BASE_POINTS_PER_TAP",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "BPS_DENOMINATOR",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLeaderboard",
    outputs: [
      {
        components: [
          { internalType: "address", name: "player", type: "address" },
          { internalType: "uint256", name: "score", type: "uint256" },
        ],
        internalType: "struct BearTapGame.LeaderboardEntry[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getPlayer",
    outputs: [
      { internalType: "uint256", name: "score", type: "uint256" },
      { internalType: "uint256", name: "streak", type: "uint256" },
      { internalType: "uint256", name: "lastCheckinDay", type: "uint256" },
      { internalType: "bool", name: "canCheckInNow", type: "bool" },
      { internalType: "uint256", name: "multiplierBps", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "leaderboard",
    outputs: [
      { internalType: "address", name: "player", type: "address" },
      { internalType: "uint256", name: "score", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "leaderboardSize",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "players",
    outputs: [
      { internalType: "uint256", name: "score", type: "uint256" },
      { internalType: "uint256", name: "streak", type: "uint256" },
      { internalType: "uint256", name: "lastCheckinDay", type: "uint256" },
      { internalType: "bool", name: "hasCheckedIn", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "secondsUntilNextUtcMidnight",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "STREAK_BONUS_BPS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
