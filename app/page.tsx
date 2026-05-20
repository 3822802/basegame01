"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMiniApp } from "./providers/MiniAppProvider";
import { encodeFunctionData } from "viem";
import { base } from "wagmi/chains";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  bearTapGameAbi,
  bearTapGameAddress,
  withBearTapperBuilderCodeDataSuffix,
} from "@/lib/contracts/bearTapGame";
import styles from "./page.module.css";

type View = "menu" | "tap" | "leaderboard" | "checkin";

interface GameState {
  score: number;
  streak: number;
  multiplierBps: number;
  canCheckinNow: boolean;
  nextCheckinInSec: number;
}

interface LeaderboardRow {
  rank: number;
  wallet: string;
  score: number;
}

function shortWallet(wallet: string) {
  if (!wallet) return "";
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function formatCountdownFromSeconds(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Home() {
  const { context } = useMiniApp();
  const { address, isConnected, chainId } = useAccount();
  const { connectAsync, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const [view, setView] = useState<View>("menu");
  const [state, setState] = useState<GameState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [countdown, setCountdown] = useState("00:00:00");
  const [pendingTaps, setPendingTaps] = useState(0);
  const [error, setError] = useState("");
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const name = useMemo(
    () => context?.user?.displayName || (address ? `Player ${address.slice(2, 6).toUpperCase()}` : "Player"),
    [context?.user?.displayName, address],
  );

  const { data: txHash, isPending: isWritePending, sendTransactionAsync } = useSendTransaction();
  const { isLoading: isTxMining, isSuccess: isTxMined } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) },
  });

  const walletConnectors = useMemo(
    () =>
      connectors.filter((connector) => {
        const connectorName = connector.name.toLowerCase();
        return (
          connectorName.includes("rabby") ||
          connectorName.includes("metamask") ||
          connectorName.includes("injected") ||
          connectorName.includes("base")
        );
      }),
    [connectors]
  );

  const preferredConnector = useMemo(
    () =>
      walletConnectors.find((connector) => connector.name.toLowerCase().includes("rabby")) ??
      walletConnectors.find((connector) => connector.name.toLowerCase().includes("metamask")) ??
      walletConnectors.find((connector) => connector.name.toLowerCase().includes("injected")) ??
      walletConnectors[0],
    [walletConnectors]
  );

  const handleConnectWallet = useCallback(
    async (connector = preferredConnector) => {
      if (!connector) {
        setError("Установи Rabby или MetaMask и попробуй подключить кошелек снова.");
        return;
      }

      setError("");
      try {
        await connectAsync({ connector, chainId: base.id });
        setShowWalletOptions(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось подключить кошелек.");
        setShowWalletOptions(true);
      }
    },
    [connectAsync, preferredConnector]
  );

  const fetchState = useCallback(async () => {
    if (!address || !publicClient) return;
    try {
      const [playerRaw, nextCheckinRaw] = await Promise.all([
        publicClient.readContract({
          address: bearTapGameAddress,
          abi: bearTapGameAbi,
          functionName: "getPlayer",
          args: [address],
        }),
        publicClient.readContract({
          address: bearTapGameAddress,
          abi: bearTapGameAbi,
          functionName: "secondsUntilNextUtcMidnight",
        }),
      ]);

      const [score, streak, _lastCheckinDay, canCheckInNow, multiplierBps] = playerRaw as readonly [
        bigint,
        bigint,
        bigint,
        boolean,
        bigint,
      ];
      const nextCheckinInSec = Number(nextCheckinRaw as bigint);

      setState({
        score: Number(score),
        streak: Number(streak),
        multiplierBps: Number(multiplierBps),
        canCheckinNow: canCheckInNow,
        nextCheckinInSec,
      });
      setCountdown(formatCountdownFromSeconds(nextCheckinInSec));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка чтения контракта.");
    }
  }, [address, publicClient]);

  const fetchLeaderboard = useCallback(async () => {
    if (!publicClient) return;
    try {
      const rowsRaw = (await publicClient.readContract({
        address: bearTapGameAddress,
        abi: bearTapGameAbi,
        functionName: "getLeaderboard",
      })) as readonly { player: `0x${string}`; score: bigint }[];

      const mapped: LeaderboardRow[] = rowsRaw.map((row, index) => ({
        rank: index + 1,
        wallet: row.player,
        score: Number(row.score),
      }));
      setLeaderboard(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка чтения лидерборда.");
    }
  }, [publicClient]);

  useEffect(() => {
    if (!isConnected || !address) return;
    setError("");
    void fetchState();
    void fetchLeaderboard();
  }, [isConnected, address, fetchState, fetchLeaderboard]);

  useEffect(() => {
    if (!state?.nextCheckinInSec) return;
    let remaining = state.nextCheckinInSec;
    const tick = () => {
      setCountdown(formatCountdownFromSeconds(remaining));
      remaining = Math.max(0, remaining - 1);
    };
    tick();
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [state?.nextCheckinInSec]);

  useEffect(() => {
    const refreshAfterTx = async () => {
      if (!isTxMined) return;
      setPendingTaps(0);
      await fetchLeaderboard();
      await fetchState();
    };
    void refreshAfterTx();
  }, [fetchLeaderboard, fetchState, isTxMined]);

  const handleTap = () => {
    if (!state) return;
    setPendingTaps((prev) => prev + 1);
  };

  const handleSyncTaps = async () => {
    if (!pendingTaps || !address || !state) return;
    setError("");
    try {
      const data = withBearTapperBuilderCodeDataSuffix(
        encodeFunctionData({
          abi: bearTapGameAbi,
          functionName: "tap",
          args: [BigInt(pendingTaps)],
        })
      );
      await sendTransactionAsync({
        to: bearTapGameAddress,
        data,
        value: BigInt(0),
        chainId: base.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить tap транзакцию.");
    }
  };

  const handleCheckin = async () => {
    if (!address || !state?.canCheckinNow) return;
    setError("");
    try {
      const data = withBearTapperBuilderCodeDataSuffix(
        encodeFunctionData({
          abi: bearTapGameAbi,
          functionName: "checkIn",
          args: [],
        })
      );
      await sendTransactionAsync({
        to: bearTapGameAddress,
        data,
        value: BigInt(0),
        chainId: base.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить check-in транзакцию.");
    }
  };

  const isBusy = isWritePending || isTxMining;
  const isCorrectChain = chainId === base.id;
  const multiplier = state ? state.multiplierBps / 10000 : 1;
  const projectedScore = state ? state.score + Math.floor((pendingTaps * state.multiplierBps) / 10000) : 0;

  return (
    <main className={styles.container}>
      <div className={styles.backgroundLayer} />
      <div className={styles.mountainsLayer} />
      <div className={styles.forestLayer} />

      <section className={styles.card}>
        <h1 className={styles.title}>Bear Tapper</h1>
        {!isConnected || !address ? (
          <div className={styles.walletPanel}>
            <p className={styles.warning}>
              Подключи Rabby, MetaMask или Base Account, чтобы играть через сайт.
            </p>
            <button
              className={styles.woodButton}
              type="button"
              onClick={() => {
                if (walletConnectors.length > 1) {
                  setShowWalletOptions((current) => !current);
                  return;
                }
                void handleConnectWallet();
              }}
              disabled={isConnectPending}
            >
              {isConnectPending ? "Подключение..." : "Подключить кошелек"}
            </button>
            {showWalletOptions ? (
              <div className={styles.walletOptions}>
                {walletConnectors.length === 0 ? (
                  <p className={styles.hint}>Rabby или MetaMask не найдены в браузере.</p>
                ) : (
                  walletConnectors.map((connector) => (
                    <button
                      className={styles.smallButton}
                      type="button"
                      key={connector.uid}
                      onClick={() => void handleConnectWallet(connector)}
                      disabled={isConnectPending}
                    >
                      {connector.name}
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
        ) : !isCorrectChain ? (
          <p className={styles.warning}>Переключите сеть кошелька на Base Mainnet.</p>
        ) : (
          <div className={styles.playerLine}>
            <span>{name}</span>
            <span>{shortWallet(address)}</span>
            <button className={styles.disconnectButton} type="button" onClick={() => disconnect()}>
              Отключить
            </button>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.scorePanel}>
          <div>
            <p className={styles.metaLabel}>Очки</p>
            <p className={styles.metaValue}>{projectedScore}</p>
          </div>
          <div>
            <p className={styles.metaLabel}>Streak</p>
            <p className={styles.metaValue}>{state?.streak ?? 0}</p>
          </div>
          <div>
            <p className={styles.metaLabel}>Множитель</p>
            <p className={styles.metaValue}>x{multiplier.toFixed(2)}</p>
          </div>
        </div>

        {view === "menu" && (
          <div className={styles.menuButtons}>
            <button className={styles.woodButton} onClick={() => setView("leaderboard")} type="button">
              Лидерборд
            </button>
            <button className={styles.woodButton} onClick={() => setView("checkin")} type="button">
              Ончейн чек-ин
            </button>
            <button className={styles.woodButton} onClick={() => setView("tap")} type="button">
              Начать тапать
            </button>
          </div>
        )}

        {view === "tap" && (
          <div className={styles.viewBlock}>
            <button className={styles.bearButton} type="button" onClick={handleTap} disabled={!state || isBusy || !isCorrectChain}>
              <span className={styles.bearIcon}>🐻</span>
              <span className={styles.bearCaption}>ТАПАЙ МЕДВЕДЯ</span>
            </button>
            <p className={styles.hint}>Обычный тап = 1 очко, плюс onchain множитель streak.</p>
            <p className={styles.hint}>Неотправленные тапы: {pendingTaps}</p>
            <button
              className={styles.woodButton}
              type="button"
              onClick={() => void handleSyncTaps()}
              disabled={!pendingTaps || isBusy || !isCorrectChain}
            >
              {isBusy ? "Транзакция..." : `Отправить ${pendingTaps} тап(ов) onchain`}
            </button>
          </div>
        )}

        {view === "checkin" && (
          <div className={styles.viewBlock}>
            <p className={styles.checkinText}>
              Следующий UTC reset: <strong>00:00</strong>
            </p>
            <p className={styles.timer}>{countdown}</p>
            <button
              className={styles.woodButton}
              type="button"
              onClick={() => void handleCheckin()}
              disabled={!state?.canCheckinNow || isBusy || !address || !isCorrectChain}
            >
              {isBusy
                ? "Транзакция..."
                : state?.canCheckinNow
                  ? "Сделать ончейн чек-ин"
                  : "Чек-ин уже сделан сегодня"}
            </button>
            {txHash && <p className={styles.hint}>Tx: {shortWallet(txHash)}</p>}
          </div>
        )}

        {view === "leaderboard" && (
          <div className={styles.viewBlock}>
            <button className={styles.smallButton} type="button" onClick={() => void fetchLeaderboard()}>
              Обновить
            </button>
            <div className={styles.leaderboard}>
              {leaderboard.length === 0 ? (
                <p className={styles.hint}>Пока нет игроков. Станьте первым!</p>
              ) : (
                leaderboard.map((row) => (
                  <div className={styles.leaderboardRow} key={`${row.wallet}-${row.rank}`}>
                    <span>#{row.rank}</span>
                    <span>{shortWallet(row.wallet)}</span>
                    <span>{row.score}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view !== "menu" && (
          <button className={styles.backButton} type="button" onClick={() => setView("menu")}>
            В меню
          </button>
        )}
      </section>
    </main>
  );
}
