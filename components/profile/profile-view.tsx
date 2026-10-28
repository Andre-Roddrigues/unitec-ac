"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Award, BookOpen, Clock, Flame, Heart, Receipt, UserRound, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/profile/stat-card";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileCoursesTab, type ProfileCourseProgress } from "@/components/profile/profile-courses-tab";
import { ProfilePaymentsTab, packageLabel, type ProfilePayment } from "@/components/profile/profile-payments-tab";
import { ProfileCertificatesTab } from "@/components/profile/profile-certificates-tab";
import { ProfileWishlistTab } from "@/components/profile/profile-wishlist-tab";
import { ProfileDataTab } from "@/components/profile/profile-data-tab";
import { useWishlist } from "@/hooks/use-wishlist";
import { updateUserProfile, type Profile, type ProfileSummary } from "@/actions/profile-actions";
import type { Enrollment } from "@/actions/enrollment-actions";
import type { UserCertificate } from "@/actions/certificate-actions";
import { formatPrice } from "@/lib/format";
import { WISHLIST_ENABLED } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

/**
 * Separadores no URL (`/perfil?tab=certificados`): o pop-up do exame final e
 * o toast de "pagar mais tarde" levam directo ao separador certo, e a tab
 * escolhida sobrevive a um refresh.
 */
const TABS = ["cursos", "certificados", "pagamentos", "desejos", "dados"] as const;
type ProfileTab = (typeof TABS)[number];

function TabLabel({
  icon: Icon,
  label,
  count,
  highlight = false,
}: {
  icon: LucideIcon;
  label: string;
  count?: number;
  /** Algo à espera do aluno (ex.: certificado por pagar). */
  highlight?: boolean;
}) {
  return (
    <>
      <Icon className="size-4" />
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
            highlight ? "bg-warning text-black" : "bg-muted-foreground/15 text-foreground",
          )}
        >
          {count}
        </span>
      )}
    </>
  );
}

