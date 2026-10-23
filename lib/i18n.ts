// Idioma: cualquier etiqueta BCP 47 ("es", "ja", "pt-BR"...). Cinco idiomas traen
// textos escritos a mano; el resto se traduce con Gemini y se guarda en caché.
export type LanguageCode = string;

export const HANDWRITTEN_LANGUAGES = ["es", "en", "fr", "de", "pt"] as const;

// Idiomas ofrecidos en el selector (ISO 639-1, los que Gemini maneja con soltura)
export const LANGUAGE_CODES: LanguageCode[] = [
  "es", "en", "fr", "de", "pt", "it", "nl", "ca", "gl", "eu", "ru", "uk", "pl", "cs",
  "sk", "sl", "hr", "sr", "bs", "bg", "mk", "ro", "hu", "el", "tr", "sv", "no", "da",
  "fi", "is", "et", "lv", "lt", "ga", "cy", "mt", "sq", "hy", "ka", "az", "kk", "uz",
  "ky", "tg", "tk", "mn", "ar", "he", "fa", "ur", "ps", "ku", "hi", "bn", "pa", "gu",
  "mr", "ta", "te", "kn", "ml", "si", "ne", "or", "as", "zh", "ja", "ko", "vi", "th",
  "lo", "km", "my", "id", "ms", "tl", "jv", "su", "sw", "am", "ti", "so", "ha", "yo",
  "ig", "zu", "xh", "af", "st", "sn", "rw", "mg", "ny", "ht", "qu", "gn", "ay", "eo",
  "la", "lb", "fy", "gd", "be", "mi", "sm", "haw", "yi", "ceb", "hmn"
];

// Idiomas que se escriben de derecha a izquierda
const RTL_LANGUAGES = ["ar", "he", "fa", "ur", "ps", "ku", "yi"];

export const isRtl = (lang: LanguageCode) => RTL_LANGUAGES.includes(lang.split("-")[0]);

export const isLanguageCode = (value: unknown): value is LanguageCode =>
  typeof value === "string" && /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(value);

// Nombre de un idioma: en sí mismo ("日本語") o visto desde otro ("japonés")
export const languageName = (code: LanguageCode, inLanguage: LanguageCode = code) => {
  try {
    const name = new Intl.DisplayNames([inLanguage, "en"], { type: "language" }).of(code) ?? code;
    return name.charAt(0).toLocaleUpperCase(inLanguage) + name.slice(1);
  } catch {
    return code;
  }
};

// Nombre de la moneda en el idioma activo ("Peso colombiano", "US Dollar"...)
export const currencyName = (code: string, lang: LanguageCode) => {
  try {
    const name = new Intl.DisplayNames([lang, "en"], { type: "currency" }).of(code) ?? code;
    return name.charAt(0).toLocaleUpperCase(lang) + name.slice(1);
  } catch {
    return code;
  }
};

// Rellena los marcadores {n}, {name}... de un texto traducido
export const fmt = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));

