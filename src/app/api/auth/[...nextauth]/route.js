import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from 'jsonwebtoken'; // Usamos jsonwebtoken en el frontend

async function refreshAccessToken(token) {
  console.log('Intentando refrescar el token de acceso...');
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error(refreshedTokens.message || 'No se pudo refrescar el token de acceso.');
    }

    // Decodificar el nuevo token para obtener el tiempo de expiración
    const decodedToken = jwt.decode(refreshedTokens.accessToken);
    const accessTokenExpires = decodedToken.exp * 1000; // Convertir a milisegundos

    // console.log('Token de acceso refrescado exitosamente.');

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires,
      refreshToken: refreshedTokens.refreshToken || token.refreshToken,
    };
  } catch (error) {
    console.error('Error al refrescar el token de acceso:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'test@test.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || 'Error al iniciar sesión.');
          }

          // Decodificar el token para obtener el tiempo de expiración
          const decodedToken = jwt.decode(data.accessToken);
          const accessTokenExpires = decodedToken.exp * 1000; // Convertir a milisegundos

          // Retornar el usuario con las propiedades necesarias
          return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpires,
            id: data.id,
            email: data.email,
            nombre: data.nombre,
            apellido: data.apellido,
            rol: data.rol,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          // Retorna null para indicar que la autorización falló
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        // URLs relativas: siempre vuelven a tu app
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        // URLs absolutas: solo si comparten el mismo origin
        const to = new URL(url);
        const base = new URL(baseUrl);
        return to.origin === base.origin ? url : baseUrl;
      } catch {
        // Cualquier cosa rara: vuelve al home
        return baseUrl;
      }
    },

    async jwt({ token, user }) {
      // console.log('JWT Callback - Inicio');
      // console.log('Hora actual:', Date.now());
      // console.log('Token expira en:', token.accessTokenExpires);

      if (user) {
        // console.log('Usuario presente, actualizando token');
        return {
          ...token,
          accessToken: user.accessToken,
          accessTokenExpires: user.accessTokenExpires,
          refreshToken: user.refreshToken,
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          rol: user.rol,
        };
      }

      // Verifica si el token ha expirado
      if (Date.now() < token.accessTokenExpires) {
        // console.log('El token aún es válido');
        return token;
      }

      // El token ha expirado, intenta refrescarlo
      // console.log('El token ha expirado, intentando refrescarlo...');
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      // console.log('Session Callback - Actualizando sesión con el token actualizado');
      session.user = {
        id: token.id,
        email: token.email,
        nombre: token.nombre,
        apellido: token.apellido,
        rol: token.rol,
      };
      session.accessToken = token.accessToken;
      session.accessTokenExpires = token.accessTokenExpires;
      session.error = token.error;

      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

