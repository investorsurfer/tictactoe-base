"use client";

import { useState, useEffect, useCallback } from "react";
import { emptyBoard, checkWinner, isDraw, getBestMove, type Board, type GameStatus, type Cell } from "@/app/lib/game";
import { connectWallet, getConnectedAccount, payToPlay, GAME_FEE } from "@/app/lib/wallet";
import sdk from "@farcaster/miniapp-sdk";

const formatEth = (wei: bigint) => {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
};

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [status, setStatus] = useState<GameStatus>("idle");
  const [account, setAccount] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const ctx = await sdk.context;
        if (ctx?.user) {
          setIsFarcaster(true);
          await sdk.actions.ready();
        }
      } catch {
        // Not in Farcaster, that's fine
      }
      const acc = await getConnectedAccount();
      if (acc) setAccount(acc);
    };
    init();
  }, []);

  const handleConnect = async () => {
    setError(null);
    try {
      const acc = await connectWallet();
      setAccount(acc);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet");
    }
  };

  const handleStartGame = async () => {
    if (!account) {
      await handleConnect();
      return;
    }
    setError(null);
    setStatus("paying");
    try {
      const hash = await payToPlay(account);
      setTxHash(hash);
      setBoard(emptyBoard());
      setWinLine(null);
      setStatus("playing");
      setGamesPlayed((g) => g + 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Transaction failed");
      setStatus("idle");
    }
  };

  const handleCellClick = useCallback(async (idx: number) => {
    if (status !== "playing" || board[idx] || thinking) return;

    const newBoard = [...board] as Board;
    newBoard[idx] = "X";
    setBoard(newBoard);

    const { winner: playerWon, line } = checkWinner(newBoard);
    if (playerWon) {
      setWinLine(line);
      setStatus("won");
      return;
    }
    if (isDraw(newBoard)) {
      setStatus("draw");
      return;
    }

    setThinking(true);
    await new Promise((r) => setTimeout(r, 400));

    const aiMove = getBestMove([...newBoard]);
    if (aiMove === -1) { setStatus("draw"); setThinking(false); return; }

    newBoard[aiMove] = "O";
    setBoard([...newBoard]);
    setThinking(false);

    const { winner: aiWon, line: aiLine } = checkWinner(newBoard);
    if (aiWon) {
      setWinLine(aiLine);
      setStatus("lost");
      return;
    }
    if (isDraw(newBoard)) {
      setStatus("draw");
    }
  }, [status, board, thinking]);

  const cellStyle = (idx: number, cell: Cell) => {
    const isWinCell = winLine?.includes(idx);
    const base = "relative flex items-center justify-center text-5xl font-bold cursor-pointer select-none transition-all duration-200 rounded-2xl aspect-square ";
    if (cell === "X") return base + (isWinCell ? "bg-emerald-900/40 text-emerald-300 scale-105" : "bg-neutral-800 text-emerald-400 hover:bg-neutral-700");
    if (cell === "O") return base + (isWinCell ? "bg-red-900/40 text-red-300 scale-105" : "bg-neutral-800 text-red-400");
    return base + "bg-neutral-800/60 hover:bg-neutral-700/80 cursor-pointer text-neutral-600";
  };

  const shortAddr = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 font-mono">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-1">
          <span className="text-emerald-400">X</span>
          <span className="text-neutral-400"> vs </span>
          <span className="text-red-400">O</span>
        </h1>
        <p className="text-neutral-500 text-sm">on Base · {formatEth(GAME_FEE)} ETH per game · no refunds</p>
        {gamesPlayed > 0 && (
          <p className="text-neutral-600 text-xs mt-1">{gamesPlayed} game{gamesPlayed > 1 ? "s" : ""} played</p>
        )}
      </div>

      {/* Wallet */}
      <div className="mb-6 flex items-center gap-2">
        {account ? (
          <span className="text-xs bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 text-neutral-300">
            <span className="text-emerald-400">●</span> {shortAddr}
          </span>
        ) : (
          <button
            onClick={handleConnect}
            className="text-xs bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
          >
            Connect wallet
          </button>
        )}
        {isFarcaster && (
          <span className="text-xs bg-purple-900/40 border border-purple-700/40 rounded-full px-3 py-1 text-purple-300">
            Farcaster
          </span>
        )}
      </div>

      {/* Board */}
      <div className="w-full max-w-xs">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {board.map((cell, idx) => (
            <button
              key={idx}
              className={cellStyle(idx, cell)}
              onClick={() => handleCellClick(idx)}
              disabled={status !== "playing" || !!cell || thinking}
              aria-label={`Cell ${idx + 1}${cell ? `, ${cell}` : ""}`}
            >
              {cell === "X" && <span className="animate-in zoom-in-50 duration-150">X</span>}
              {cell === "O" && <span className="animate-in zoom-in-50 duration-150">O</span>}
              {!cell && status === "playing" && !thinking && (
                <span className="opacity-0 hover:opacity-30 transition-opacity text-white text-2xl">X</span>
              )}
            </button>
          ))}
        </div>

        {/* Status messages */}
        {status === "idle" && (
          <div className="text-center">
            <p className="text-neutral-400 text-sm mb-4">
              Pay <span className="text-white font-bold">{formatEth(GAME_FEE)} ETH</span> to play. Win or lose — no refunds.
            </p>
            <button
              onClick={handleStartGame}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors text-sm"
            >
              {account ? `Play for ${formatEth(GAME_FEE)} ETH` : "Connect & Play"}
            </button>
          </div>
        )}

        {status === "paying" && (
          <div className="text-center py-4">
            <div className="text-2xl mb-2 animate-spin inline-block">⏳</div>
            <p className="text-neutral-400 text-sm">Confirm transaction in your wallet…</p>
          </div>
        )}

        {status === "playing" && (
          <div className="text-center">
            {thinking ? (
              <p className="text-neutral-500 text-sm animate-pulse">AI is thinking…</p>
            ) : (
              <p className="text-neutral-500 text-sm">Your turn · you are <span className="text-emerald-400 font-bold">X</span></p>
            )}
          </div>
        )}

        {status === "won" && (
          <div className="text-center">
            <p className="text-emerald-400 text-2xl font-bold mb-1">You won! 🎉</p>
            <p className="text-neutral-500 text-xs mb-4">Nice move. Still no refund though.</p>
            <button onClick={handleStartGame} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors text-sm">
              Play again · {formatEth(GAME_FEE)} ETH
            </button>
          </div>
        )}

        {status === "lost" && (
          <div className="text-center">
            <p className="text-red-400 text-2xl font-bold mb-1">AI wins 🤖</p>
            <p className="text-neutral-500 text-xs mb-4">The machine is cold and emotionless.</p>
            <button onClick={handleStartGame} className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-xl transition-colors text-sm">
              Try again · {formatEth(GAME_FEE)} ETH
            </button>
          </div>
        )}

        {status === "draw" && (
          <div className="text-center">
            <p className="text-yellow-400 text-2xl font-bold mb-1">Draw 🤝</p>
            <p className="text-neutral-500 text-xs mb-4">You matched the machine. No refund.</p>
            <button onClick={handleStartGame} className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-xl transition-colors text-sm">
              Play again · {formatEth(GAME_FEE)} ETH
            </button>
          </div>
        )}

        {/* TX hash */}
        {txHash && (
          <div className="mt-4 text-center">
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              tx: {txHash.slice(0, 10)}…{txHash.slice(-6)} ↗
            </a>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 text-center">
            <p className="text-red-400 text-xs">{error}</p>
            <button onClick={() => setError(null)} className="text-neutral-600 text-xs mt-1 hover:text-neutral-400">dismiss</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-10 text-neutral-700 text-xs text-center">
        <p>built on Base · payments are final</p>
      </div>
    </div>
  );
}
