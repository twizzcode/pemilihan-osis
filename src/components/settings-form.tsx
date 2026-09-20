"use client";

import { useActionState, useEffect } from "react";
import { KeyRoundIcon, Loader2, ShieldCheckIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateAdminProfile, type ActionState } from "@/lib/actions/auth";

export function SettingsForm({
  name,
  username,
}: {
  name: string;
  username: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateAdminProfile,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRoundIcon className="size-4 text-primary" /> Profil Admin
          </CardTitle>
          <CardDescription>Nama yang ditampilkan di portal.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input id="username" value={username} disabled />
            </Field>
            <Field>
              <FieldLabel htmlFor="name">Nama Tampilan</FieldLabel>
              <Input id="name" name="name" defaultValue={name} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRoundIcon className="size-4 text-primary" /> Ganti Password
          </CardTitle>
          <CardDescription>
            Kosongkan jika tidak ingin mengubah password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="currentPassword">Password Lama</FieldLabel>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
              />
            </Field>
            <Separator />
            <Field>
              <FieldLabel htmlFor="newPassword">Password Baru</FieldLabel>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Konfirmasi Password Baru
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
              />
            </Field>
            <Field>
              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <ShieldCheckIcon className="size-4" />
                  Password minimal 6 karakter. Gunakan kombinasi yang kuat.
                </AlertDescription>
              </Alert>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Simpan Perubahan
        </Button>
      </div>
    </form>
  );
}
