import { getToken } from "./auth";

const API_BASE = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export type PaymentMethod = "card" | "tnm" | "airtel";

export async function simulatePayment(
  businessProfileId: number,
  amount: number,
  currency: string,
  method: PaymentMethod
) {
  const token = await getToken();
  if (!token) throw new Error("Please log in again before making payment.");

  const response = await fetch(`${API_BASE}/api/payments/simulate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ businessProfileId, amount, currency, method }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Payment failed (${response.status})`);
  if (!data.id) throw new Error("Payment was not created.");
  return data as { id: number | string };
}