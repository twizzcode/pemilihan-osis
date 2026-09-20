import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeftIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

import { LoginForm } from "@/components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminSession } from "@/lib/auth";
import { ensureDb, isUsingDefaultPassword } from "@/lib/db";

export const metadata = { title: "Masuk Admin" };

const highlights = [
  {
    icon: UsersIcon,
    title: "Kelola pemilih & paslon",
    desc: "Import data siswa dan atur paslon putra/putri dengan mudah.",
  },
  {
    icon: BarChart3Icon,
    title: "Rekap suara otomatis",
    desc: "Pantau hasil real-time lengkap dengan grafik interaktif.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Satu NIS, satu suara",
    desc: "Validasi ketat memastikan tidak ada suara ganda.",
  },
];

export default async function AdminLoginPage() {
  ensureDb();
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const showDefaultCredentials = isUsingDefaultPassword();

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between p-10 text-primary-foreground">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--chart-2) 0, transparent 45%), radial-gradient(circle at 80% 70%, var(--chart-3) 0, transparent 40%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            🗳️
          </span>
          Pilkasis
        </div>
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight">
              Portal Admin Pemilihan Ketua OSIS
            </h1>
            <p className="max-w-md text-primary-foreground/80">
              Kelola pemilihan dengan rapi — mulai dari data pemilih, paslon,
              hingga rekap hasil suara.
            </p>
          </div>
          <ul className="space-y-4">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <item.icon className="size-4" />
                </span>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-primary-foreground/70">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Pilkasis. Sistem Pemilihan Online.
        </p>
      </div>

      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden"
          >
            <span className="text-lg">🗳️</span> Pilkasis
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            render={<Link href="/" />}
          >
            <ArrowLeftIcon className="size-4" />
            Kembali ke Pemilih
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Selamat datang 👋</CardTitle>
                <CardDescription>
                  Masuk untuk mengelola pemilihan ketua OSIS.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
            {showDefaultCredentials && (
              <p className="mt-6 rounded-lg bg-muted/60 px-4 py-3 text-center text-xs text-muted-foreground">
                Akun default: <b>admin</b> / <b>admin123</b> — segera ganti di
                menu Pengaturan.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
