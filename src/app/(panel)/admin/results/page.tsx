import Link from "next/link";
import {
  BarChart3Icon,
  CalendarRangeIcon,
  CheckCircle2Icon,
  ClockIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { ResultsChart } from "@/components/results-chart";
import { ResultsTally } from "@/components/results-tally";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getActiveEvent } from "@/lib/events";
import { getEventStats, listVoters, tallyVotes } from "@/lib/queries";

export const metadata = { title: "Hasil & Rekap" };
export const dynamic = "force-dynamic";

export default function ResultsPage() {
  const event = getActiveEvent();

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Hasil & Rekap"
          description="Rekapitulasi perolehan suara."
        />
        <EmptyState
          icon={CalendarRangeIcon}
          title="Belum ada pemilihan aktif"
          description="Aktifkan pemilihan untuk melihat rekapitulasi hasil."
        >
          <Button nativeButton={false} render={<Link href="/admin/events" />}>Kelola Pemilihan</Button>
        </EmptyState>
      </div>
    );
  }

  const stats = getEventStats(event.id);
  const tally = tallyVotes(event.id);
  const voters = listVoters(event.id);
  const pendingVoters = voters.filter((v) => !v.hasVoted);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hasil & Rekap"
        description={`Rekapitulasi suara untuk ${event.name}.`}
      >
        <Badge variant="secondary" className="gap-1">
          <TrendingUpIcon className="size-3" /> Total {stats.totalBallots} suara
        </Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Suara"
          value={stats.totalBallots}
          icon={BarChart3Icon}
        />
        <StatCard
          label="Sudah Memilih"
          value={stats.totalVoted}
          hint={`dari ${stats.totalVoters} pemilih`}
          icon={CheckCircle2Icon}
          tone="violet"
        />
        <StatCard
          label="Belum Memilih"
          value={stats.totalPending}
          icon={ClockIcon}
          tone="amber"
        />
        <StatCard
          label="Partisipasi"
          value={`${stats.totalVoters ? Math.round((stats.totalVoted / stats.totalVoters) * 100) : 0}%`}
          icon={UsersIcon}
          tone="sky"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grafik Perolehan Suara</CardTitle>
            <CardDescription>
              Perbandingan suara antar paslon. Label{" "}
              <b className="text-foreground">P</b> = Putra,{" "}
              <b className="text-foreground">W</b> = Putri.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResultsChart data={tally} />
            <div className="flex items-center justify-center gap-5 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-primary" /> Paslon Putra
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-[var(--chart-2)]" />{" "}
                Paslon Putri
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Peringkat Suara</CardTitle>
            <CardDescription>
              Diurutkan berdasarkan jumlah suara terbanyak.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResultsTally data={tally} total={stats.totalBallots} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pemilih yang Belum Memilih</CardTitle>
          <CardDescription>
            {pendingVoters.length} siswa belum menggunakan hak pilih.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingVoters.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              🎉 Semua pemilih sudah menggunakan hak pilihnya!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pendingVoters.map((v) => (
                <Badge
                  key={v.id}
                  variant="outline"
                  className="gap-1.5 py-1 font-normal"
                >
                  {v.fullName}
                  <span className="text-muted-foreground">
                    {v.className ? `· ${v.className}` : ""}
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
