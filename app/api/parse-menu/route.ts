import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const FALLBACK_MENU = {
  restaurantName: "Restaurante Donde Chela - Bahía de Taganga",
  currency: "COP",
  dishes: [
    {
      id: "1",
      name: "Pescado Frito Sierra Tradicional",
      description: "Sierra fresca de la bahía frita al punto, servida con arroz de coco titoté, patacón crocante y ensalada.",
      priceCOP: 38000,
      allergens: ["pescado"],
      isVegetarian: false,
      localHighlight: "Capturado en la madrugada por pescadores artesanales de Taganga."
    },
    {
      id: "2",
      name: "Cayeye Tradicional con Queso Costeño",
      description: "Puré suave de guineo verde criollo machacado con mantequilla, coronado con queso costeño salado y hogao.",
      priceCOP: 18000,
      allergens: ["lácteos"],
      isVegetarian: true,
      localHighlight: "Plato icónico de Santa Marta y la zona bananera del Magdalena."
    },
    {
      id: "3",
      name: "Cazuela de Mariscos Samaria",
      description: "Camarones, calamares y caracol en reducción cremosa de leche de coco fresca con toque de cilantro cimarrón.",
      priceCOP: 45000,
      allergens: ["mariscos", "moluscos", "lácteos"],
      isVegetarian: false,
      localHighlight: "Receta típica de pescadores con leche de coco recién extraída."
    },
    {
      id: "4",
      name: "Limonada de Coco Frappé",
      description: "Bebida granizada con crema de coco natural y limón mandarino.",
      priceCOP: 12000,
      allergens: [],
      isVegetarian: true,
      localHighlight: "Bebida refrescante por excelencia para el calor de la costa."
    }
  ]
};

const menuSchema = {
  type: SchemaType.OBJECT,
  properties: {
    restaurantName: { type: SchemaType.STRING },
    dishes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          name: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          priceCOP: { type: SchemaType.NUMBER },
          allergens: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          isVegetarian: { type: SchemaType.BOOLEAN },
          localHighlight: { type: SchemaType.STRING }
        },
        required: ["name", "priceCOP", "allergens"]
      }
    }
  },
  required: ["dishes"]
};

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found, returning fallback mock.");
      return NextResponse.json(FALLBACK_MENU);
    }

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: menuSchema as any,
        temperature: 0.1
      }
    });

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    const prompt = `Eres un asistente experto gastronómico de Santa Marta y el Caribe Colombiano.
Analiza esta imagen que contiene un menú físico o pizarra de un restaurante.
Extrae detalladamente todos los platos, nombres, precios numéricos en pesos colombianos (COP), lista de alérgenos comunes (ej: mariscos, pescado, lácteos, gluten, maní, huevo), marca si es apto para vegetarianos y agrega una nota cultural breve (localHighlight) sobre los ingredientes típicos caribeños (como guineo verde, coco, patacón).`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    const parsed = JSON.parse(text || "{}");

    if (!parsed.dishes || parsed.dishes.length === 0) {
      return NextResponse.json(FALLBACK_MENU);
    }

    return NextResponse.json({
      restaurantName: parsed.restaurantName || "Restaurante Local - Santa Marta",
      currency: "COP",
      dishes: parsed.dishes.map((d: any, idx: number) => ({
        ...d,
        id: d.id || String(idx + 1)
      }))
    });
  } catch (err: any) {
    console.error("Error in parse-menu API:", err);
    return NextResponse.json(FALLBACK_MENU);
  }
}
