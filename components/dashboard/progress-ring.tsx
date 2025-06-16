"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  compact?: boolean;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 12,
  compact = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Círculo de fundo */}
        <circle
          className="stroke-muted"
          fill="none"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Círculo de progresso */}
        <circle
          className="stroke-primary transition-all duration-300 ease-in-out"
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div
        className={cn(
          "absolute flex flex-col items-center justify-center text-center",
          compact && "scale-90"
        )}
      >
        <span
          className={cn(
            "font-bold text-primary",
            compact ? "text-sm" : "text-3xl"
          )}
        >
          {progress}%
        </span>
        {!compact && (
          <span className="text-sm text-muted-foreground">Concluído</span>
        )}
      </div>
    </div>
  );
}