const es = {
  tagline: "Cartas digitales del Caribe",
  touristTab: "Carta",
  adminTab: "Subir carta",
  language: "Idioma",
  currency: "Moneda",
  search: "Buscar…",
  noMatches: "Sin resultados",
  translating: "Traduciendo…",
  openChat: "Pregúntale a SaborAI",
  closeChat: "Cerrar chat",
  seeInMenu: "Ver en la carta",
  voiceInput: "Dictar por voz",
  location: "Taganga · Santa Marta",
  subtitle: "Pesca del día y cayeye criollo, servidos frente a la bahía.",
  dishCountOne: "{n} plato",
  dishCountOther: "{n} platos",
  pricesIn: "Precios en {currency}",
  ratesSource: "Tasas de ExchangeRate-API",
  specialties: "La carta",
  clearHighlight: "Quitar resaltado",
  avoid: "Evitar",
  vegOnly: "Solo vegetariano",
  clearFilters: "Quitar filtros",
  noResults: "Ningún plato cumple esos filtros.",
  contains: "Contiene",
  vegetarian: "Vegetariano",
  aiRecommended: "Recomendado por SaborAI",
  customMenuActive: "Carta digitalizada: {n} platos de {name}.",
  restoreDemo: "Volver a la carta de ejemplo",
  conciergeTitle: "SaborAI",
  conciergeSubtitle: "Tu conserje gastronómico, en tu idioma",
  welcomeMessage: "¡Hola! Bienvenido a Santa Marta. Soy SaborAI: pregúntame por platos típicos, alérgenos, precios o lo que te alcanza con tu presupuesto.",
  inputPlaceholder: "Alergias, presupuesto, qué pedir…",
  send: "Enviar",
  thinking: "Pensando…",
  chatFallback: "No pude conectarme ahora mismo. Mientras tanto, te recomiendo el cayeye o la sierra frita.",
  voiceUnsupported: "Tu navegador no permite dictado por voz. Escribe tu pregunta en el campo de texto.",
  adminEyebrow: "Para restauranteros",
  adminTitle: "Tu carta en papel, digital en segundos",
  adminSubtitle: "Sube una foto de la carta o la pizarra, o un PDF. Gemini extrae platos, precios y alérgenos.",
  steps: [
    { title: "Toma la foto", body: "Carta impresa, pizarra de tiza o PDF. Que se lea bien." },
    { title: "Gemini la lee", body: "Extrae platos, precios en COP, alérgenos y opciones vegetarianas." },
    { title: "Lista para turistas", body: "La carta queda traducible y el concierge la conoce de inmediato." },
  ],
  uploadPrompt: "Arrastra el archivo aquí o haz clic para elegirlo",
  uploadFormats: "PDF, JPG o PNG · hasta {mb} MB",
  pdfDocument: "Documento PDF",
  changeFile: "Cambiar archivo",
  processButton: "Digitalizar carta",
  processing: "Leyendo la carta y sus alérgenos…",
  successParsed: "Listo: {n} platos extraídos de “{name}”.",
  chatMenuLoaded: "Acabo de cargar la carta de “{name}” con {n} platos. Pregúntame lo que quieras sobre ella.",
  parseFailed: "No se pudieron extraer platos del archivo. Prueba con una imagen más nítida.",
  networkError: "Error de red al procesar la carta. Intenta de nuevo.",
  fileTooLarge: "El archivo supera los {mb} MB.",
  unsupportedFile: "Formato no admitido. Usa PDF, JPG o PNG.",
  chips: [
    { label: "Sin mariscos, menos de $35.000", prompt: "Soy alérgico a los mariscos, mi presupuesto es de $35.000 COP, ¿qué me recomiendas?" },
    { label: "¿Qué es el cayeye?", prompt: "¿Qué es el Cayeye tradicional y qué ingredientes lleva?" },
    { label: "Opciones vegetarianas", prompt: "Soy vegetariano, ¿qué platos típicos puedo probar aquí?" }
  ]
};

export type Dictionary = typeof es;

