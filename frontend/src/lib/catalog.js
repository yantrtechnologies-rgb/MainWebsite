import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";

export const imgUrl = (src) => (src && src.startsWith("/api/") ? `${backendUrl}${src}` : src);

const catalogItems = (payload, kind) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.[kind])) return payload[kind];
  return [];
};

export const useCatalog = (kind) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    try {
      const { data } = await api.get(`/catalog/${kind}`);
      // A failed request or a wrapped API response must never replace the list
      // with an object: every catalog consumer renders this value as an array.
      setItems(catalogItems(data, kind));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [kind]);
  useEffect(() => { reload(); }, [reload]);
  return { items, loading, reload };
};
