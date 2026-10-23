import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const LANGUAGE_NAMES: Record<string, string> = {
  es: "español",
  en: "English",
  fr: "français",
  de: "Deutsch",
  pt: "português"
};

export async function POST(req: Request) {
  try {
    const { message, menu, language = "es" } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "Welcome to Santa Marta! I can recommend our delicious traditional dishes like Cayeye or fresh Sierra fish. (Please set your GEMINI_API_KEY to activate full AI assistance).",
        recommendedDishIds: ["2"]
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3
      }
    });

    const menuContext = JSON.stringify(menu || {}, null, 2);
    const targetLangName = LANGUAGE_NAMES[language] || "English";

    const prompt = `Eres "SaborAI", el conserje gastronómico de Santa Marta para el restaurante "${menu?.restaurantName || 'Donde Chela'}".
Tienes a tu disposición el siguiente menú actual en formato JSON:
${menuContext}

REGLAS DE ORO:
1. IDIOMA OBLIGATORIO: Responde SIEMPRE en ${targetLangName.toUpperCase()} (a menos que el usuario explícitamente te hable en otro idioma, en cuyo caso adáptate a su idioma). Traduce o explica los ingredientes de forma clara para un turista internacional, pero mantén los nombres propios de los platos tradicionales (ej. "Cayeye", "Arroz de coco titoté", "Sierra frita").
2. ALERGIAS Y RESTRICCIONES: Si el comensal menciona una alergia (ej. mariscos, gluten, lácteos, frutos secos) o preferencia dietética (vegetariano, vegano), NUNCA recomiendes platos con ese alérgeno y advierte si algún acompañamiento tradicional pudiera tener contaminación cruzada.
3. PRESUPUESTO: Si el usuario indica un presupuesto máximo en COP o moneda extranjera (asume 1 USD ≈ 4.000 COP, 1 EUR ≈ 4.300 COP), asegúrate de que el plato sugerido esté dentro del presupuesto.
4. CULTURA SAMARIA: Explica con orgullo y calidez los ingredientes caribeños (ej. qué es el guineo verde criollo, el coco o el patacón).
5. FORMATO: Da una respuesta conversacional breve y entusiasta (máximo 2 párrafos). Al final de tu respuesta, si recomendaste uno o más platos específicos, añade en una línea separada exactamente esto:
[RECOMMENDED_IDS: id1, id2] donde id1, id2 sean los IDs de los platos del JSON.

Pregunta del comensal: "${message}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text() || "¡Bienvenido a Santa Marta! Te recomiendo probar nuestro delicioso pescado fresco o un cayeye tradicional.";
    
    // Extraer los IDs recomendados
    const match = rawText.match(/\[RECOMMENDED_IDS:\s*([^\]]+)\]/);
    let recommendedDishIds: string[] = [];
    let cleanReply = rawText;

    if (match) {
      recommendedDishIds = match[1].split(",").map((s) => s.trim());
      cleanReply = rawText.replace(/\[RECOMMENDED_IDS:\s*([^\]]+)\]/, "").trim();
    }

    return NextResponse.json({
      reply: cleanReply,
      recommendedDishIds
    });
  } catch (err: any) {
    console.error("Error in chat API:", err);
    return NextResponse.json({
      reply: "¡Hola! En Santa Marta te recomiendo probar el Cayeye tradicional o la pesca fresca del día acompañada de arroz de coco y patacón.",
      recommendedDishIds: ["1", "2"]
    });
  }
}
