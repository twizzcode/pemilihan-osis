"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, SearchIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { VoterFormDialog } from "@/components/voter-form-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { ResetVoteButton } from "@/components/reset-vote-button";
import { deleteVoter, deleteVoters } from "@/lib/actions/voters";
import type { Voter } from "@/lib/db/schema";

type Filter = "all" | "voted" | "pending";

export function VotersTable({
  voters,
  eventId,
}: {
  voters: Voter[];
  eventId: number;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return voters.filter((v) => {
      if (filter === "voted" && !v.hasVoted) return false;
      if (filter === "pending" && v.hasVoted) return false;
      if (!q) return true;
      return (
        v.fullName.toLowerCase().includes(q) ||
        v.nis.toLowerCase().includes(q) ||
        (v.className ?? "").toLowerCase().includes(q)
      );
    });
  }, [voters, query, filter]);

  const counts = useMemo(
    () => ({
      all: voters.length,
      voted: voters.filter((v) => v.hasVoted).length,
      pending: voters.filter((v) => !v.hasVoted).length,
    }),
    [voters],
  );

  // Drop selections that are no longer visible (e.g. after search/filter or
  // when the underlying list changes after a delete).
  useEffect(() => {
    const visibleIds = new Set(filtered.map((v) => v.id));
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => visibleIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [filtered]);

  const visibleIds = useMemo(() => filtered.map((v) => v.id), [filtered]);
  const selectedVisibleCount = visibleIds.filter((id) =>
    selected.has(id),
  ).length;
  const allSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someSelected = selectedVisibleCount > 0 && !allSelected;

  function toggleAll(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        visibleIds.forEach((id) => next.add(id));
      } else {
        visibleIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  }

  function toggleOne(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleBulkDelete() {
    const ids = [...selected];
    if (ids.length === 0) return;
    startTransition(async () => {
      try {
        await deleteVoters(ids);
        toast.success(`${ids.length} pemilih berhasil dihapus.`);
        setSelected(new Set());
        setConfirmOpen(false);
      } catch {
        toast.error("Gagal menghapus data pemilih.");
      }
    });
  }

  const selectedCount = selected.size;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
        >
          <TabsList>
            <TabsTrigger value="all">
              Semua ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="voted">
              Sudah ({counts.voted})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Belum ({counts.pending})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-72">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIS, atau kelas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <p className="text-sm">
            <b>{selectedCount}</b> pemilih dipilih.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
              disabled={pending}
            >
              Batal pilih
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={pending}
            >
              <Trash2Icon className="size-4" />
              Hapus {selectedCount} pemilih
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-10 pr-0">
                <Checkbox
                  aria-label="Pilih semua pemilih"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  disabled={visibleIds.length === 0}
                />
              </TableHead>
              <TableHead className="w-12 text-center">No.</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>NIS</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-muted-foreground"
                >
                  Tidak ada data pemilih.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v, index) => {
                const isSelected = selected.has(v.id);
                return (
                  <TableRow
                    key={v.id}
                    data-state={isSelected ? "selected" : undefined}
                  >
                    <TableCell className="pr-0">
                      <Checkbox
                        aria-label={`Pilih ${v.fullName}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          toggleOne(v.id, checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{v.fullName}</TableCell>
                    <TableCell className="font-mono text-sm">{v.nis}</TableCell>
                    <TableCell>{v.className ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {v.gender === "male" ? "Putra" : "Putri"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {v.hasVoted ? (
                        <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
                          Sudah memilih
                        </Badge>
                      ) : (
                        <Badge variant="outline">Belum memilih</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {v.hasVoted && <ResetVoteButton voterId={v.id} />}
                        <VoterFormDialog
                          eventId={eventId}
                          voter={v}
                          trigger={
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          }
                        />
                        <ConfirmDelete
                          title={`Hapus ${v.fullName}?`}
                          description="Data pemilih ini akan dihapus. Jika sudah memilih, suaranya ikut terhapus."
                          action={deleteVoter.bind(null, v.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Menampilkan {filtered.length} dari {voters.length} pemilih.
        {selectedCount > 0 && ` ${selectedCount} dipilih.`}
      </p>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus {selectedCount} pemilih terpilih?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Data pemilih yang dipilih akan dihapus permanen. Jika sudah
              memilih, suaranya ikut terhapus. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