const en: Dictionary = {
  tagline: "Digital menus from the Caribbean",
  touristTab: "Menu",
  adminTab: "Upload menu",
  language: "Language",
  currency: "Currency",
  search: "Search…",
  noMatches: "No matches",
  translating: "Translating…",
  openChat: "Ask SaborAI",
  closeChat: "Close chat",
  seeInMenu: "Show in menu",
  voiceInput: "Voice input",
  location: "Taganga · Santa Marta",
  subtitle: "Catch of the day and traditional cayeye, served on the bay.",
  dishCountOne: "{n} dish",
  dishCountOther: "{n} dishes",
  pricesIn: "Prices in {currency}",
  ratesSource: "Rates by ExchangeRate-API",
  specialties: "The menu",
  clearHighlight: "Clear highlight",
  avoid: "Avoid",
  vegOnly: "Vegetarian only",
  clearFilters: "Clear filters",
  noResults: "No dishes match those filters.",
  contains: "Contains",
  vegetarian: "Vegetarian",
  aiRecommended: "Recommended by SaborAI",
  customMenuActive: "Digitized menu: {n} dishes from {name}.",
  restoreDemo: "Back to the sample menu",
  conciergeTitle: "SaborAI",
  conciergeSubtitle: "Your food concierge, in your language",
  welcomeMessage: "Hello and welcome to Santa Marta! I'm SaborAI: ask me about local dishes, allergens, prices or what fits your budget.",
  inputPlaceholder: "Allergies, budget, what to order…",
  send: "Send",
  thinking: "Thinking…",
  chatFallback: "I couldn't connect right now. In the meantime, try the cayeye or the fried sierra fish.",
  voiceUnsupported: "Your browser doesn't support voice input. Please type your question.",
  adminEyebrow: "For restaurant owners",
  adminTitle: "Your paper menu, digital in seconds",
  adminSubtitle: "Upload a photo of the menu or chalkboard, or a PDF. Gemini extracts dishes, prices and allergens.",
  steps: [
    { title: "Snap a photo", body: "Printed menu, chalkboard or PDF. Make sure it's legible." },
    { title: "Gemini reads it", body: "Extracts dishes, COP prices, allergens and vegetarian options." },
    { title: "Ready for travelers", body: "The menu becomes translatable and the concierge knows it instantly." },
  ],
  uploadPrompt: "Drop the file here or click to choose it",
  uploadFormats: "PDF, JPG or PNG · up to {mb} MB",
  pdfDocument: "PDF document",
  changeFile: "Change file",
  processButton: "Digitize menu",
  processing: "Reading the menu and its allergens…",
  successParsed: "Done: {n} dishes extracted from “{name}”.",
  chatMenuLoaded: "I just loaded the menu of “{name}” with {n} dishes. Ask me anything about it.",
  parseFailed: "Couldn't extract dishes from the file. Try a sharper image.",
  networkError: "Network error while processing the menu. Please try again.",
  fileTooLarge: "The file is larger than {mb} MB.",
  unsupportedFile: "Unsupported format. Use PDF, JPG or PNG.",
  chips: [
    { label: "No shellfish, under $35,000", prompt: "I am allergic to shellfish, my budget is $35,000 COP, what do you recommend?" },
    { label: "What is cayeye?", prompt: "What is traditional Cayeye and what are its ingredients?" },
    { label: "Vegetarian options", prompt: "I am vegetarian, what local dishes can I order here?" }
  ]
};

