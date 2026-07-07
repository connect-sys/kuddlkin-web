import { Nunito } from "next/font/google";
import localFont from "next/font/local";

// Soft, rounded body typeface — pairs with the Kuddl brand display font.
export const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

// Kuddl proprietary brand display font (bundled, self-hosted).
export const adineue = localFont({
  src: "../assets/fonts/adineue-PRO.ttf",
  variable: "--font-adineue",
  display: "swap",
});
