import Link from "next/link";
import { CalendarRangeIcon, PlusIcon, UploadIcon, UsersIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { VoterFormDialog, VoterImportDialog } from "@/components/voter-form-dialog";
import { VotersTable } from "@/components/voters-table";
import { Button } from "@/components/ui/button";
import { getActiveEvent } from "@/lib/events";
import { listVoters } from "@/lib/queries";

export const metadata = { title: "Data Pemilih" };
export const dynamic = "force-dynamic";

export default function VotersPage() {
  const event = getActiveEvent();

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Data Pemilih"
          description="Kelola daftar siswa yang berhak memilih."
        />
        <EmptyState
          icon={CalendarRangeIcon}
          title="Belum ada pemilihan aktif"
          description="Aktifkan pemilihan terlebih dahulu untuk mengelola data pemilih."
        >
          <Button nativeButton={false} render={<Link href="/admin/events" />}>Kelola Pemilihan</Button>
        </EmptyState>
      </div>
    );
  }

  const voters = listVoters(event.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Pemilih"
        description={`Daftar pemilih untuk ${event.name}. NIS hanya bisa memilih satu kali.`}
      >
        <VoterImportDialog
          eventId={event.id}
          trigger={
            <Button variant="outline">
              <UploadIcon className="size-4" /> Import CSV
            </Button>
          }
        />
        <VoterFormDialog
          eventId={event.id}
          trigger={
            <Button>
              <PlusIcon className="size-4" /> Tambah Pemilih
            </Button>
          }
        />
      </PageHeader>

      {voters.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Belum ada data pemilih"
          description="Tambahkan satu per satu atau import sekaligus menggunakan CSV."
        />
      ) : (
        <VotersTable voters={voters} eventId={event.id} />
      )}
    </div>
  );
}
