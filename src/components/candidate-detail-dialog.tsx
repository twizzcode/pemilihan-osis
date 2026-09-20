"use client";

import {
  CheckCircle2Icon,
  ListChecksIcon,
  SparklesIcon,
  TargetIcon,
  VoteIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CandidatePhoto } from "@/components/candidate-photo";
import type { Candidate } from "@/lib/db/schema";

function Section({
  icon: Icon,
  title,
  content,
}: {
  icon: typeof TargetIcon;
  title: string;
  content: string | null;
}) {
  if (!content) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {content}
      </p>
    </div>
  );
}

export function CandidateDetailDialog({
  candidate,
  open,
  onOpenChange,
  onVote,
}: {
  candidate: Candidate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVote?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        <div className="grid gap-0 sm:grid-cols-[minmax(0,240px)_1fr]">
          <div className="relative p-4 sm:p-5">
            <CandidatePhoto src={candidate.photoPath} alt={candidate.chairName} />
            <div className="mt-3 hidden rounded-xl bg-muted/50 p-3 text-center sm:block">
              <p className="text-xs text-muted-foreground">Nomor Urut</p>
              <p className="text-3xl font-bold text-primary">
                {candidate.number}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            <DialogHeader className="gap-1 text-left">
              <div className="flex items-center gap-2">
                <Badge className="sm:hidden">No. {candidate.number}</Badge>
                <Badge variant="secondary">
                  {candidate.gender === "male" ? "Paslon Putra" : "Paslon Putri"}
                </Badge>
              </div>
              <DialogTitle className="text-xl">{candidate.chairName}</DialogTitle>
              <DialogDescription>
                {candidate.viceName
                  ? `Calon Wakil: ${candidate.viceName}`
                  : "Calon Ketua"}
                {candidate.className ? ` · ${candidate.className}` : ""}
              </DialogDescription>
            </DialogHeader>

            <Separator />

            <div className="space-y-5">
              <Section
                icon={TargetIcon}
                title="Visi"
                content={candidate.vision}
              />
              <Section
                icon={ListChecksIcon}
                title="Misi"
                content={candidate.missions}
              />
              <Section
                icon={SparklesIcon}
                title="Program Kerja"
                content={candidate.programs}
              />
              <Section
                icon={CheckCircle2Icon}
                title="Informasi Tambahan"
                content={candidate.description}
              />
            </div>

            {onVote && (
              <Button className="mt-2 w-full" onClick={onVote}>
                <VoteIcon className="size-4" /> Pilih Paslon Ini
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
