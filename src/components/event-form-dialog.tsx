"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, SaveIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createEvent, updateEvent } from "@/lib/actions/events";
import type { ActionState } from "@/lib/actions/auth";
import type { Event } from "@/lib/db/schema";

function toLocalInput(date: Date | null) {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function EventFormDialog({
  event,
  trigger,
}: {
  event?: Event;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const action = event ? updateEvent : createEvent;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {},
  );

  useEffect(() => {
    if (state.success && open) {
      toast.success(state.success);
      setOpen(false);
    }
    if (state.error) toast.error(state.error);
  }, [state, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {event ? "Edit Pemilihan" : "Buat Pemilihan Baru"}
          </DialogTitle>
          <DialogDescription>
            Atur nama, deskripsi, dan jadwal buka/tutup pemilihan.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {event && <input type="hidden" name="id" value={event.id} />}
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nama Pemilihan</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={event?.name}
                placeholder="Contoh: Pemilihan Ketua OSPA & OSPI 2025/2026"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Deskripsi (opsional)</FieldLabel>
              <Textarea
                id="description"
                name="description"
                defaultValue={event?.description ?? ""}
                placeholder="Keterangan singkat tentang pemilihan ini."
                rows={2}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="startAt">Mulai</FieldLabel>
                <Input
                  id="startAt"
                  name="startAt"
                  type="datetime-local"
                  defaultValue={toLocalInput(event?.startAt ?? null)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="endAt">Selesai</FieldLabel>
                <Input
                  id="endAt"
                  name="endAt"
                  type="datetime-local"
                  defaultValue={toLocalInput(event?.endAt ?? null)}
                />
              </Field>
            </div>
            {event && (
              <Field>
                <FieldLabel htmlFor="mode">Status Manual</FieldLabel>
                <Select name="mode" defaultValue={event.mode}>
                  <SelectTrigger id="mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      Otomatis (ikut jadwal)
                    </SelectItem>
                    <SelectItem value="open">Paksa Dibuka</SelectItem>
                    <SelectItem value="closed">Paksa Ditutup</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </FieldGroup>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <SaveIcon className="size-4" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
