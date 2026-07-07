import { cn } from "@/lib/utils";
import type { KuddlModule } from "@/lib/modules";

/**
 * Single source of truth for a Kuddl Kin module icon. Uses the lucide glyph for
 * each module (the same icon set kuddl-customer-web maps in kuddlKinModules:
 * Adventure→PartyPopper, Bloom→Sparkles, Care→Heart, Discover→Search).
 *
 * Renders in `currentColor` so it's always visible and matches the surrounding
 * label — on white chips, on coloured/active chips, and on the dark footer.
 * (The brand SVG glyphs are white-filled and only show on coloured cards, so
 * they can't be used inline.)
 */
export function ModuleIcon({
  module,
  className,
}: {
  module: KuddlModule;
  className?: string;
}) {
  const Icon = module.Icon;
  return <Icon className={cn("shrink-0", className)} />;
}
