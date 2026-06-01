import { FaAmazon } from "react-icons/fa";
import { SiFlipkart } from "react-icons/si";
import type { Platform } from "../types";

const brandStyles: Record<Platform, string> = {
  Amazon: "border-[#ff9900]/30 bg-[#ff9900]/12 text-[#ffb84d]",
  Flipkart: "border-[#2874f0]/35 bg-[#2874f0]/14 text-[#74a7ff]",
  Other: "border-white/10 bg-white/8 text-white/70",
};

export function MarketplaceLogo({
  platform,
  compact = false,
}: {
  platform: Platform;
  compact?: boolean;
}) {
  const Icon = platform === "Amazon" ? FaAmazon : platform === "Flipkart" ? SiFlipkart : null;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-semibold ${brandStyles[platform]} ${
        compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
      }`}
    >
      {Icon ? <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true" /> : null}
      {platform}
    </span>
  );
}
