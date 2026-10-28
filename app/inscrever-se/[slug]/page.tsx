import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCourseBySlug } from "@/actions/courses-actions";
import { getUserProfile } from "@/actions/profile-actions";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type PageParams = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCourseBySlug(slug);
  const course = result.data;

  const title = course
    ? `Inscrição em ${course.title} | Unitec Academy`
    : "Pagamento seguro | Unitec Academy";

  return {
    title,
    description:
      "Finalize a inscrição no seu curso com M-Pesa, e-Mola ou cartão bancário em poucos segundos.",
    openGraph: {
      title,
      description: "Pague o seu curso com M-Pesa, e-Mola ou cartão bancário.",
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function InscricaoPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const [result, profileResult] = await Promise.all([getCourseBySlug(slug), getUserProfile()]);
  const course = result.data;
  const profile = profileResult.data
    ? { name: profileResult.data.name, phone: profileResult.data.phone }
    : undefined;

  if (!course) {
    return (
      <div className="container-page py-20 px-4">
        <EmptyState
          title="Curso não encontrado"
          description="O curso para o qual pretende inscrever-se pode ter sido removido ou o link está incorreto."
          action={
            <Link href="/cursos">
              <Button>Ver todos os cursos</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-[520px] rounded-2xl" />
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      }
    >
      <CheckoutFlow course={course} profile={profile} />
    </Suspense>
  );
}