const fr: Dictionary = {
  tagline: "Menus numériques des Caraïbes",
  touristTab: "Menu",
  adminTab: "Importer un menu",
  language: "Langue",
  currency: "Devise",
  search: "Rechercher…",
  noMatches: "Aucun résultat",
  translating: "Traduction…",
  openChat: "Demander à SaborAI",
  closeChat: "Fermer le chat",
  seeInMenu: "Voir dans le menu",
  voiceInput: "Saisie vocale",
  location: "Taganga · Santa Marta",
  subtitle: "Pêche du jour et cayeye traditionnel, servis face à la baie.",
  dishCountOne: "{n} plat",
  dishCountOther: "{n} plats",
  pricesIn: "Prix en {currency}",
  ratesSource: "Taux : ExchangeRate-API",
  specialties: "La carte",
  clearHighlight: "Effacer la sélection",
  avoid: "Éviter",
  vegOnly: "Végétarien uniquement",
  clearFilters: "Effacer les filtres",
  noResults: "Aucun plat ne correspond à ces filtres.",
  contains: "Contient",
  vegetarian: "Végétarien",
  aiRecommended: "Recommandé par SaborAI",
  customMenuActive: "Menu numérisé : {n} plats de {name}.",
  restoreDemo: "Revenir au menu d'exemple",
  conciergeTitle: "SaborAI",
  conciergeSubtitle: "Votre concierge gastronomique, dans votre langue",
  welcomeMessage: "Bonjour et bienvenue à Santa Marta ! Je suis SaborAI : posez-moi vos questions sur les plats, allergènes, prix ou budget.",
  inputPlaceholder: "Allergies, budget, que commander…",
  send: "Envoyer",
  thinking: "Réflexion…",
  chatFallback: "Connexion impossible pour le moment. En attendant, essayez le cayeye ou la sierra frite.",
  voiceUnsupported: "Votre navigateur ne prend pas en charge la saisie vocale. Écrivez votre question.",
  adminEyebrow: "Pour les restaurateurs",
  adminTitle: "Votre menu papier, numérique en quelques secondes",
  adminSubtitle: "Importez une photo du menu ou de l'ardoise, ou un PDF. Gemini extrait plats, prix et allergènes.",
  steps: [
    { title: "Prenez une photo", body: "Menu imprimé, ardoise ou PDF. Il doit être lisible." },
    { title: "Gemini le lit", body: "Extrait plats, prix en COP, allergènes et options végétariennes." },
    { title: "Prêt pour les voyageurs", body: "Le menu devient traduisible et le concierge le connaît aussitôt." },
  ],
  uploadPrompt: "Déposez le fichier ici ou cliquez pour le choisir",
  uploadFormats: "PDF, JPG ou PNG · jusqu'à {mb} Mo",
  pdfDocument: "Document PDF",
  changeFile: "Changer de fichier",
  processButton: "Numériser le menu",
  processing: "Lecture du menu et des allergènes…",
  successParsed: "Terminé : {n} plats extraits de « {name} ».",
  chatMenuLoaded: "Je viens de charger le menu de « {name} » avec {n} plats. Posez-moi vos questions.",
  parseFailed: "Impossible d'extraire les plats. Essayez une image plus nette.",
  networkError: "Erreur réseau pendant le traitement. Réessayez.",
  fileTooLarge: "Le fichier dépasse {mb} Mo.",
  unsupportedFile: "Format non pris en charge. Utilisez PDF, JPG ou PNG.",
  chips: [
    { label: "Sans crustacés, moins de 35 000 COP", prompt: "Je suis allergique aux fruits de mer, mon budget est de 35 000 COP, que me conseillez-vous ?" },
    { label: "Qu'est-ce que le cayeye ?", prompt: "Qu'est-ce que le Cayeye traditionnel et de quoi est-il composé ?" },
    { label: "Options végétariennes", prompt: "Je suis végétarien, quels plats traditionnels me recommandez-vous ?" }
  ]
};

