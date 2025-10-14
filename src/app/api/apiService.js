import axios from 'axios';
import { getSession, signIn } from 'next-auth/react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

const apiService = axios.create({
  baseURL: apiBaseUrl,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiService.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    } else {
      console.warn('No se encontró el token de acceso en la sesión.');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verifica si el error es 401 y no es un intento de refresco
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Marca la solicitud original para evitar bucles infinitos
      originalRequest._retry = true;

      if (isRefreshing) {
        // Si ya estamos refrescando, agregamos la solicitud a la cola
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiService(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      // return new Promise(async (resolve, reject) => {
      //   try {
      //     // Intentar obtener una nueva sesión (lo que debería refrescar el token)
      //     const session = await getSession({ trigger: 'refresh' });

      //     if (session?.accessToken) {
      //       // Actualizar el token en las solicitudes pendientes
      //       processQueue(null, session.accessToken);

      //       // Actualizar la cabecera Authorization
      //       originalRequest.headers.Authorization = 'Bearer ' + session.accessToken;

      //       resolve(apiService(originalRequest));
      //     } else {
      //       // Si no hay sesión, redirigir al inicio de sesión
      //       processQueue(new Error('No se pudo refrescar el token'), null);
      //       await signIn(undefined, { callbackUrl: '/signin' });
      //       reject(error);
      //     }
      //   } catch (err) {
      //     console.error('Error al refrescar el token:', err);
      //     processQueue(err, null);
      //     await signIn(undefined, { callbackUrl: '/signin' });
      //     reject(err);
      //   } finally {
      //     isRefreshing = false;
      //   }
      // });
    
      return new Promise(async (resolve, reject) => {
  try {
    // Intentar obtener una nueva sesión (lo que debería refrescar el token)
    const session = await getSession({ trigger: 'refresh' });

    if (session?.accessToken) {
      // Actualizar el token en las solicitudes pendientes
      processQueue(null, session.accessToken);

      // Actualizar la cabecera Authorization
      originalRequest.headers.Authorization = 'Bearer ' + session.accessToken;

      resolve(apiService(originalRequest));
    } else {
      // Si no hay sesión, redirigir al inicio de sesión (volver a la misma página después)
      processQueue(new Error('No se pudo refrescar el token'), null);
      const cb =
        (typeof window !== 'undefined' &&
          (window.location.pathname + window.location.search + window.location.hash)) ||
        '/';
      await signIn(undefined, { callbackUrl: cb });
      reject(error);
    }
  } catch (err) {
    console.error('Error al refrescar el token:', err);
    processQueue(err, null);
    const cb =
      (typeof window !== 'undefined' &&
        (window.location.pathname + window.location.search + window.location.hash)) ||
      '/';
    await signIn(undefined, { callbackUrl: cb });
    reject(err);
  } finally {
    isRefreshing = false;
  }
});
    
    }

    return Promise.reject(error);
  }
);

export default apiService;



