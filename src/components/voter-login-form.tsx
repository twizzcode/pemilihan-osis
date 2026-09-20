"use client";

import { useActionState } from "react";
import { IdCardIcon, Loader2, LogInIcon, UserRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginVoter } from "@/lib/actions/vote";
import type { ActionState } from "@/lib/actions/auth";

const initialState: ActionState = {};

export function VoterLoginForm({ disabled }: { disabled?: boolean }) {
  const [state, formAction, pending] = useActionState(
    loginVoter,
    initialState,
  );

  return (
    <form action={formAction}>
      <FieldGroup>
        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="fullName">Nama Lengkap</FieldLabel>
          <div className="relative">
            <UserRoundIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fullName"
              name="fullName"
              placeholder="Contoh: Ahmad Fauzi"
              className="pl-9"
              autoComplete="name"
              required
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Nama bebas sebagai konfirmasi — login diverifikasi lewat NIS.
          </p>
        </Field>
        <Field>
          <FieldLabel htmlFor="nis">NIS</FieldLabel>
          <div className="relative">
            <IdCardIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="nis"
              name="nis"
              placeholder="Nomor Induk Siswa"
              className="pl-9"
              inputMode="numeric"
              required
              disabled={disabled}
            />
          </div>
        </Field>
        <Field>
          <Button type="submit" disabled={pending || disabled} className="w-full">
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogInIcon className="size-4" />
            )}
            {pending ? "Memeriksa data..." : "Masuk & Mulai Memilih"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
