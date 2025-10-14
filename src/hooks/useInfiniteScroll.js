// import { useEffect, useRef, useState, useCallback } from "react";

// const useInfiniteScroll = ({
//   fetchFn,
//   limit = 10,
//   deps = [],
// }) => {
//   const [data, setData] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const offsetRef = useRef(0);
//   const lastRowRef = useRef(null);
//   const initialLoadDone = useRef(false);

//   const fetchMore = useCallback(async () => {
//     if (loading || !hasMore) return;

//     try {
//       setLoading(true);
//       const result = await fetchFn(offsetRef.current, limit);

//       const nuevos = result?.data || [];
//       const nuevosUnicos = nuevos.filter(
//         (d) => !data.some((prev) => prev.id === d.id)
//       );

//       setData((prev) => [...prev, ...nuevosUnicos]);
//       offsetRef.current += limit;
//       setTotal(result.total || 0);
//       setHasMore(
//         Array.isArray(nuevos) &&
//           nuevos.length > 0 &&
//           offsetRef.current < (result.total || 0)
//       );
//     } catch (err) {
//       console.error("Error en fetchMore:", err);
//       setHasMore(false);
//     } finally {
//       setLoading(false);
//       initialLoadDone.current = true;
//     }
//   }, [fetchFn, limit, loading, hasMore, data]);

//   useEffect(() => {
//     offsetRef.current = 0;
//     setData([]);
//     setHasMore(true);
//     initialLoadDone.current = false;
//     fetchMore();
//   }, deps); // reinicia si cambian dependencias (ej: gestionId)

//   useEffect(() => {
//     if (!initialLoadDone.current) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           fetchMore();
//         }
//       },
//       { root: null, rootMargin: "100px", threshold: 0.1 }
//     );

//     const node = lastRowRef.current;
//     if (node) observer.observe(node);

//     return () => {
//       if (node) observer.unobserve(node);
//       observer.disconnect();
//     };
//   }, [data, fetchMore]);

//   return {
//     data,
//     total,
//     loading,
//     hasMore,
//     lastRowRef,
//     fetchMore, // opcional por si necesitas recargar manualmente
//   };
// };

// export default useInfiniteScroll;

// // TRABAJANDO:
// import { useEffect, useRef, useState, useCallback } from "react";

// const useInfiniteScroll = ({
//   fetchFn,       // recibe ({ offset, limit }) => Promise<{ data: [], total: number }>
//   limit = 10,
//   deps = [],     // típicamente [JSON.stringify(filters)]
// }) => {
//   const [data, setData] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   const offsetRef = useRef(0);
//   const observer = useRef(null);
//   const lastRowRef = useRef(null);

//   const initialLoadDone = useRef(false);

//   const fetchMore = useCallback(async () => {
//     if (loading || !hasMore) return;

//     try {
//       setLoading(true);
//       const offset = offsetRef.current;

//       console.log("➡️ Fetching more data:");
//       console.log("offset:", offset, "limit:", limit);

//       const result = await fetchFn({ offset, limit });

//       const nuevos = result?.data || [];
//       const nuevosUnicos = nuevos.filter(
//         (d) => !data.some((prev) => prev.id === d.id)
//       );

//       console.log("🔄 Nuevos únicos:", nuevosUnicos.length);

//       setData((prev) => [...prev, ...nuevosUnicos]);
//       setTotal(result?.total || 0);

//       offsetRef.current += limit;

//       if (data.length + nuevosUnicos.length >= (result?.total || 0)) {
//         setHasMore(false);
//       }
//     } catch (error) {
//       console.error("❌ Error en fetchMore:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchFn, limit, data, hasMore, loading]);

//   // Reinicia scroll infinito cuando cambian filtros u otras dependencias
//   useEffect(() => {
//     console.log("🔁 Dependencias cambiaron, reiniciando scroll infinito...");
//     offsetRef.current = 0;
//     setData([]);
//     setTotal(0);
//     setHasMore(true);
//     initialLoadDone.current = false;
//   }, deps);

//   // Observador para detectar el último row visible
//   useEffect(() => {
//     if (!hasMore || loading) return;

//     if (observer.current) {
//       observer.current.disconnect();
//     }

//     observer.current = new IntersectionObserver((entries) => {
//       if (entries[0].isIntersecting) {
//         console.log("👀 Último row visible, cargando más...");
//         fetchMore();
//       }
//     });

