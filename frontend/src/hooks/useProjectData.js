import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/context/AppContext";

/** Fetches a dashboard endpoint scoped to the active project. */
export function useProjectData(path, params = {}) {
  const { projectId } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const extra = JSON.stringify(params);

  const reload = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await api.get(path, { params: { project_id: projectId, ...JSON.parse(extra) } });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [path, projectId, extra]);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, reload, projectId };
}
