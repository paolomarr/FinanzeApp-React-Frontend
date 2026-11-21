import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../constants";

// Used while loading, and if the backend is older than /api/instance/:
// behave as a regular instance with every feature enabled.
export const DEFAULT_INSTANCE_INFO = {
  demo: false,
  features: { voice: true, receipt_scan: true },
};

// Public endpoint (no auth token): the login page needs it too.
export const fetchInstance = async () => {
  try {
    const res = await fetch(API_ENDPOINTS.instance());
    if (!res.ok) return DEFAULT_INSTANCE_INFO;
    const info = await res.json();
    return { ...DEFAULT_INSTANCE_INFO, ...info,
      features: { ...DEFAULT_INSTANCE_INFO.features, ...info.features } };
  } catch {
    return DEFAULT_INSTANCE_INFO;
  }
};

const useInstanceInfo = () => {
  const { data } = useQuery({ queryKey: ["instance"], queryFn: fetchInstance });
  return data ?? DEFAULT_INSTANCE_INFO;
};

export default useInstanceInfo;