const de: Dictionary = {
  tagline: "Digitale Speisekarten aus der Karibik",
  touristTab: "Speisekarte",
  adminTab: "Karte hochladen",
  language: "Sprache",
  currency: "Währung",
  search: "Suchen…",
  noMatches: "Keine Treffer",
  translating: "Wird übersetzt…",
  openChat: "SaborAI fragen",
  closeChat: "Chat schließen",
  seeInMenu: "In der Karte zeigen",
  voiceInput: "Spracheingabe",
  location: "Taganga · Santa Marta",
  subtitle: "Fang des Tages und traditionelles Cayeye, direkt an der Bucht.",
  dishCountOne: "{n} Gericht",
  dishCountOther: "{n} Gerichte",
  pricesIn: "Preise in {currency}",
  ratesSource: "Kurse: ExchangeRate-API",
  specialties: "Die Karte",
  clearHighlight: "Hervorhebung löschen",
  avoid: "Ohne",
  vegOnly: "Nur vegetarisch",
  clearFilters: "Filter zurücksetzen",
  noResults: "Kein Gericht passt zu diesen Filtern.",
  contains: "Enthält",
  vegetarian: "Vegetarisch",
  aiRecommended: "Von SaborAI empfohlen",
  customMenuActive: "Digitalisierte Karte: {n} Gerichte von {name}.",
  restoreDemo: "Zurück zur Beispielkarte",
  conciergeTitle: "SaborAI",
  conciergeSubtitle: "Ihr kulinarischer Concierge, in Ihrer Sprache",
  welcomeMessage: "Hallo und willkommen in Santa Marta! Ich bin SaborAI: Fragen Sie mich nach Gerichten, Allergenen, Preisen oder Ihrem Budget.",
  inputPlaceholder: "Allergien, Budget, was bestellen…",
  send: "Senden",
  thinking: "Denke nach…",
  chatFallback: "Gerade keine Verbindung. Probieren Sie inzwischen das Cayeye oder die frittierte Sierra.",
  voiceUnsupported: "Ihr Browser unterstützt keine Spracheingabe. Bitte tippen Sie Ihre Frage.",
  adminEyebrow: "Für Gastronomen",
  adminTitle: "Ihre Papierkarte, in Sekunden digital",
  adminSubtitle: "Laden Sie ein Foto der Karte oder Tafel oder ein PDF hoch. Gemini erkennt Gerichte, Preise und Allergene.",
  steps: [
    { title: "Foto machen", body: "Gedruckte Karte, Kreidetafel oder PDF. Gut lesbar." },
    { title: "Gemini liest sie", body: "Erkennt Gerichte, COP-Preise, Allergene und vegetarische Optionen." },
    { title: "Bereit für Reisende", body: "Die Karte ist übersetzbar und der Concierge kennt sie sofort." },
  ],
  uploadPrompt: "Datei hier ablegen oder klicken, um sie zu wählen",
  uploadFormats: "PDF, JPG oder PNG · bis {mb} MB",
  pdfDocument: "PDF-Dokument",
  changeFile: "Datei ändern",
  processButton: "Karte digitalisieren",
  processing: "Karte und Allergene werden gelesen…",
  successParsed: "Fertig: {n} Gerichte aus „{name}“ erkannt.",
  chatMenuLoaded: "Ich habe die Karte von „{name}“ mit {n} Gerichten geladen. Fragen Sie mich alles dazu.",
  parseFailed: "Keine Gerichte erkannt. Versuchen Sie ein schärferes Bild.",
  networkError: "Netzwerkfehler bei der Verarbeitung. Bitte erneut versuchen.",
  fileTooLarge: "Die Datei ist größer als {mb} MB.",
  unsupportedFile: "Format nicht unterstützt. Verwenden Sie PDF, JPG oder PNG.",
  chips: [
    { label: "Ohne Meeresfrüchte, unter 35.000 COP", prompt: "Ich bin allergisch gegen Meeresfrüchte, mein Budget ist 35.000 COP, was empfehlen Sie?" },
    { label: "Was ist Cayeye?", prompt: "Was ist traditionelles Cayeye und welche Zutaten enthält es?" },
    { label: "Vegetarische Optionen", prompt: "Ich bin Vegetarier, welche typischen Gerichte gibt es hier für mich?" }
  ]
};

