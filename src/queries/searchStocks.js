import { API_ENDPOINTS } from "../constants";
import authenticatedFetch from "./authenticatedFetch";

const searchStocks = async ({ queryKey }) => {
  const [, q] = queryKey;
  const url = `${API_ENDPOINTS.tradinglog()}/stocks/search/?q=${encodeURIComponent(q)}`;
  const apiRes = await authenticatedFetch(url);
  if (!apiRes.ok) {
    if (apiRes.status >= 400) {
      throw new Error("forbidden", { cause: apiRes.status });
    }
    throw new Error("unknown", { cause: "stock search failed" });
  }
  return apiRes.json();
};

export default searchStocks;
