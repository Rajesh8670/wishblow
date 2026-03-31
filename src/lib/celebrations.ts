import type { BirthdayData } from "@/contexts/BirthdayContext";

export interface CelebrationRecord extends BirthdayData {
  id: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined" && window.location.port === "8080" ? "http://localhost:4000" : "");

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const raw = await response.text();

  if (!raw.trim()) {
    throw new Error("API returned an empty response. Check that the backend is running and VITE_API_URL is correct.");
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("API returned a non-JSON response. Check that the request is reaching the backend API, not the frontend site.");
  }
};

export const createCelebration = async (payload: BirthdayData): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/celebrations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ error?: string }>(response).catch(() => ({}));
    throw new Error(data.error || "Failed to create celebration");
  }

  return parseJsonResponse<{ id: string }>(response);
};

export const getCelebration = async (id: string): Promise<CelebrationRecord> => {
  const response = await fetch(`${API_BASE_URL}/api/celebrations/${id}`);

  if (!response.ok) {
    const data = await parseJsonResponse<{ error?: string }>(response).catch(() => ({}));
    throw new Error(data.error || "Failed to load celebration");
  }

  return parseJsonResponse<CelebrationRecord>(response);
};
