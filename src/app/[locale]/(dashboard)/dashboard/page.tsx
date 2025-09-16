import { redirect } from 'next/navigation';

interface DashboardPageProps {
  params: Promise<{ locale: string }> | { locale: string };
}

export default async function DashboardHomePage({ params }: DashboardPageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  redirect(`/${locale}/dashboard/overview`);
}
