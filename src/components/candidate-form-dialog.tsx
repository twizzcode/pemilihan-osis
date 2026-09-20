"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, ImagePlusIcon, Loader2, SaveIcon, XIcon } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CandidatePhoto } from "@/components/candidate-photo";
import { createCandidate, updateCandidate } from "@/lib/actions/candidates";
import { PHOTO_ACCEPT, validatePhotoFile } from "@/lib/photo";
import {
  CANDIDATE_NUMBERS,
  GENDER_LABELS,
  GENDER_OPTIONS,
  type TakenNumbers,
} from "@/lib/candidates";
import type { ActionState } from "@/lib/actions/auth";
import type { Candidate } from "@/lib/db/schema";

export function CandidateFormDialog({
  eventId,
  candidate,
  takenNumbers,
  trigger,
}: {
  eventId: number;
  candidate?: Candidate;
  takenNumbers?: TakenNumbers;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    candidate?.photoPath ?? null,
  );
  const [gender, setGender] = useState<"male" | "female">(
    candidate?.gender ?? "male",
  );
  const [number, setNumber] = useState<number | null>(candidate?.number ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Tracks the last action state we've already reacted to, so success is
  // handled exactly once even if the parent tree re-renders after
  // revalidation (which can otherwise "lose" the setOpen(false) call).
  const handledState = useRef<ActionState | null>(null);

  const action = candidate ? updateCandidate : createCandidate;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {},
  );

  // Numbers already used in the selected category. The candidate's own number
  // stays selectable when editing so it can be kept as-is.
  const disabledNumbers = useMemo(() => {
    const taken = new Set(takenNumbers?.[gender] ?? []);
    if (candidate) taken.delete(candidate.number);
    return taken;
  }, [takenNumbers, gender, candidate]);

  useEffect(() => {
    if (handledState.current === state) return;
    handledState.current = state;

    if (state.success) {
      toast.success(state.success);
      setOpen(false);
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  function resetPreview() {
    setPreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return candidate?.photoPath ?? null;
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      resetPreview();
      return;
    }

    const error = validatePhotoFile(file);
    if (error) {
      toast.error(error);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setPreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function resetForm() {
    resetPreview();
    setGender(candidate?.gender ?? "male");
    setNumber(candidate?.number ?? null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-4 py-4">
          <DialogTitle>
            {candidate ? "Edit Paslon" : "Tambah Paslon"}
          </DialogTitle>
          <DialogDescription>
            Lengkapi data paslon. Foto (JPG/PNG/WEBP, maks 5MB) otomatis
            dikompres ke WebP. Disarankan berukuran 3:4 (portrait).
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            if (number == null) {
              e.preventDefault();
              toast.error("Pilih nomor urut terlebih dahulu.");
            }
          }}
        >
          {candidate && <input type="hidden" name="id" value={candidate.id} />}
          {!candidate && (
            <input type="hidden" name="eventId" value={eventId} />
          )}

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <div className="space-y-2">
              <CandidatePhoto src={preview} alt="Preview" />
              <label className="block">
                <input
                  ref={fileRef}
                  type="file"
                  name="photo"
                  accept={PHOTO_ACCEPT}
                  className="hidden"
                  onChange={onFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImagePlusIcon className="size-4" /> Ganti Foto
                </Button>
              </label>
              {preview && preview.startsWith("blob:") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={resetPreview}
                >
                  <XIcon className="size-4" /> Batal
                </Button>
              )}
            </div>

            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="number">Nomor Urut</FieldLabel>
                  {/* The submitted value; the dropdown below sets it. */}
                  <input
                    type="hidden"
                    name="number"
                    value={number ?? ""}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      id="number"
                      className="flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-popup-open:bg-input/30 dark:bg-input/30 dark:hover:bg-input/50"
                      aria-invalid={!number ? true : undefined}
                    >
                      <span
                        className={
                          number
                            ? "truncate"
                            : "truncate text-muted-foreground"
                        }
                      >
                        {number ? `Nomor ${number}` : "Pilih nomor"}
                      </span>
                      <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {CANDIDATE_NUMBERS.map((n) => {
                        const isTaken = disabledNumbers.has(n);
                        return (
                          <DropdownMenuItem
                            key={n}
                            disabled={isTaken}
                            onClick={() => setNumber(n)}
                            className="justify-between"
                          >
                            <span>Nomor {n}</span>
                            {isTaken ? (
                              <span className="text-xs text-muted-foreground">
                                terpakai
                              </span>
                            ) : (
                              number === n && <CheckIcon className="size-4" />
                            )}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Field>
                <Field>
                  <FieldLabel htmlFor="gender">Kategori</FieldLabel>
                  {/* The submitted value; the dropdown below sets it. */}
                  <input type="hidden" name="gender" value={gender} />
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      id="gender"
                      className="flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-popup-open:bg-input/30 dark:bg-input/30 dark:hover:bg-input/50"
                    >
                      <span className="truncate">
                        {GENDER_LABELS[gender]}
                      </span>
                      <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {GENDER_OPTIONS.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() => {
                            const next = opt.value;
                            setGender(next);
                            // Clear a number that is already used in the new category.
                            if (
                              number != null &&
                              (takenNumbers?.[next] ?? []).includes(number) &&
                              number !== candidate?.number
                            ) {
                              setNumber(null);
                            }
                          }}
                          className="justify-between"
                        >
                          <span>{opt.label}</span>
                          {gender === opt.value && (
                            <CheckIcon className="size-4" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="chairName">Nama Ketua</FieldLabel>
                <Input
                  id="chairName"
                  name="chairName"
                  defaultValue={candidate?.chairName}
                  placeholder="Nama lengkap calon ketua"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="viceName">Nama Wakil (opsional)</FieldLabel>
                <Input
                  id="viceName"
                  name="viceName"
                  defaultValue={candidate?.viceName ?? ""}
                  placeholder="Nama lengkap calon wakil"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="className">Kelas (opsional)</FieldLabel>
                <Input
                  id="className"
                  name="className"
                  defaultValue={candidate?.className ?? ""}
                  placeholder="Contoh: XI IPA 2"
                />
              </Field>
            </FieldGroup>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="vision">Visi</FieldLabel>
              <Textarea
                id="vision"
                name="vision"
                defaultValue={candidate?.vision ?? ""}
                rows={2}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="missions">Misi</FieldLabel>
              <Textarea
                id="missions"
                name="missions"
                defaultValue={candidate?.missions ?? ""}
                rows={3}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="programs">Program Kerja</FieldLabel>
              <Textarea
                id="programs"
                name="programs"
                defaultValue={candidate?.programs ?? ""}
                rows={3}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">
                Deskripsi Tambahan (opsional)
              </FieldLabel>
              <Textarea
                id="description"
                name="description"
                defaultValue={candidate?.description ?? ""}
                rows={2}
              />
            </Field>
          </FieldGroup>
          </div>

          <DialogFooter className="mx-0 mb-0 border-t px-4 py-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending || number == null}>
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
