"use client";

import { useTransition } from "react";
import { Loader2, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ConfirmDelete({
  title = "Hapus data ini?",
  description = "Tindakan ini tidak dapat dibatalkan.",
  action,
  label,
  compact = true,
}: {
  title?: string;
  description?: string;
  action: () => Promise<void>;
  label?: string;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await action();
        toast.success("Data berhasil dihapus.");
      } catch {
        toast.error("Gagal menghapus data.");
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            size={compact ? "icon-sm" : "default"}
            className={compact ? "" : "w-full"}
          />
        }
      >
        <Trash2Icon className="size-4" />
        {!compact && (label ?? "Hapus")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
