interface BacklogPageProps {
  params: Promise<{ locale: string }> | { locale: string };
}

export default async function BacklogPage({ }: BacklogPageProps) {
  return (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark">
          Selecciona un proyecto
        </h2>
        <p className="mt-2 text-textSecondary-light dark:text-textSecondary-dark">
          Elige un proyecto para ver el backlog de tareas
        </p>
      </div>
    </div>
  );
}
