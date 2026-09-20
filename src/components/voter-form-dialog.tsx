"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  Loader2,
  SaveIcon,
  UploadIcon,
} from "lucide-react";
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
import {
  createVoter,
  importVotersCsv,
  updateVoter,
  type ImportResult,
} from "@/lib/actions/voters";
import type { ActionState } from "@/lib/actions/auth";
import type { Voter } from "@/lib/db/schema";

export function VoterFormDialog({
  eventId,
  voter,
  trigger,
}: {
  eventId: number;
  voter?: Voter;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState<"male" | "female">(
    voter?.gender ?? "male",
  );
  const action = voter ? updateVoter : createVoter;
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {voter ? "Edit Pemilih" : "Tambah Pemilih"}
          </DialogTitle>
          <DialogDescription>
            NIS digunakan untuk validasi saat pemilih login.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {voter ? (
            <input type="hidden" name="id" value={voter.id} />
          ) : (
            <input type="hidden" name="eventId" value={eventId} />
          )}
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nis">NIS</FieldLabel>
              <Input
                id="nis"
                name="nis"
                defaultValue={voter?.nis}
                placeholder="Nomor Induk Siswa"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fullName">Nama Lengkap</FieldLabel>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={voter?.fullName}
                placeholder="Nama lengkap siswa"
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="className">Kelas</FieldLabel>
                <Input
                  id="className"
                  name="className"
                  defaultValue={voter?.className ?? ""}
                  placeholder="XI IPA 2"
                />
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
                      {gender === "male" ? "Putra" : "Putri"}
                    </span>
                    <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className="justify-between"
                      onClick={() => setGender("male")}
                    >
                      <span>Putra</span>
                      {gender === "male" && <CheckIcon className="size-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="justify-between"
                      onClick={() => setGender("female")}
                    >
                      <span>Putri</span>
                      {gender === "female" && <CheckIcon className="size-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Field>
            </div>
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

/** Rows for the downloadable Excel template (header + examples). */
const TEMPLATE_ROWS: (string | number)[][] = [
  ["NIS", "Nama", "Kelas", "Gender"],
  ["12345", "Ahmad Fauzi", "XI IPA 1", "L"],
  ["12346", "Siti Aminah", "XI IPS 2", "P"],
  ["12347", "Budi Santoso", "X IPA 3", "L"],
  ["12348", "Dewi Lestari", "XI IPS 1", "P"],
];

const FILE_ACCEPT = ".csv,.txt,.xlsx,.xls,text/csv,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function VoterImportDialog({
  eventId,
  trigger,
}: {
  eventId: number;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState<
    ImportResult,
    FormData
  >(importVotersCsv, {});

  useEffect(() => {
    if (state.success && open) {
      toast.success(state.success);
      setOpen(false);
      setCsv("");
      setFileName(null);
    }
    if (state.error) toast.error(state.error);
  }, [state, open]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const isExcel = /\.xlsx?$/i.test(file.name);
    try {
      let text: string;
      if (isExcel) {
        // Loaded on demand so the spreadsheet lib stays out of the page bundle.
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error("empty");
        const sheet = workbook.Sheets[sheetName];
        // Convert the first sheet to CSV text for the shared import flow.
        text = XLSX.utils.sheet_to_csv(sheet);
      } else {
        text = await file.text();
      }

      if (!text.trim()) {
        toast.error("File kosong atau tidak berisi data yang bisa dibaca.");
        return;
      }

      setCsv(text);
      setFileName(file.name);
      toast.success(`File "${file.name}" dimuat. Periksa lalu klik Import.`);
    } catch {
      toast.error("Gagal membaca file. Pastikan formatnya CSV atau Excel.");
    }
  }

  async function downloadTemplate() {
    // Loaded on demand so the (large) spreadsheet lib stays out of the page bundle.
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.aoa_to_sheet(TEMPLATE_ROWS);
    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 24 },
      { wch: 14 },
      { wch: 10 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pemilih");
    XLSX.writeFile(workbook, "contoh-data-pemilih.xlsx");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Data Pemilih</DialogTitle>
          <DialogDescription>
            Unggah file Excel (.xlsx/.xls) atau CSV, atau tempel data langsung.
            Format kolom: <b>NIS, Nama, Kelas, Gender</b>. Satu baris per siswa.
            Unduh contoh Excel untuk memulai.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="eventId" value={eventId} />
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-foreground/10">
                <FileSpreadsheetIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {fileName ?? "Belum ada file dipilih"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Format didukung: .xlsx, .xls, .csv, atau .txt
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="size-4" />
                Pilih File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={FILE_ACCEPT}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Belum punya formatnya? Unduh contoh Excel di samping.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={downloadTemplate}
              >
                <DownloadIcon className="size-4" />
                Unduh Contoh (xlsx)
              </Button>
            </div>
          </div>

          <Field>
            <FieldLabel htmlFor="csv">Data CSV</FieldLabel>
            <Textarea
              id="csv"
              name="csv"
              rows={8}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              placeholder={"NIS,Nama,Kelas,Gender\n12345,Ahmad Fauzi,XI IPA 1,L"}
              className="font-mono text-xs"
              required
            />
          </Field>
          <Alert>
            <AlertDescription>
              Contoh baris:{" "}
              <code className="text-xs">12345, Ahmad Fauzi, XI IPA 1, L</code>
              {" · "}
              gender bisa L/P, Putra/Putri, atau male/female. NIS yang sudah
              terdaftar akan otomatis dilewati.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending || !csv.trim()}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UploadIcon className="size-4" />
              )}
              Import
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