export function ProfileView({
  profile,
  summary,
  enrollments,
  certificates,
}: {
  profile: Profile | null;
  summary: ProfileSummary | null;
  enrollments: Enrollment[];
  certificates: UserCertificate[];
}) {
  const { ids: wishlistIds } = useWishlist();
  const [urlTab, setTab] = useQueryState("tab", parseAsStringLiteral(TABS).withDefault("cursos"));
  // Com a lista de desejos desligada, um link antigo para `?tab=desejos`
  // abriria um separador que já não aparece na barra.
  const tab: ProfileTab = !WISHLIST_ENABLED && urlTab === "desejos" ? "cursos" : urlTab;
  const tabsRef = useRef<HTMLDivElement>(null);
  const [localProfile, setLocalProfile] = useState<Profile | null>(profile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile | null>(profile);

  const certificateByEnrollment = useMemo(
    () => new Map(certificates.map((c) => [c.enrollmentId, c])),
    [certificates],
  );
  const pendingCertificates = certificates.filter((c) => c.status === "PENDING_PAYMENT");
  const issuedCertificates = certificates.length - pendingCertificates.length;

  const courses: ProfileCourseProgress[] = useMemo(
    () =>
      enrollments
        .filter((e) => e.course)
        .map((e) => ({
          course: {
            id: e.courseId,
            slug: e.course?.slug ?? "",
            title: e.course?.title ?? "",
            thumbnailUrl: e.course?.thumbnailUrl ?? "",
          },
          pct: e.progress,
          completed: e.completed,
          certificate: certificateByEnrollment.get(e.id)?.status ?? null,
        })),
    [enrollments, certificateByEnrollment],
  );

  // Estas linhas saem das matrículas, que só existem depois de o pagamento
  // ser confirmado — por isso são pagamentos reais. O que não dá para mostrar
  // aqui são os pagamentos pendentes ou recusados: esses vivem no serviço de
  // pagamentos e o LMS não os guarda. A referência inventada a partir do id da
  // matrícula saiu: ou há `paymentId`, ou não se mostra referência nenhuma.
  // Os certificados pagos à parte também são pagamentos confirmados — só os
  // que têm `amountPaid` (os incluídos no pacote, ou anteriores a serem pagos,
  // não custaram nada).
  const payments: ProfilePayment[] = useMemo(
    () =>
      [
        ...enrollments.map((e) => ({
          id: e.id,
          reference: e.paymentId ?? null,
          courseTitle: e.course?.title ?? "Curso",
          itemLabel: `Pacote ${packageLabel(e.package)}`,
          amount: Number(e.amountPaid ?? 0),
          date: e.enrolledAt,
        })),
        ...certificates
          .filter((c) => c.status === "ISSUED" && c.amountPaid)
          .map((c) => ({
            id: c.id,
            reference: c.paymentId ?? null,
            courseTitle: c.course?.title ?? "Curso",
            itemLabel: "Certificado",
            amount: Number(c.amountPaid ?? 0),
            date: c.issuedAt,
          })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [enrollments, certificates],
  );

  const invested = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);

  const memberSince = useMemo(() => {
    if (enrollments.length === 0) return localProfile?.updatedAt;
    const dates = enrollments.map((e) => new Date(e.enrolledAt).getTime());
    return new Date(Math.min(...dates)).toISOString();
  }, [enrollments, localProfile]);

  const totalHoursLearned = summary?.totalHoursLearned ?? 0;
  const totalEnrolled = summary?.totalEnrolled ?? enrollments.length;
  const completedCourses = summary?.completedCourses ?? 0;

  if (!localProfile) {
    return (
      <div className="container-page grid min-h-[50vh] place-items-center py-16">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-2xl font-bold">Perfil indisponível</h1>
          <p className="mt-2 text-muted-foreground">
            Não foi possível carregar os dados do seu perfil. Tente novamente mais tarde.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/cursos">
              <Button>Explorar cursos</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startEditing = () => {
    setDraft(localProfile);
    setEditing(true);
  };

  /** "Editar perfil" no cabeçalho: antes só ligava o modo de edição num separador que nem estava à vista. */
  const editFromHeader = () => {
    startEditing();
    setTab("dados");
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onPatch = (patch: Partial<Profile>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  };

  const save = async () => {
    if (!draft) return;
    const res = await updateUserProfile({
      name: draft.name,
      avatarUrl: draft.avatarUrl ?? "",
      phone: draft.phone ?? "",
      city: draft.city ?? "",
      headline: draft.headline ?? "",
      bio: draft.bio ?? "",
    });
    if (res.success) {
      setLocalProfile(draft);
      setEditing(false);
      toast.success(res.message || "Perfil actualizado com sucesso");
    } else {
      toast.error(res.message || "Falha ao actualizar o perfil");
    }
  };

  return (
    <>
      <ProfileHeader profile={localProfile} memberSince={memberSince} onEdit={editFromHeader} />

      <div className="container-page space-y-10 py-10 md:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Cursos inscritos"
            value={String(totalEnrolled)}
            hint={`${completedCourses} concluído(s)`}
          />
          <StatCard
            icon={Award}
            label="Certificados"
            value={String(summary?.certificatesEarned ?? issuedCertificates)}
            hint={pendingCertificates.length > 0 ? `${pendingCertificates.length} por pagar` : undefined}
          />
          <StatCard
            icon={Flame}
            label="Tempo de estudo"
            value={`${totalHoursLearned}h`}
            hint="Total de horas assistidas"
          />
          <StatCard
            icon={Wallet}
            label="Investido em formação"
            value={formatPrice(invested)}
            hint={`${payments.length} compra(s)`}
          />
        </div>

        {pendingCertificates.length > 0 && tab !== "certificados" && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-background text-warning-foreground">
              <Clock className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {pendingCertificates.length === 1
                  ? "Tem um certificado à espera de pagamento"
                  : `Tem ${pendingCertificates.length} certificados à espera de pagamento`}
              </p>
              <p className="text-sm text-muted-foreground">
                Concluiu {pendingCertificates.length === 1 ? "o curso" : "os cursos"} — falta só emitir o certificado.
              </p>
            </div>
            <Button className="cursor-pointer" onClick={() => setTab("certificados")}>
              Ver certificados
            </Button>
          </div>
        )}

        <Tabs
          ref={tabsRef}
          value={tab}
          onValueChange={(value) => setTab(value as ProfileTab)}
          className="scroll-mt-24 space-y-6"
        >
          {/* Em telemóvel os separadores não cabem: desliza na horizontal
              em vez de transbordar da página. */}
          <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <TabsList className="w-max">
              <TabsTrigger value="cursos">
                <TabLabel icon={BookOpen} label="Meus cursos" count={courses.length} />
              </TabsTrigger>
              <TabsTrigger value="certificados">
                <TabLabel
                  icon={Award}
                  label="Certificados"
                  count={pendingCertificates.length || certificates.length}
                  highlight={pendingCertificates.length > 0}
                />
              </TabsTrigger>
              <TabsTrigger value="pagamentos">
                <TabLabel icon={Receipt} label="Pagamentos" />
              </TabsTrigger>
              {WISHLIST_ENABLED && (
                <TabsTrigger value="desejos">
                  <TabLabel icon={Heart} label="Lista de desejos" count={wishlistIds.length} />
                </TabsTrigger>
              )}
              <TabsTrigger value="dados">
                <TabLabel icon={UserRound} label="Dados pessoais" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="cursos" className="space-y-4">
            {courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Ainda não tem cursos"
                description="Explore o catálogo e comece a aprender hoje."
                action={
                  <Link href="/cursos" className={buttonVariants()}>
                    Ver catálogo
                  </Link>
                }
              />
            ) : (
              <ProfileCoursesTab items={courses} />
            )}
          </TabsContent>

          <TabsContent value="certificados">
            {certificates.length === 0 ? (
              <EmptyState
                icon={Award}
                title="Ainda sem certificados"
                description="Passe o exame final de um curso para obter o certificado. Em cursos sem exame, basta concluir todas as aulas."
                action={
                  courses.length > 0 ? (
                    <Button variant="outline" className="cursor-pointer" onClick={() => setTab("cursos")}>
                      Ir para os meus cursos
                    </Button>
                  ) : (
                    <Link href="/cursos" className={buttonVariants()}>
                      Ver catálogo
                    </Link>
                  )
                }
              />
            ) : (
              <ProfileCertificatesTab
                items={certificates}
                userName={localProfile.name}
                phone={localProfile.phone}
              />
            )}
          </TabsContent>

          <TabsContent value="pagamentos">
            {payments.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="Sem pagamentos registados"
                description="Os recibos das suas inscrições e certificados aparecem aqui."
                action={
                  <Link href="/cursos" className={buttonVariants({ variant: "outline" })}>
                    Explorar cursos
                  </Link>
                }
              />
            ) : (
              <ProfilePaymentsTab payments={payments} />
            )}
          </TabsContent>

          {WISHLIST_ENABLED && (
            <TabsContent value="desejos">
              {wishlistIds.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="Lista de desejos vazia"
                  description="Guarde cursos para comprar mais tarde."
                  action={
                    <Link href="/cursos" className={buttonVariants()}>
                      Ver catálogo
                    </Link>
                  }
                />
              ) : (
                <ProfileWishlistTab ids={wishlistIds} />
              )}
            </TabsContent>
          )}

          <TabsContent value="dados">
            <ProfileDataTab
              profile={localProfile}
              draft={draft ?? localProfile}
              editing={editing}
              onChange={onPatch}
              onSave={save}
              onCancel={() => setEditing(false)}
              onStartEdit={startEditing}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
