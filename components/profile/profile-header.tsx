import Link from "next/link";
import { MapPin, Pencil, Phone } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDate } from "@/lib/format";
import type { Profile } from "@/actions/profile-actions";

export function ProfileHeader({
  profile,
  memberSince,
  onEdit,
}: {
  profile: Profile;
  memberSince?: string;
  onEdit: () => void;
}) {
  return (
    <div className="border-b border-border bg-gradient-to-b from-primary-soft/50 to-transparent">
      <div className="container-page flex flex-col gap-6 py-10 md:flex-row md:items-center md:py-14">
        <UserAvatar
          name={profile.name}
          src={profile.avatarUrl}
          size={112}
          className="size-24 rounded-2xl text-2xl ring-4 ring-background md:size-28"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {profile.name}
          </h1>
          <p className="text-muted-foreground">{profile.headline || "Estudante Unitec Academy"}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            {profile.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5" /> {profile.phone}
              </span>
            )}
            {profile.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {profile.city}
              </span>
            )}
          </div>
          {memberSince && (
            <p className="text-xs text-muted-foreground">
              Estudante desde {formatDate(memberSince)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="cursor-pointer" onClick={onEdit}>
            <Pencil className="size-4" /> Editar perfil
          </Button>
          <Link href="/cursos" className={buttonVariants()}>
            Explorar cursos
          </Link>
        </div>
      </div>
    </div>
  );
}
