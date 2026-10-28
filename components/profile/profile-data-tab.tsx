"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/actions/profile-actions";

export function ProfileDataTab({
  profile,
  draft,
  editing,
  onChange,
  onSave,
  onCancel,
  onStartEdit,
}: {
  profile: Profile;
  draft: Profile;
  editing: boolean;
  onChange: (patch: Partial<Profile>) => void;
  onSave: () => void;
  onCancel: () => void;
  onStartEdit: () => void;
}) {
  const field = <K extends keyof Profile>(key: K) => ({
    value: (editing ? draft[key] : profile[key]) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ [key]: e.target.value } as Partial<Profile>),
    disabled: !editing,
  });

  return (
    <div className="max-w-2xl space-y-5 rounded-xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" {...field("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-phone">Telemóvel</Label>
          <Input id="p-phone" type="tel" {...field("phone")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-city">Cidade</Label>
          <Input id="p-city" {...field("city")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-avatar">URL do avatar</Label>
          <Input id="p-avatar" type="url" {...field("avatarUrl")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-headline">Título</Label>
        <Input id="p-headline" {...field("headline")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-bio">Sobre mim</Label>
        <Textarea id="p-bio" rows={4} {...field("bio")} />
      </div>
      <Separator />
      <div className="flex gap-2">
        {editing ? (
          <>
            <Button className="cursor-pointer" onClick={onSave}>
              Guardar alterações
            </Button>
            <Button variant="outline" className="cursor-pointer" onClick={onCancel}>
              Cancelar
            </Button>
          </>
        ) : (
          <Button className="cursor-pointer" onClick={onStartEdit}>
            <Pencil className="size-4" /> Editar dados
          </Button>
        )}
      </div>
    </div>
  );
}
