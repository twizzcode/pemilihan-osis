import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClockIcon, ShieldCheckIcon, VoteIcon } from "lucide-react";

import { VoterLoginForm } from "@/components/voter-login-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getVoterSession } from "@/lib/auth";
import { ensureDb } from "@/lib/db";
import { getActiveEvent, getEventPhase } from "@/lib/events";

export const metadata = { title: "Pemilihan Ketua OSIS" };
export const dynamic = "force-dynamic";

const phaseText = {
  open: "Pemilihan sedang dibuka. Silakan login untuk memilih.",
  scheduled: "Pemilihan belum dimulai. Cek kembali sesuai jadwal.",
  closed: "Pemilihan telah ditutup. Terima kasih atas partisipasinya!",
};

export default async function VoterLoginPage() {
  ensureDb();
  const existing = await getVoterSession();
  if (existing) redirect("/vote");

  const event = getActiveEvent();
  const phase = event ? getEventPhase(event) : null;

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/8 via-background to-chart-2/10 p-6">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(40rem 40rem at 10% -10%, var(--primary), transparent 60%), radial-gradient(30rem 30rem at 110% 110%, var(--chart-2), transparent 55%)",
          filter: "blur(120px)",
        }}
      />
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <VoteIcon className="size-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Pemilihan Ketua OSIS
            </h1>
            <p className="text-sm text-muted-foreground">
              {event
                ? event.name
                : "Belum ada pemilihan yang aktif saat ini."}
            </p>
          </div>
          {event && phase && (
            <Badge
              variant={phase === "open" ? "default" : "secondary"}
              className="gap-1.5"
            >
              <CalendarClockIcon className="size-3" />
              {phaseText[phase]}
            </Badge>
          )}
        </div>

        <Card className="border-border/60 shadow-xl shadow-primary/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Masuk sebagai Pemilih</CardTitle>
            <CardDescription>
              Masuk dengan NIS Anda. Setiap NIS hanya dapat memilih satu kali.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoterLoginForm disabled={!event || phase !== "open"} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheckIcon className="size-3.5" /> Satu NIS satu suara
          </span>
          <span className="text-border">•</span>
          <Link
            href="/admin/login"
            className="transition-colors hover:text-foreground"
          >
            Portal Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
