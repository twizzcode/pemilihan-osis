import {
  CalendarRangeIcon,
  CheckCircle2Icon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { EventFormDialog } from "@/components/event-form-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteEvent, setActiveEvent } from "@/lib/actions/events";
import { getEventPhase, listEvents } from "@/lib/events";

export const metadata = { title: "Pemilihan" };
export const dynamic = "force-dynamic";

const phaseLabel = {
  open: "Dibuka",
  closed: "Ditutup",
  scheduled: "Terjadwal",
} as const;

export default function EventsPage() {
  const events = listEvents();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pemilihan"
        description="Kelola event pemilihan. Hanya satu pemilihan yang aktif pada satu waktu."
      >
        <EventFormDialog
          trigger={
            <Button>
              <PlusIcon className="size-4" /> Pemilihan Baru
            </Button>
          }
        />
      </PageHeader>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarRangeIcon}
          title="Belum ada pemilihan"
          description="Buat pemilihan pertama Anda untuk mulai menambahkan paslon dan data pemilih."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const phase = getEventPhase(event);
            return (
              <Card
                key={event.id}
                className={
                  event.isActive ? "border-primary/50 shadow-primary/5" : ""
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {event.name}
                    </CardTitle>
                    {event.isActive ? (
                      <Badge className="shrink-0 gap-1">
                        <CheckCircle2Icon className="size-3" /> Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="shrink-0">
                        {phaseLabel[phase]}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 min-h-10">
                    {event.description || "Tanpa deskripsi."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Mulai</span>
                      <span className="text-foreground">
                        {event.startAt
                          ? new Date(event.startAt).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Selesai</span>
                      <span className="text-foreground">
                        {event.endAt
                          ? new Date(event.endAt).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <EventFormDialog
                      event={event}
                      trigger={
                        <Button variant="outline" size="sm" className="flex-1">
                          <PencilIcon className="size-4" /> Edit
                        </Button>
                      }
                    />
                    {!event.isActive && (
                      <form
                        action={setActiveEvent.bind(null, event.id)}
                        className="flex-1"
                      >
                        <Button
                          type="submit"
                          variant="secondary"
                          size="sm"
                          className="w-full"
                        >
                          Aktifkan
                        </Button>
                      </form>
                    )}
                    <ConfirmDelete
                      title="Hapus pemilihan ini?"
                      description="Semua data paslon, pemilih, dan suara pada pemilihan ini akan ikut terhapus. Tindakan ini tidak bisa dibatalkan."
                      action={deleteEvent.bind(null, event.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
