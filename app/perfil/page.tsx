import type { Metadata } from "next";
import { ProfileView } from "@/components/profile/profile-view";
import { getUserProfile, getUserProfileStats } from "@/actions/profile-actions";
import { getUserEnrollments } from "@/actions/enrollment-actions";
import { getMyCertificates } from "@/actions/certificate-actions";

export const metadata: Metadata = {
  title: "O meu perfil | Unitec Academy",
  description:
    "Veja os seus dados, cursos inscritos, progresso, certificados e histórico de pagamentos numa só página.",
  openGraph: {
    title: "O meu perfil | Unitec Academy",
    description: "Dados pessoais, cursos, progresso e pagamentos do estudante.",
    type: "profile",
  },
  twitter: { card: "summary_large_image" },
};

export default async function ProfilePage() {
  const [profileRes, summaryRes, enrollmentsRes, certificatesRes] = await Promise.all([
    getUserProfile(),
    getUserProfileStats(),
    getUserEnrollments(),
    getMyCertificates(),
  ]);

  return (
    <ProfileView
      profile={profileRes.data ?? null}
      summary={summaryRes.data ?? null}
      enrollments={enrollmentsRes.data ?? []}
      certificates={certificatesRes.data ?? []}
    />
  );
}
