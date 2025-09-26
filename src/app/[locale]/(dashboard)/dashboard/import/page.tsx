import { getCurrentUser } from 'app/lib/auth/server';
import { ImportClient } from './ImportClient';

export default async function ImportPage() {
  // Obtener el usuario autenticado
  const user = await getCurrentUser();
  
  // El usuario ya está garantizado por requireAuth() en layout,
  // pero agregamos verificación defensiva
  if (!user?.id) {
    throw new Error('Usuario no encontrado. Por favor, inicie sesión nuevamente.');
  }

  return <ImportClient userId={user.id} />;
}
