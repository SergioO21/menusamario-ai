import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const menuSchema = {
  type: Type.OBJECT,
  properties: {
    restaurantName: { type: Type.STRING },
    dishes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          priceCOP: { type: Type.NUMBER },
          allergens: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          isVegetarian: { type: Type.BOOLEAN },
          localHighlight: { type: Type.STRING }
        },
        required: ["name", "priceCOP", "allergens"]
      }
    }
  },
  required: ["dishes"]
};

export async function POST(req: Request) {
  try {
    const { fileBase64, mimeType } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "No se encontró GEMINI_API_KEY en el servidor." },
        { status: 500 }
      );
    }

    if (!fileBase64) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo." }, { status: 400 });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const cleanBase64 = fileBase64.replace(/^data:[a-zA-Z0-9\/\-\+]+;base64,/, "");
    const effectiveMimeType = mimeType || (fileBase64.startsWith("data:application/pdf") ? "application/pdf" : "image/jpeg");

    const prompt = `Eres un asistente experto gastronómico de Santa Marta y el Caribe Colombiano.
Analiza este documento (que puede ser una fotografía de un menú físico, pizarra o un archivo PDF digital de un restaurante).
Extrae detalladamente TODOS los platos del menú:
- restaurantName: Nombre del restaurante (si no aparece claramente, usa el nombre más representativo o "Restaurante Local").
- dishes: Lista de platos con:
  - id: Identificador único ("1", "2", etc.).
  - name: Nombre del plato (ej: "Pescado Frito", "Arroz de Coco").
  - description: Breve descripción de ingredientes y preparación.
  - priceCOP: Precio en pesos colombianos como número entero (ej: si dice 35.000 o 35k, pon 35000).
  - allergens: Lista de alérgenos comunes (ej: "pescado", "mariscos", "lácteos", "gluten", "maní", "huevo"). Si no tiene, arreglo vacío [].
  - isVegetarian: boolean indicando si es apto para vegetarianos.
  - localHighlight: Breve nota cultural caribeña/samaria sobre los ingredientes típicos (como guineo verde, coco, patacón, pescado de bahía).`;

    const filePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: effectiveMimeType
      }
    };

    // Usar modelos flash disponibles con fallback automático ante picos de demanda
    const candidateModels = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let responseText: string | undefined;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [filePart, prompt],
          config: {
            responseMimeType: "application/json",
            responseSchema: menuSchema,
            temperature: 0.1
          }
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} failed, trying next candidate:`, err.message || err.status);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("No se obtuvo respuesta de los modelos de Gemini.");
    }

    const parsed = JSON.parse(responseText);

    if (!parsed.dishes || !Array.isArray(parsed.dishes) || parsed.dishes.length === 0) {
      return NextResponse.json(
        { error: "No se identificaron platos en el documento cargado. Intenta con una imagen más nítida o centrada." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      restaurantName: parsed.restaurantName || "Restaurante Digitalizado - Santa Marta",
      currency: "COP",
      dishes: parsed.dishes.map((d: any, idx: number) => ({
        id: String(d.id || idx + 1),
        name: d.name || `Plato ${idx + 1}`,
        description: d.description || "",
        priceCOP: typeof d.priceCOP === "number" ? d.priceCOP : parseInt(d.priceCOP, 10) || 20000,
        allergens: Array.isArray(d.allergens) ? d.allergens : [],
        isVegetarian: Boolean(d.isVegetarian),
        localHighlight: d.localHighlight || "Preparación tradicional samaria"
      }))
    });
  } catch (err: any) {
    console.error("Error in parse-menu API:", err);
    return NextResponse.json(
      {
        error: "Error al procesar el documento con IA. Intenta nuevamente en unos segundos.",
        details: err?.message || String(err)
      },
      { status: 500 }
    );
  }
}
