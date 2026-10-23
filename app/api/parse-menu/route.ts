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

    const prompt = `Eres un asistente experto en extracción de datos de menús de restaurantes de Santa Marta y el Caribe Colombiano.
Analiza COMPLETAMENTE este documento (que puede ser una fotografía de un menú físico, pizarra o un archivo PDF digital de un restaurante, posiblemente de varias páginas).

INSTRUCCIÓN CRÍTICA: Debes extraer ABSOLUTAMENTE TODOS los platos, bebidas, postres, entradas y cualquier ítem con precio que aparezca en el documento. No omitas ninguno.
Si el menú tiene 50 platos, devuelve los 50. Si tiene 100, devuelve los 100.

Recorre el documento de arriba a abajo, de izquierda a derecha, sección por sección y página por página.
No te detengas hasta haber procesado el documento completo.

Para cada ítem devuelve:
- restaurantName: Nombre del restaurante (si no aparece claramente, usa el nombre más representativo o "Restaurante Local").
- dishes: Lista de platos con:
  - id: Identificador único ("1", "2", etc.).
  - name: Nombre del plato (ej: "Pescado Frito", "Arroz de Coco").
  - description: Breve descripción de ingredientes y preparación.
  - priceCOP: Precio en pesos colombianos como número entero (ej: si dice 35.000 o 35k, pon 35000). Si el ítem no tiene precio visible, pon 0.
  - allergens: Lista de alérgenos comunes (ej: "pescado", "mariscos", "lácteos", "gluten", "maní", "huevo"). Si no tiene, arreglo vacío [].
  - isVegetarian: boolean indicando si es apto para vegetarianos.
  - localHighlight: Breve nota cultural caribeña/samaria sobre los ingredientes típicos (como guineo verde, coco, patacón, pescado de bahía).

RECUERDA: Es imperativo que el arreglo dishes contenga TODOS Y CADA UNO de los ítems del menú sin excepción.`;

    const filePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: effectiveMimeType
      }
    };

    // Usar modelos flash disponibles con fallback automático ante picos de demanda
    const candidateModels = [
      "gemini-3.5-flash",      // modelo principal
      "gemini-3.8-flash",      // fallback
      "gemini-3.1-flash-lite", // fallback ligero
      "gemini-flash-latest",   // último recurso
    ];
    let responseText: string | undefined;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        console.log(`[parse-menu] Trying model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: [filePart, prompt],
          config: {
            responseMimeType: "application/json",
            responseSchema: menuSchema,
            temperature: 0.2,
            // Sin este límite la respuesta se trunca en menús grandes
            maxOutputTokens: 65536,
          }
        });

        if (response.text) {
          console.log(`[parse-menu] SUCCESS with model: ${model}`);
          responseText = response.text;
          break;
        }
        console.warn(`[parse-menu] Model ${model} returned an empty response`);
      } catch (err: any) {
        console.warn(`[parse-menu] Model ${model} failed:`, err.status, err.message);
        lastError = err;
      }
    }

    if (!responseText) {
      const errDetail = lastError?.message || lastError;
      console.error("[parse-menu] All models failed. Last error:", errDetail);
      throw lastError || new Error("No se obtuvo respuesta de los modelos de Gemini.");
    }

    const parsed = JSON.parse(responseText);
    console.log(`[parse-menu] Total dishes extracted: ${parsed.dishes?.length ?? 0}`);

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
        priceCOP: typeof d.priceCOP === "number" ? d.priceCOP : parseInt(d.priceCOP, 10) || 0,
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
