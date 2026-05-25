import type { Metadata } from "next";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tictactoe-base-five.vercel.app";

export const metadata: Metadata = {
  title: "Tic Tac Toe on Base",
  description: "Pay 0.0001 ETH, play tic tac toe vs AI. Win or lose — no refunds.",
  other: {
    "base:app_id": "6a147000ed0edcf2e9a87720",
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${APP_URL}/og.png`,
      button: {
        title: "Play for 0.0001 ETH",
        action: {
          type: "launch_frame",
          name: "Tic Tac Toe",
          url: APP_URL,
          splashImageUrl: `${APP_URL}/splash.png`,
          splashBackgroundColor: "#0a0a0a",
        },
      },
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
