import { redirect } from "next/navigation";
import { LogOutIcon, VoteIcon } from "lucide-react";

import { CandidateCard } from "@/components/candidate-card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getVoterSession } from "@/lib/auth";
import { logoutVoter } from "@/lib/actions/vote";
import { getActiveEvent, getEventPhase } from "@/lib/events";
import { listCandidates } from "@/lib/queries";

export const metadata = { title: "Bilik Suara" };
export const dynamic = "force-dynamic";

export default async function VotePage() {
  const session = await getVoterSession();
  if (!session) redirect("/");

  const event = getActiveEvent();
  if (!event || event.id !== session.eventId) redirect("/");
  if (getEventPhase(event) !== "open") redirect("/");

  const candidates = listCandidates(event.id, session.gender);

  return (
    <div className="min-h-svh bg-gradient-to-b from-primary/5 via-background to-chart-2/8">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="space-y-0.5">
            <p className="text-sm text-muted-foreground">{event.name}</p>
            <h1 className="text-lg font-semibold">Halo, {session.fullName}</h1>
          </div>
          <form action={logoutVoter}>
            <Button variant="outline" size="sm" type="submit">
              <LogOutIcon className="size-4" /> Keluar
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
        <div className="space-y-2 text-center">
          <Badge variant="secondary" className="mx-auto">
            {session.gender === "male" ? "Kategori Putra" : "Kategori Putri"}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Pilih Ketua OSPA &amp; OSPI Pilihanmu
          </h2>
          <p className="mx-auto max-w-lg text-sm text-muted-foreground">
            Pelajari visi & misi setiap paslon, lalu tekan tombol{" "}
            <b className="text-foreground">Pilih</b>. Pilihan tidak dapat diubah
            setelah dikirim.
          </p>
        </div>

        {candidates.length === 0 ? (
          <EmptyState
            icon={VoteIcon}
            title="Belum ada paslon untuk kategori Anda"
            description="Silakan hubungi panitia pemilihan untuk informasi lebih lanjut."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
