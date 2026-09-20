import { TrophyIcon } from "lucide-react";

import { CandidatePhoto } from "@/components/candidate-photo";
import { cn } from "@/lib/utils";
import type { TallyRow } from "@/lib/queries";

export function ResultsTally({
  data,
  total,
}: {
  data: TallyRow[];
  total: number;
}) {
  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Belum ada paslon.
      </p>
    );
  }

  const sorted = [...data].sort((a, b) => b.total - a.total);
  const max = Math.max(...data.map((d) => d.total), 1);
  const topId = sorted[0]?.total > 0 ? sorted[0]?.candidateId : null;

  return (
    <ul className="space-y-5">
      {sorted.map((row) => {
        const pct = total ? Math.round((row.total / total) * 100) : 0;
        const isTop = row.candidateId === topId;
        return (
          <li key={row.candidateId} className="flex items-center gap-3">
            <div className="relative w-12 shrink-0">
              <CandidatePhoto
                src={row.photoPath}
                alt={row.chairName}
                compact
              />
              <span className="absolute -bottom-1.5 -right-1.5 flex size-5 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground shadow ring-2 ring-background">
                {row.number}
              </span>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium">
                  {row.chairName}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {row.gender === "male" ? "Putra" : "Putri"}
                </span>
                {isTop && (
                  <TrophyIcon className="size-3.5 shrink-0 text-chart-2" />
                )}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    row.gender === "male" ? "bg-primary" : "bg-chart-2",
                  )}
                  style={{ width: `${(row.total / max) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-16 shrink-0 text-right">
              <p className="font-semibold tabular-nums">{row.total}</p>
              <p className="text-xs text-muted-foreground">{pct}%</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
