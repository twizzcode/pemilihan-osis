import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarRangeIcon,
  CheckCircle2Icon,
  ClockIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { ResultsChart } from "@/components/results-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { getActiveEvent, getEventPhase } from "@/lib/events";
import {
  getEventStats,
  listRecentVotes,
  tallyVotes,
} from "@/lib/queries";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const phaseLabel: Record<string, string> = {
  open: "Dibuka",
  closed: "Ditutup",
  scheduled: "Terjadwal",
};

export default async function AdminDashboardPage() {
  const event = getActiveEvent();

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Ringkasan pemilihan ketua OSPA & OSPI."
        />
        <EmptyState
          icon={CalendarRangeIcon}
          title="Belum ada pemilihan aktif"
          description="Buat pemilihan baru dan set sebagai aktif untuk mulai memantau hasil."
        >
          <Button nativeButton={false} render={<Link href="/admin/events" />}>
            Buat Pemilihan <ArrowRightIcon className="size-4" />
          </Button>
        </EmptyState>
      </div>
    );
  }

  const stats = getEventStats(event.id);
  const tally = tallyVotes(event.id);
  const recent = listRecentVotes(event.id, 8);
  const phase = getEventPhase(event);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Ringkasan untuk ${event.name}.`}
      >
        <Badge
          variant={phase === "open" ? "default" : "secondary"}
          className="gap-1"
        >
          <span
            className={`size-1.5 rounded-full ${
              phase === "open" ? "bg-primary-foreground" : "bg-muted-foreground"
            }`}
          />
          {phaseLabel[phase]}
        </Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Pemilih"
          value={stats.totalVoters}
          hint={`${stats.maleVoters} putra · ${stats.femaleVoters} putri`}
          icon={UsersIcon}
        />
        <StatCard
          label="Sudah Memilih"
          value={stats.totalVoted}
          hint={`${stats.totalBallots} surat suara masuk`}
          icon={CheckCircle2Icon}
          tone="violet"
        />
        <StatCard
          label="Belum Memilih"
          value={stats.totalPending}
          hint="Menunggu menggunakan hak pilih"
          icon={ClockIcon}
          tone="amber"
        />
        <StatCard
          label="Partisipasi"
          value={`${stats.totalVoters ? Math.round((stats.totalVoted / stats.totalVoters) * 100) : 0}%`}
          hint={`${
            stats.totalVoters - stats.totalVoted
          } siswa belum memilih`}
          icon={TrophyIcon}
          tone="sky"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Perolehan Suara</CardTitle>
            <CardDescription>
              Jumlah suara per paslon pada pemilihan aktif.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResultsChart data={tally} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Partisipasi per Kategori</CardTitle>
            <CardDescription>Putra vs Putri.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                label: "Putra",
                voted: stats.maleVoted,
                total: stats.maleVoters,
                color: "bg-primary",
              },
              {
                label: "Putri",
                voted: stats.femaleVoted,
                total: stats.femaleVoters,
                color: "bg-chart-2",
              },
            ].map((row) => {
              const pct = row.total
                ? Math.round((row.voted / row.total) * 100)
                : 0;
              return (
                <div key={row.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-muted-foreground">
                      {row.voted}/{row.total} · {pct}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${row.color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              Total surat suara yang masuk:{" "}
              <b className="text-foreground">{stats.totalBallots}</b>. Setiap
              NIS hanya dapat memilih satu kali.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>8 suara terakhir yang masuk.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/results" />}
          >
            Lihat semua
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada suara yang masuk.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pemilih</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Pilihan</TableHead>
                  <TableHead className="text-right">Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {row.voterName}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {row.nis}
                      </span>
                    </TableCell>
                    <TableCell>{row.className ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {row.gender === "male" ? "Putra" : "Putri"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      No. {row.candidateNumber} — {row.chairName}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {row.votedAt
                        ? new Date(row.votedAt).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
