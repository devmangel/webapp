import { NextAuthOptions } from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
// import EmailProvider from 'next-auth/providers/email'
import GithubProvider from 'next-auth/providers/github'
import { userAuthService } from '../../../modules/users/services/user-auth.service'
import type { UserRole } from '../../../modules/users/types'


export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    // OAuth authentication providers...
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID!,
      clientSecret: process.env.FACEBOOK_SECRET!
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user }) {
      console.log('=== SIGNIN CALLBACK INICIADO ===');
      console.log('User:', JSON.stringify(user, null, 2));

      if (!user.email) {
        console.error('❌ Error: Usuario sin email');
        return false;
      }

      try {
        console.log(`🔍 Verificando si el usuario ${user.email} existe en Supabase...`);

        // Verificar si el usuario ya existe en Supabase
        const existingUser = await userAuthService.getUserByEmail(user.email);
        console.log('Resultado búsqueda usuario:', existingUser ? 'Usuario encontrado' : 'Usuario no encontrado');

        if (!existingUser) {
          console.log(`✨ Creando nuevo usuario: ${user.email}`);

          // Si es un nuevo usuario, crear con rol ADMIN por defecto
          const newUserData = {
            email: user.email,
            name: user.name || 'Usuario Sin Nombre',
            role: 'ADMIN' as const, // Primer usuario es admin
            timezone: 'America/Bogota'
          };

          console.log('Datos del nuevo usuario:', JSON.stringify(newUserData, null, 2));

          await userAuthService.createUser(newUserData);
          console.log(`✅ Usuario ${user.email} creado exitosamente`);
        } else {
          console.log(`✅ Usuario ${user.email} ya existe, procediendo con login`);
        }

        console.log('=== SIGNIN CALLBACK COMPLETADO EXITOSAMENTE ===');
        return true;

      } catch (error) {
        console.error('❌ ERROR CRÍTICO en signIn callback:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack available');

        // Log adicional para debugging
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
        }

        // IMPORTANTE: Devolver 'false' para indicar a NextAuth que el signIn falló.
        // Esto previene el bucle de redirección y permite mostrar un error al usuario.
        console.error('El flujo de autenticación no puede continuar debido a un error interno.');

        return false;
      }
    },

    async jwt({ token, user }) {
      console.log('=== JWT CALLBACK INICIADO ===');
      console.log('Token existente:', !!token);
      console.log('Usuario nuevo:', !!user);

      // Si es la primera vez (cuando user está disponible), obtener datos de Supabase
      if (user && user.email) {
        console.log(`🔍 JWT: Obteniendo datos adicionales para ${user.email}`);
        try {
          const supabaseUser = await userAuthService.getUserByEmail(user.email);
          if (supabaseUser) {
            console.log('✅ JWT: Datos de usuario encontrados en Supabase');
            token.userId = supabaseUser.id;
            token.role = supabaseUser.role as UserRole;
            token.active = supabaseUser.active;
            token.timezone = supabaseUser.timezone || 'America/Bogota';
            token.capacityPerSprint = supabaseUser.capacity_per_sprint || 40;
          } else {
            console.warn('⚠️ JWT: Usuario no encontrado en Supabase, usando datos básicos');
            // Usar datos mínimos del OAuth provider
            token.userId = user.id || user.email; // fallback
            token.role = 'ADMIN' as UserRole; // rol por defecto
            token.active = true;
            token.timezone = 'America/Bogota';
            token.capacityPerSprint = 40;
            token.skills = [];
          }
        } catch (error) {
          console.error('❌ JWT: Error obteniendo datos de usuario:', error);
          console.warn('⚠️ JWT: Usando datos mínimos de fallback');
          // Fallback seguro - usar datos del OAuth provider
          token.userId = user.id || user.email;
          token.role = 'ADMIN' as UserRole;
          token.active = true;
          token.timezone = 'America/Bogota';
          token.capacityPerSprint = 40;
          token.skills = [];
        }
      }

      console.log('=== JWT CALLBACK COMPLETADO ===');
      return token;
    },

    async session({ session, token }) {
      console.log('=== SESSION CALLBACK INICIADO ===');
      console.log('Session user:', !!session.user);
      console.log('Token data:', !!token);

      try {
        // Agregar datos adicionales a la sesión
        if (token && session.user) {
          console.log('✅ SESSION: Agregando datos del token a la sesión');
          session.user.id = (token.userId as string) || session.user.email || 'fallback-id';
          session.user.role = (token.role as UserRole) || 'ADMIN';
          session.user.timezone = (token.timezone as string) || 'America/Bogota';
          session.user.capacityPerSprint = (token.capacityPerSprint as number) || 40;
          session.user.skills = (token.skills as string[]) || [];
          session.user.active = (token.active as boolean) !== false; // true por defecto

          console.log('✅ SESSION: Datos agregados exitosamente');
        } else {
          console.warn('⚠️ SESSION: Token o user faltantes, usando datos mínimos');
        }
      } catch (error) {
        console.error('❌ SESSION: Error procesando sesión:', error);
        console.warn('⚠️ SESSION: Continuando con sesión básica');
        // No hacer nada - dejar la sesión como está
      }

      console.log('=== SESSION CALLBACK COMPLETADO ===');
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 días
    updateAge: 24 * 60 * 60, // 24 horas
  },
  events: {
    async signIn({ user, account }) {
      // Log de eventos de signin para auditoría si es necesario
      console.log(`Usuario ${user.email} inició sesión con ${account?.provider}`);
    },
    async signOut({ session, token }) {
      // Eliminar datos sensibles del token
      if (token) {
        delete token.userId;
        delete token.role;
        delete token.active;
        delete token.timezone;
        delete token.capacityPerSprint;
        delete token.skills;
      }
      // Eliminar datos sensibles de la sesión
      if (session?.user) {
        delete session.user.name;
        delete session.user.email;
        delete session.user.image;
        delete session.user.role;
        delete session.user.timezone;
        delete session.user.capacityPerSprint;
        delete session.user.skills;
        delete session.user.active;
      }
      // Log de eventos de signout
      console.log(`Usuario cerró sesión`);
    }
  }
}
