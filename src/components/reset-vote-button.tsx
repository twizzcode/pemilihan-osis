"use client";

import { useTransition } from "react";
import { Loader2, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { resetVoterVote } from "@/lib/actions/voters";

export function ResetVoteButton({ voterId }: { voterId: number }) {
  const [pending, startTransition] = useTransition();

  function handleReset() {
    startTransition(async () => {
      try {
        await resetVoterVote(voterId);
        toast.success("Status pilih berhasil direset.");
      } catch {
        toast.error("Gagal mereset status.");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReset}
      disabled={pending}
      title="Batalkan suara pemilih ini"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RotateCcwIcon className="size-4" />
      )}
    </Button>
  );
}
