export interface Dish {
  id: string;
  name: string;
  description: string;
  priceCOP: number;
  allergens: string[];
  isVegetarian: boolean;
  localHighlight?: string;
}

export interface MenuData {
  restaurantName: string;
  currency: string;
  dishes: Dish[];
}

// Código ISO 4217 ("COP", "JPY"...). La lista completa llega de /api/rates
export type CurrencyCode = string;

// Monedas que aparecen primero en el selector
export const PINNED_CURRENCIES: CurrencyCode[] = ["COP", "USD", "EUR"];

// Unidades de cada moneda por 1 COP, mientras cargan las tasas en vivo
export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  COP: 1,
  USD: 1 / 4000,
  EUR: 1 / 4300,
};

// Símbolo corto de una moneda ("$", "€", "¥"...)
export const currencySymbol = (code: CurrencyCode, locale: string) => {
  try {
    return (
      new Intl.NumberFormat(locale, { style: "currency", currency: code, currencyDisplay: "narrowSymbol" })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? code
    );
  } catch {
    return code;
  }
};

// COP y otras monedas sin centavos de uso práctico se muestran sin decimales
export const currencyDigits = (code: CurrencyCode) => {
  try {
    const digits = new Intl.NumberFormat("en", { style: "currency", currency: code }).resolvedOptions()
      .maximumFractionDigits;
    return code === "COP" ? 0 : digits ?? 2;
  } catch {
    return 2;
  }
};

// Hash corto y estable para claves de caché (carta traducida por idioma)
export const hashString = (value: string) => {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(36);
};

// Límite de subida: Gemini acepta datos inline de hasta ~20 MB en total
export const MAX_UPLOAD_MB = 10;

export const DEFAULT_MENU: MenuData = {
  restaurantName: "Restaurante Donde Chela - Bahía de Taganga",
  currency: "COP",
  dishes: [
    {
      id: "1",
      name: "Pescado Frito Sierra Tradicional",
      description: "Sierra fresca de la bahía frita al punto, con arroz de coco titoté, patacón crocante y ensalada samaria.",
      priceCOP: 38000,
      allergens: ["pescado"],
      isVegetarian: false,
      localHighlight: "Capturado en la madrugada por pescadores artesanales de Taganga."
    },
    {
      id: "2",
      name: "Cayeye Tradicional con Queso Costeño",
      description: "Puré de guineo verde criollo machacado con mantequilla, coronado con queso costeño salado y hogao.",
      priceCOP: 18000,
      allergens: ["lácteos"],
      isVegetarian: true,
      localHighlight: "Plato insigne de Santa Marta y la zona bananera del Magdalena."
    },
    {
      id: "3",
      name: "Cazuela de Mariscos Samaria",
      description: "Camarones, calamares y caracol en reducción cremosa de leche de coco fresca con toque de cilantro cimarrón.",
      priceCOP: 45000,
      allergens: ["mariscos", "moluscos", "lácteos"],
      isVegetarian: false,
      localHighlight: "Receta tradicional de la bahía con leche de coco recién extraída."
    },
    {
      id: "4",
      name: "Limonada de Coco Frappé",
      description: "Bebida granizada con crema de coco natural y limón mandarino.",
      priceCOP: 12000,
      allergens: [],
      isVegetarian: true,
      localHighlight: "Bebida refrescante por excelencia para el calor caribeño."
    }
  ]
};

// Valida lo que venga de localStorage o de la API antes de usarlo como carta
export const isMenuData = (value: unknown): value is MenuData => {
  const menu = value as MenuData;
  return (
    !!menu &&
    typeof menu.restaurantName === "string" &&
    Array.isArray(menu.dishes) &&
    menu.dishes.every(
      (d) => typeof d?.id === "string" && typeof d?.name === "string" && typeof d?.priceCOP === "number"
    )
  );
};
