import { ShieldCheck } from "lucide-react";

export function ScoreRing({
  score,
  label,
  caption,
  size = "large",
}: {
  score: number;
  label: string;
  caption?: string;
  size?: "large" | "small";
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const isSmall = size === "small";

  return (
    <div className={`relative grid place-items-center ${isSmall ? "h-28 w-28" : "h-44 w-44"}`}>
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id={`score-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5ff1c8" />
            <stop offset="55%" stopColor="#77d9ff" />
            <stop offset="100%" stopColor="#ffcf66" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={radius} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="transparent"
          stroke={`url(#score-gradient-${size})`}
          strokeLinecap="round"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <ShieldCheck className="mx-auto mb-1 h-5 w-5 text-ghost-mint" aria-hidden="true" />
          <p className={`${isSmall ? "text-2xl" : "text-4xl"} font-semibold text-white`}>{score}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
          {caption ? <p className="mt-1 text-xs text-white/60">{caption}</p> : null}
        </div>
      </div>
    </div>
  );
}
