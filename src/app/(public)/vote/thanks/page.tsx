import Link from "next/link";
import { CheckCircle2Icon, HomeIcon, ShieldCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Terima kasih" };

export default function ThanksPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-primary/8 via-background to-chart-2/10 p-6">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(40rem 40rem at 10% -10%, var(--primary), transparent 60%), radial-gradient(30rem 30rem at 110% 110%, var(--chart-2), transparent 55%)",
          filter: "blur(120px)",
        }}
      />
      <Card className="w-full max-w-md border-border/60 text-center shadow-xl shadow-primary/5">
        <CardHeader className="items-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2Icon className="size-9 text-primary" />
          </div>
          <CardTitle className="text-2xl">Terima kasih! 🎉</CardTitle>
          <CardDescription>
            Suara Anda telah berhasil dicatat. Partisipasi Anda sangat berarti
            untuk menentukan pemimpin OSPA &amp; OSPI berikutnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
            <ShieldCheckIcon className="size-4 text-primary" />
            NIS Anda telah tercatat dan tidak dapat memilih lagi.
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            className="w-full"
          >
            <HomeIcon className="size-4" /> Kembali ke Halaman Awal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
