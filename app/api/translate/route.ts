import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MAX_ENTRIES = 200;
const MAX_CHARS = 1000;

// Traduce pares "clave → texto" (textos de la interfaz o de la carta) a cualquier idioma
export async function POST(req: Request) {
  try {
    const { targetLanguage, entries } = await req.json();

    if (typeof targetLanguage !== "string" || !/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(targetLanguage)) {
      return NextResponse.json({ error: "Idioma no válido." }, { status: 400 });
    }
    if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
      return NextResponse.json({ error: "Faltan los textos a traducir." }, { status: 400 });
    }
    const source = Object.fromEntries(
      Object.entries(entries as Record<string, unknown>)
        .filter(([, value]) => typeof value === "string")
        .slice(0, MAX_ENTRIES)
        .map(([key, value]) => [key, (value as string).slice(0, MAX_CHARS)])
    );

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "No se encontró GEMINI_API_KEY en el servidor." },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    let targetName = targetLanguage;
    try {
      targetName = new Intl.DisplayNames(["en"], { type: "language" }).of(targetLanguage) ?? targetLanguage;
    } catch {
      // Se usa el código tal cual
    }

    const prompt = `Translate the values of this JSON object into ${targetName} (language code "${targetLanguage}").
It contains interface texts and dish descriptions for a restaurant app in Santa Marta, Colombia.
Rules:
- Return ONLY a JSON object with exactly the same keys.
- Keep placeholders like {n}, {name}, {mb} and {currency} unchanged.
- Keep proper names of Colombian dishes (Cayeye, Sierra, Patacón, Titoté, Hogao), "SaborAI", "Gemini", "ExchangeRate-API", "PDF", "JPG", "PNG", "MB" and "COP" untranslated.
- Use a warm, natural tone, as a native speaker would write it.

${JSON.stringify(source)}`;

    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];
    let responseText: string | undefined;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Translate model ${model} failed, trying next:`, err.message || err.status);
      }
    }

    if (!responseText) {
      return NextResponse.json({ error: "No se pudo traducir en este momento." }, { status: 502 });
    }

    // Solo se devuelven claves conocidas con texto; el cliente completa el resto con el original
    const parsed = JSON.parse(responseText);
    const translations = Object.fromEntries(
      Object.keys(source)
        .filter((key) => typeof parsed?.[key] === "string" && parsed[key].trim())
        .map((key) => [key, parsed[key]])
    );

    return NextResponse.json({ translations });
  } catch (err: any) {
    console.error("Error in translate API:", err);
    return NextResponse.json({ error: "Error al traducir." }, { status: 500 });
  }
}
