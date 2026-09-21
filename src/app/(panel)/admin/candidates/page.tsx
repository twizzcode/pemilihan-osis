import Link from "next/link";
import { CalendarRangeIcon, PlusIcon, TrophyIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { CandidateFormDialog } from "@/components/candidate-form-dialog";
import { CandidatePhoto } from "@/components/candidate-photo";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteCandidate } from "@/lib/actions/candidates";
import { getActiveEvent } from "@/lib/events";
import { listCandidates } from "@/lib/queries";
import type { TakenNumbers } from "@/lib/candidates";
import type { Candidate } from "@/lib/db/schema";

export const metadata = { title: "Paslon" };
export const dynamic = "force-dynamic";

function CandidateGrid({
  title,
  candidates,
  eventId,
  takenNumbers,
}: {
  title: string;
  candidates: Candidate[];
  eventId: number;
  takenNumbers: TakenNumbers;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold">{title}</h2>
        <Badge variant="secondary">{candidates.length} paslon</Badge>
      </div>
      {candidates.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada paslon {title.toLowerCase()}.
          </p>
          <CandidateFormDialog
            eventId={eventId}
            takenNumbers={takenNumbers}
            trigger={
              <Button variant="outline" size="sm">
                <PlusIcon className="size-4" /> Tambah Paslon
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {candidates.map((c) => (
            <Card key={c.id} className="overflow-hidden pt-0">
              <div className="relative">
                <CandidatePhoto
                  src={c.photoPath}
                  alt={c.chairName}
                  className="rounded-none"
                />
                <div className="absolute left-2 top-2 flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow">
                  {c.number}
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm leading-snug">
                  {c.chairName}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {c.viceName ? `& ${c.viceName}` : "Calon Ketua"}
                  {c.className ? ` · ${c.className}` : ""}
                </p>
              </CardHeader>
              <CardContent className="flex items-center gap-2 pt-0">
                <CandidateFormDialog
                  eventId={eventId}
                  candidate={c}
                  takenNumbers={takenNumbers}
                  trigger={
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                  }
                />
                <ConfirmDelete
                  title={`Hapus paslon No. ${c.number}?`}
                  description="Data paslon dan suara yang terkait akan terhapus permanen."
                  action={deleteCandidate.bind(null, c.id)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CandidatesPage() {
  const event = getActiveEvent();

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Paslon"
          description="Kelola pasangan calon ketua OSPA & OSPI."
        />
        <EmptyState
          icon={CalendarRangeIcon}
          title="Belum ada pemilihan aktif"
          description="Aktifkan pemilihan terlebih dahulu untuk mengelola paslon."
        >
          <Button nativeButton={false} render={<Link href="/admin/events" />}>
            Kelola Pemilihan
          </Button>
        </EmptyState>
      </div>
    );
  }

  const all = listCandidates(event.id);
  const male = all.filter((c) => c.gender === "male");
  const female = all.filter((c) => c.gender === "female");
  const takenNumbers: TakenNumbers = {
    male: male.map((c) => c.number),
    female: female.map((c) => c.number),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paslon"
        description={`Kelola pasangan calon untuk ${event.name}.`}
      >
        <CandidateFormDialog
          eventId={event.id}
          takenNumbers={takenNumbers}
          trigger={
            <Button>
              <PlusIcon className="size-4" /> Tambah Paslon
            </Button>
          }
        />
      </PageHeader>

      {all.length === 0 && (
        <EmptyState
          icon={TrophyIcon}
          title="Belum ada paslon"
          description="Tambahkan paslon putra dan putri beserta foto, visi, dan misinya."
        />
      )}

      <CandidateGrid
        title="Paslon Putra"
        candidates={male}
        eventId={event.id}
        takenNumbers={takenNumbers}
      />
      <CandidateGrid
        title="Paslon Putri"
        candidates={female}
        eventId={event.id}
        takenNumbers={takenNumbers}
      />
    </div>
  );
}
