import { redirect } from 'next/navigation';

interface DashboardPageProps {
  params: Promise<{ locale: string }> | { locale: string };
}

export default async function DashboardHomePage({ params }: DashboardPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard/overview`);
}
