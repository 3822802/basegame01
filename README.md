# Bear Tapper
z
Mobile-first tap game for Base App:
- tap the bear to earn points,
- complete a daily onchain check-in,
- grow your streak and multiplier (+10% per daily check-in),
- compete in the leaderboard.

## Features

- **Main menu** with 3 actions:
  - `Лидерборд`
  - `Ончейн чек-ин`
  - `Начать тапать`
- **Tap loop**:
  - each tap gives `1 * multiplier` points,
  - multiplier formula: `1 + streak * 0.1`.
- **Daily onchain check-in**:
  - check-in day is based on `00:00 UTC`,
  - one check-in per UTC day,
  - if a day is missed, streak resets.
- **Countdown timer** to the next check-in window (`00:00 UTC`).
- **Forest-themed UI** (mountains + forest layers + wooden buttons).

## Stack

- Next.js App Router
- wagmi + viem
- Onchain game state in deployed Base Mainnet contract

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_URL=http://localhost:3000
```

## Run

```bash
npm install
npm run dev
```

## Onchain Contract

- Network: Base Mainnet
- Address: `0xa865f97263b41862Db484aA46B66908401b3aB5B`
- Builder Code: `bc_3kvzpilt`
- Builder data suffix: `0x62635f336b767a70696c740b0080218021802180218021802180218021`
- Game actions:
  - `tap(uint256 tapsCount)`
  - `checkIn()` (free, once per UTC day)
- Reads:
  - `getPlayer(address)`
  - `getLeaderboard()`
  - `secondsUntilNextUtcMidnight()`

Website wallet connect: Rabby, MetaMask, Base Account via wagmi.
1
