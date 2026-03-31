import type { BirthdayData } from "@/contexts/BirthdayContext";

export interface CelebrationRecord extends BirthdayData {
  id: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined" && window.location.port === "8080" ? "http://localhost:4000" : "");

export const createCelebration = async (payload: BirthdayData): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/celebrations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create celebration");
  }

  return response.json();
};

export const getCelebration = async (id: string): Promise<CelebrationRecord> => {
  const response = await fetch(`${API_BASE_URL}/api/celebrations/${id}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to load celebration");
  }

  return response.json();
};
