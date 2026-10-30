import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

export const imgUrl = (src) => (src && src.startsWith("/api/") ? `${process.env.REACT_APP_BACKEND_URL}${src}` : src);

export const useCatalog = (kind) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    try {
      const { data } = await api.get(`/catalog/${kind}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [kind]);
  useEffect(() => { reload(); }, [reload]);
  return { items, loading, reload };
};
