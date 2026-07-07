import { PartyPopper, Sparkles, Heart, Search, type LucideIcon } from "lucide-react";

/**
 * The four Kuddl Kin modules — the heart of the customer offering.
 * Listed alphabetically: Adventure, Bloom, Care, Discover.
 * `upperKey` is the id used in API filters (?module=ADVENTURE).
 */
export type ModuleKey = "adventure" | "bloom" | "care" | "discover";

export interface KuddlModule {
  key: ModuleKey;
  upperKey: string;
  label: string;
  tagline: string;
  description: string;
  color: string;
  soft: string;
  gradient: [string, string];
  Icon: LucideIcon;
  iconSrc?: string;
  emoji: string;
}

export const MODULES: KuddlModule[] = [
  {
    key: "adventure",
    upperKey: "ADVENTURE",
    label: "Adventure",
    tagline: "Parties & celebrations",
    description: "Kids' parties, events & unforgettable celebration experiences.",
    color: "#FB5261",
    soft: "#FFF0F1",
    gradient: ["#FC6273", "#F84455"],
    Icon: PartyPopper,
    iconSrc: "/brand/adventure.svg",
    emoji: "🎉",
  },
  {
    key: "bloom",
    upperKey: "BLOOM",
    label: "Bloom",
    tagline: "Learn & grow",
    description: "Learning, sports & developmental classes that help kids flourish.",
    color: "#F59762",
    soft: "#FEF4EE",
    gradient: ["#F7A976", "#F08A55"],
    Icon: Sparkles,
    iconSrc: "/brand/bloom.svg",
    emoji: "🌱",
  },
  {
    key: "care",
    upperKey: "CARE",
    label: "Care",
    tagline: "Trusted childcare",
    description: "Childcare, at-home services & wellbeing support you can rely on.",
    color: "#00B6AA",
    soft: "#E8F9F8",
    gradient: ["#00C4B8", "#00A89D"],
    Icon: Heart,
    iconSrc: "/brand/care.svg",
    emoji: "💚",
  },
  {
    key: "discover",
    upperKey: "DISCOVER",
    label: "Discover",
    tagline: "Camps & workshops",
    description: "Workshops, camps & community experiences to explore and discover.",
    color: "#9895EE",
    soft: "#F3F2FC",
    gradient: ["#ABA8F0", "#8B88EA"],
    Icon: Search,
    emoji: "🧭",
  },
];

export const getModule = (key?: string | null): KuddlModule | undefined => {
  if (!key) return undefined;
  const k = key.toLowerCase();
  return MODULES.find((m) => m.key === k || m.upperKey === key);
};