const pt: Dictionary = {
  tagline: "Cardápios digitais do Caribe",
  touristTab: "Cardápio",
  adminTab: "Enviar cardápio",
  language: "Idioma",
  currency: "Moeda",
  search: "Buscar…",
  noMatches: "Nenhum resultado",
  translating: "Traduzindo…",
  openChat: "Pergunte ao SaborAI",
  closeChat: "Fechar chat",
  seeInMenu: "Ver no cardápio",
  voiceInput: "Entrada por voz",
  location: "Taganga · Santa Marta",
  subtitle: "Peixe do dia e cayeye tradicional, servidos de frente para a baía.",
  dishCountOne: "{n} prato",
  dishCountOther: "{n} pratos",
  pricesIn: "Preços em {currency}",
  ratesSource: "Taxas: ExchangeRate-API",
  specialties: "O cardápio",
  clearHighlight: "Limpar destaque",
  avoid: "Evitar",
  vegOnly: "Só vegetariano",
  clearFilters: "Limpar filtros",
  noResults: "Nenhum prato corresponde a esses filtros.",
  contains: "Contém",
  vegetarian: "Vegetariano",
  aiRecommended: "Recomendado pelo SaborAI",
  customMenuActive: "Cardápio digitalizado: {n} pratos de {name}.",
  restoreDemo: "Voltar ao cardápio de exemplo",
  conciergeTitle: "SaborAI",
  conciergeSubtitle: "Seu concierge gastronômico, no seu idioma",
  welcomeMessage: "Olá e bem-vindo a Santa Marta! Sou o SaborAI: pergunte sobre pratos típicos, alérgenos, preços ou o que cabe no seu orçamento.",
  inputPlaceholder: "Alergias, orçamento, o que pedir…",
  send: "Enviar",
  thinking: "Pensando…",
  chatFallback: "Não consegui me conectar agora. Enquanto isso, experimente o cayeye ou a sierra frita.",
  voiceUnsupported: "Seu navegador não permite entrada por voz. Digite sua pergunta.",
  adminEyebrow: "Para restaurantes",
  adminTitle: "Seu cardápio de papel, digital em segundos",
  adminSubtitle: "Envie uma foto do cardápio ou da lousa, ou um PDF. O Gemini extrai pratos, preços e alérgenos.",
  steps: [
    { title: "Tire a foto", body: "Cardápio impresso, lousa ou PDF. Precisa estar legível." },
    { title: "O Gemini lê", body: "Extrai pratos, preços em COP, alérgenos e opções vegetarianas." },
    { title: "Pronto para turistas", body: "O cardápio fica traduzível e o concierge o conhece na hora." },
  ],
  uploadPrompt: "Arraste o arquivo aqui ou clique para escolher",
  uploadFormats: "PDF, JPG ou PNG · até {mb} MB",
  pdfDocument: "Documento PDF",
  changeFile: "Trocar arquivo",
  processButton: "Digitalizar cardápio",
  processing: "Lendo o cardápio e os alérgenos…",
  successParsed: "Pronto: {n} pratos extraídos de “{name}”.",
  chatMenuLoaded: "Acabei de carregar o cardápio de “{name}” com {n} pratos. Pergunte o que quiser.",
  parseFailed: "Não foi possível extrair pratos. Tente uma imagem mais nítida.",
  networkError: "Erro de rede ao processar o cardápio. Tente novamente.",
  fileTooLarge: "O arquivo passa de {mb} MB.",
  unsupportedFile: "Formato não suportado. Use PDF, JPG ou PNG.",
  chips: [
    { label: "Sem frutos do mar, até 35.000 COP", prompt: "Sou alérgico a frutos do mar, meu orçamento é de 35.000 COP, o que recomenda?" },
    { label: "O que é cayeye?", prompt: "O que é o Cayeye tradicional e quais ingredientes leva?" },
    { label: "Opções vegetarianas", prompt: "Sou vegetariano, quais opções típicas posso pedir aqui?" }
  ]
};

export const I18N: Record<string, Dictionary> = { es, en, fr, de, pt };

// Aplana el diccionario a pares "ruta → texto" para traducirlo en un solo envío
export const flattenDictionary = (dict: Dictionary): Record<string, string> => {
  const out: Record<string, string> = {};
  const walk = (value: unknown, path: string) => {
    if (typeof value === "string") out[path] = value;
    else if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${path}.${i}`));
    else if (value && typeof value === "object")
      Object.entries(value).forEach(([key, item]) => walk(item, path ? `${path}.${key}` : key));
  };
  walk(dict, "");
  return out;
};

// Reconstruye un diccionario completo; lo que falte cae al texto original
export const buildDictionary = (base: Dictionary, translated: Record<string, string>): Dictionary => {
  const rebuild = (value: unknown, path: string): unknown => {
    if (typeof value === "string") return typeof translated[path] === "string" ? translated[path] : value;
    if (Array.isArray(value)) return value.map((item, i) => rebuild(item, `${path}.${i}`));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, rebuild(item, path ? `${path}.${key}` : key)])
      );
    return value;
  };
  return rebuild(base, "") as Dictionary;
};