//     if (lastRowRef.current) {
//       observer.current.observe(lastRowRef.current);
//     }

//     return () => observer.current?.disconnect();
//   }, [fetchMore, hasMore, loading, data]);

//   // Carga inicial (solo una vez)
//   useEffect(() => {
//     if (!initialLoadDone.current) {
//       fetchMore();
//       initialLoadDone.current = true;
//     }
//   }, [fetchMore]);

//   return {
//     data,
//     total,
//     loading,
//     hasMore,
//     lastRowRef,
//   };
// };

// export default useInfiniteScroll;

// // NUEVO: DEPURADO Y OPTIMIZADO
// import { useEffect, useRef, useState, useCallback } from "react";

// const useInfiniteScroll = ({
//   fetchFn,       // función: ({ offset, limit }) => Promise<{ data: [], total }>
//   limit = 10,
//   deps = [],     // típicamente: [JSON.stringify(filters)]
// }) => {
//   const [data, setData] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   const offsetRef = useRef(0);
//   const observerRef = useRef(null);
//   const lastRowRef = useRef(null);
//   const initialLoadDone = useRef(false);

//   const fetchMore = useCallback(async () => {
//     if (loading || !hasMore) {
//       console.log("🛑 fetchMore cancelado — loading:", loading, "hasMore:", hasMore);
//       return;
//     }

//     const currentOffset = offsetRef.current;
//     console.log("🚀 [fetchMore] Iniciado — offset:", currentOffset, "limit:", limit);

//     try {
//       setLoading(true);

//       const result = await fetchFn({ offset: currentOffset, limit });
//       const nuevos = result?.data || [];

//       console.log("📦 [fetchMore] Datos recibidos:", nuevos.length);
//       console.log("🧮 Total recibido:", result?.total);

//       const nuevosUnicos = nuevos.filter(
//         (d) => !data.some((prev) => prev.id === d.id)
//       );

//       console.log("🔍 Nuevos únicos agregados:", nuevosUnicos.length);

//       setData((prev) => [...prev, ...nuevosUnicos]);
//       setTotal(result?.total || 0);

//       offsetRef.current += limit;
//       console.log("➡️ Nuevo offset:", offsetRef.current);

//       if (offsetRef.current >= (result?.total || 0)) {
//         setHasMore(false);
//         console.log("✅ Fin de datos alcanzado");
//       }
//     } catch (error) {
//       console.error("❌ Error en fetchMore:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchFn, limit, data, hasMore, loading]);

//   // Reinicia cuando cambian las dependencias (filtros, gestión, etc.)
//   useEffect(() => {
//     console.log("🔁 [useEffect] Reset de scroll infinito por cambio de deps");
//     offsetRef.current = 0;
//     setData([]);
//     setTotal(0);
//     setHasMore(true);
//     initialLoadDone.current = false;
//   }, deps);

//   // Observa el último row visible
//   useEffect(() => {
//     if (!lastRowRef.current || !hasMore) return;

//     if (observerRef.current) observerRef.current.disconnect();

//     observerRef.current = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           console.log("👁️ Último elemento visible — se llama fetchMore()");
//           fetchMore();
//         }
//       },
//       { threshold: 0.1, rootMargin: "100px" }
//     );

//     observerRef.current.observe(lastRowRef.current);

//     return () => observerRef.current?.disconnect();
//   }, [lastRowRef.current, hasMore, fetchMore]);

//   // Carga inicial
//   useEffect(() => {
//     if (!initialLoadDone.current) {
//       console.log("🟢 Carga inicial activada");
//       fetchMore();
//       initialLoadDone.current = true;
//     }
//   }, [fetchMore]);

//   return {
//     data,
//     total,
//     loading,
//     hasMore,
//     lastRowRef,
//   };
// };

// export default useInfiniteScroll;

// // hooks/useInfiniteScroll.js

// REVISAR:

// import { useState, useRef, useEffect, useCallback } from "react";

// const useInfiniteScroll = ({
//   fetchFn,    // async ({ offset, limit }) => ({ data: [], total })
//   limit = 10,
//   deps = [],  // p.ej. [gestionId] o [JSON.stringify(filters)]
// }) => {
//   const [data, setData] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [hasMore, setHasMore] = useState(true);

