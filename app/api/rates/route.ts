import { NextResponse } from "next/server";

// Tasas de referencia si el proveedor no responde (unidades de cada moneda por 1 COP)
const FALLBACK_RATES: Record<string, number> = {
  COP: 1,
  USD: 1 / 4000,
  EUR: 1 / 4300,
};

// Tasas de cambio con base COP para todas las monedas que publica ExchangeRate-API.
// Next guarda la respuesta 12 h: el proveedor actualiza una vez al día.
export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/COP", {
      next: { revalidate: 60 * 60 * 12 }
    });
    const data = await res.json();
    if (!res.ok || data?.result !== "success" || typeof data.rates !== "object") {
      throw new Error(`Respuesta inesperada del proveedor (${res.status})`);
    }
    return NextResponse.json({
      base: "COP",
      rates: data.rates as Record<string, number>,
      updatedAt: data.time_last_update_utc ?? null,
      live: true
    });
  } catch (err: any) {
    console.warn("Exchange rates unavailable, using fallback:", err?.message || err);
    return NextResponse.json({ base: "COP", rates: FALLBACK_RATES, updatedAt: null, live: false });
  }
}
