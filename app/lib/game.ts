export type Cell = "X" | "O" | null;
export type Board = Cell[];
export type GameStatus = "idle" | "paying" | "playing" | "won" | "lost" | "draw";

export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWinner(board: Board): { winner: Cell; line: number[] | null } {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every((c) => c !== null)) return { winner: null, line: null };
  return { winner: null, line: null };
}

export function isDraw(board: Board): boolean {
  return board.every((c) => c !== null) && !checkWinner(board).winner;
}

// Minimax AI — unbeatable
function minimax(board: Board, isMax: boolean, depth: number): number {
  const { winner } = checkWinner(board);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (isDraw(board)) return 0;

  const scores: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = isMax ? "O" : "X";
      scores.push(minimax(board, !isMax, depth + 1));
      board[i] = null;
    }
  }
  return isMax ? Math.max(...scores) : Math.min(...scores);
}

export function getBestMove(board: Board): number {
  let best = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      const score = minimax(board, false, 0);
      board[i] = null;
      if (score > best) { best = score; move = i; }
    }
  }
  return move;
}

export function emptyBoard(): Board {
  return Array(9).fill(null);
}