//   const offsetRef = useRef(0);
//   const fetchingRef = useRef(false);
//   const observerRef = useRef(null);
//   const lastRowRef = useRef(null);

//   const loadMore = useCallback(async () => {
//     if (fetchingRef.current || !hasMore) return;
//     fetchingRef.current = true;
//     try {
//       const { data: nuevos = [], total: totalN = 0 } =
//         await fetchFn({ offset: offsetRef.current, limit });

//       setTotal(totalN);
//       setData((prev) => {
//         const sinDuplicados = nuevos.filter((n) => !prev.some((p) => p.id === n.id));
//         return [...prev, ...sinDuplicados];
//       });

//       offsetRef.current += limit;
//       if (offsetRef.current >= totalN) setHasMore(false);
//     } catch (err) {
//       console.error("Error en fetchMore:", err);
//     } finally {
//       fetchingRef.current = false;
//     }
//   }, [fetchFn, limit, hasMore]);

//   // Reset al cambiar deps
//   useEffect(() => {
//     offsetRef.current = 0;
//     setData([]);
//     setTotal(0);
//     setHasMore(true);
//     fetchingRef.current = false;
//   }, deps);

//   // Carga inicial
//   useEffect(() => {
//     loadMore();
//   }, [loadMore]);

//   // Observer sobre el último elemento
//   useEffect(() => {
//     const el = lastRowRef.current;
//     if (observerRef.current) observerRef.current.disconnect();
//     if (el && hasMore) {
//       observerRef.current = new IntersectionObserver(
//         ([entry]) => {
//           if (entry.isIntersecting) loadMore();
//         },
//         { rootMargin: "100px", threshold: 0.1 }
//       );
//       observerRef.current.observe(el);
//     }
//     return () => observerRef.current?.disconnect();
//   }, [data, hasMore, loadMore]);

//   return { data, total, hasMore, loading: fetchingRef.current, lastRowRef };
// };

// export default useInfiniteScroll;


// NUEVO:
import { useState, useRef, useEffect, useCallback } from "react";

const useInfiniteScroll = ({
  fetchFn, // async ({ offset, limit }) => ({ data, total })
  limit = 10,
  deps = [],
}) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const offsetRef = useRef(0);
  const observerRef = useRef(null);
  const lastRowRef = useRef(null);
  const cancelRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const { data: nuevos = [], total: totalN = 0 } = await fetchFn({
        offset: offsetRef.current,
        limit,
      });

      setTotal(totalN);

      setData((prev) => {
        const sinDuplicados = nuevos.filter(
          (n) => !prev.some((p) => p.id === n.id)
        );
        return [...prev, ...sinDuplicados];
      });

      offsetRef.current += limit;
      if (offsetRef.current >= totalN) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error en loadMore:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, limit, hasMore, loading]);

  const refetch = useCallback(async () => {
    cancelRef.current = true; // cancelar cualquier load anterior
    await new Promise((res) => setTimeout(res, 60)); // estabiliza contextos

    cancelRef.current = false;
    offsetRef.current = 0;
    setData([]);
    setTotal(0);
    setHasMore(true);

    try {
      setLoading(true);
      const { data: nuevos = [], total: totalN = 0 } = await fetchFn({
        offset: 0,
        limit,
      });

      if (!cancelRef.current) {
        setData(nuevos);
        setTotal(totalN);
        offsetRef.current = nuevos.length;
        setHasMore(nuevos.length < totalN);
      }
    } catch (err) {
      console.error("Error en refetch:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, limit]);

  // 🔄 Reaccionar a deps de forma controlada y estable
  useEffect(() => {
    let cancelado = false;

    const ejecutar = async () => {
      await new Promise((res) => setTimeout(res, 60)); // debounce para evitar doble carga
      if (!cancelado) {
        await refetch();
      }
    };

    ejecutar();

    return () => {
      cancelado = true;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  // 🔍 Observer para scroll infinito
  useEffect(() => {
    const el = lastRowRef.current;
    if (observerRef.current) observerRef.current.disconnect();

    if (el && hasMore) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !loading) loadMore();
        },
        { rootMargin: "100px", threshold: 0.1 }
      );
      observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [data, hasMore, loadMore, loading]);

  return {
    data,
    total,
    hasMore,
    loading,
    lastRowRef,
    refetch,
  };
};

export default useInfiniteScroll;
