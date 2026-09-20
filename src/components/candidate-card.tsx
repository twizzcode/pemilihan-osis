"use client";

import { useState, useTransition } from "react";
import { EyeIcon, Loader2, VoteIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CandidateDetailDialog } from "@/components/candidate-detail-dialog";
import { CandidatePhoto } from "@/components/candidate-photo";
import { submitVote } from "@/lib/actions/vote";
import type { Candidate } from "@/lib/db/schema";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await submitVote(candidate.id);
      if (result?.error) {
        toast.error(result.error);
        setConfirmOpen(false);
      }
    });
  }

  return (
    <>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
        <div className="relative">
          <CandidatePhoto
            src={candidate.photoPath}
            alt={candidate.chairName}
            className="rounded-none rounded-t-2xl"
          />
          <div className="absolute left-3 top-3 flex size-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-lg">
            {candidate.number}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold leading-tight">
              {candidate.chairName}
            </h3>
            {candidate.viceName && (
              <p className="text-sm text-muted-foreground">
                &amp; {candidate.viceName}
              </p>
            )}
            {candidate.className && (
              <Badge variant="secondary" className="mt-1">
                {candidate.className}
              </Badge>
            )}
          </div>

          {candidate.vision ? (
            <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
              {candidate.vision}
            </p>
          ) : (
            <p className="min-h-10 text-sm italic text-muted-foreground/60">
              Visi belum diisi.
            </p>
          )}

          <div className="mt-auto flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setDetailOpen(true)}
            >
              <EyeIcon className="size-4" /> Visi & Misi
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setConfirmOpen(true)}
              disabled={pending}
            >
              <VoteIcon className="size-4" /> Pilih
            </Button>
          </div>
        </div>
      </div>

      <CandidateDetailDialog
        candidate={candidate}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onVote={() => {
          setDetailOpen(false);
          setConfirmOpen(true);
        }}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pilihan</DialogTitle>
            <DialogDescription>
              Pastikan pilihan Anda sudah benar. Suara tidak dapat diubah setelah
              dikirim.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
              {candidate.number}
            </div>
            <div>
              <p className="font-semibold">
                {candidate.chairName}
                {candidate.viceName ? ` & ${candidate.viceName}` : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                Paslon Nomor Urut {candidate.number}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button onClick={handleConfirm} disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <VoteIcon className="size-4" />
              )}
              Kirim Suara
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
