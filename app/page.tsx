"use client";

import React, { useState, useRef } from "react";

interface Dish {
  id: string;
  name: string;
  description: string;
  priceCOP: number;
  allergens: string[];
  isVegetarian: boolean;
  localHighlight?: string;
}

interface MenuData {
  restaurantName: string;
  currency: string;
  dishes: Dish[];
}

type LanguageCode = "es" | "en" | "fr" | "de" | "pt";

const LANGUAGES: Array<{ code: LanguageCode; label: string; flag: string }> = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

const I18N = {
  es: {
    tagline: "Build with AI • DevFest Santa Marta 2026",
    touristTab: "🍽️ Turista (Comensal)",
    adminTab: "📄 Restaurantero (Subir PDF / Foto)",
    liveMenu: "Carta en Vivo",
    subtitle: "Bahía de Taganga, Santa Marta • Especialidad en Pesca del Día y Cayeye Criollo",
    specialties: "Platos & Especialidades",
    clearHighlight: "Limpiar resaltado",
    allergens: "Alérgenos:",
    veggie: "Veggie 🌱",
    aiRecommended: "⭐ Recomendado por SaborAI",
    conciergeTitle: "SaborAI Concierge",
    conciergeSubtitle: "Habla en cualquier idioma",
    welcomeMessage: "¡Hola! Bienvenido a Santa Marta 🌴 Soy tu conserje SaborAI. Pregúntame sobre platos típicos, alérgenos, precios o presupuesto en tu idioma.",
    inputPlaceholder: "Pregunta en tu idioma (alergias, presupuesto, qué pedir)...",
    send: "Enviar",
    thinking: "SaborAI pensando...",
    adminTitle: "Digitaliza la carta de tu restaurante en segundos",
    adminSubtitle: "Sube un archivo PDF o una fotografía de tu menú físico o pizarra. Gemini 1.5 Flash extraerá los platos, precios y alérgenos automáticamente.",
    uploadPrompt: "Haz clic para subir un PDF o imagen del menú",
    uploadFormats: "Formatos admitidos: PDF, JPG, PNG • Menús digitales, volantes o cartas físicas",
    processButton: "✨ Digitalizar con Gemini 1.5 Flash",
    processing: "Gemini 1.5 Flash analizando documento y alérgenos...",
    success: "¡Menú digitalizado con éxito!",
    chips: [
      { label: "🦀 Sin mariscos (<$35k COP)", prompt: "Soy alérgico a los mariscos, mi presupuesto es de $35.000 COP, ¿qué me recomiendas?" },
      { label: "🍌 ¿Qué es el Cayeye?", prompt: "¿Qué es el Cayeye tradicional y qué ingredientes lleva?" },
      { label: "🌱 Opciones vegetarianas", prompt: "Soy vegetariano, ¿qué platos típicos puedo probar aquí?" }
    ]
  },
  en: {
    tagline: "Build with AI • DevFest Santa Marta 2026",
    touristTab: "🍽️ Tourist (Diner)",
    adminTab: "📄 Restaurant (Upload PDF / Photo)",
    liveMenu: "Live Menu",
    subtitle: "Taganga Bay, Santa Marta • Fresh Catch of the Day & Traditional Cayeye",
    specialties: "Dishes & Specialties",
    clearHighlight: "Clear highlight",
    allergens: "Allergens:",
    veggie: "Veggie 🌱",
    aiRecommended: "⭐ Recommended by SaborAI",
    conciergeTitle: "SaborAI Concierge",
    conciergeSubtitle: "Speaks all languages fluently",
    welcomeMessage: "Hello! Welcome to Santa Marta 🌴 I am your SaborAI concierge. Ask me about local dishes, allergies, budget or ingredients in your language!",
    inputPlaceholder: "Ask anything (allergies, budget, what to order)...",
    send: "Send",
    thinking: "SaborAI is thinking...",
    adminTitle: "Digitize your restaurant menu in seconds",
    adminSubtitle: "Upload a PDF menu file or snap a picture of your physical chalkboard/menu. Gemini 1.5 Flash extracts dishes, prices, and allergens automatically.",
    uploadPrompt: "Click to upload a PDF or Menu Image",
    uploadFormats: "Supported formats: PDF, JPG, PNG • Digital PDFs or physical photos",
    processButton: "✨ Digitize with Gemini 1.5 Flash",
    processing: "Gemini 1.5 Flash analyzing document & allergens...",
    success: "Menu digitized successfully!",
    chips: [
      { label: "🦀 No shellfish (<$35k COP)", prompt: "I am allergic to shellfish, my budget is $35,000 COP, what do you recommend?" },
      { label: "🍌 What is Cayeye?", prompt: "What is traditional Cayeye and what are its ingredients?" },
      { label: "🌱 Vegetarian options", prompt: "I am vegetarian, what local dishes can I order here?" }
    ]
  },
  fr: {
    tagline: "Build with AI • DevFest Santa Marta 2026",
    touristTab: "🍽️ Touriste (Client)",
    adminTab: "📄 Restaurateur (Importer PDF / Photo)",
    liveMenu: "Menu en Direct",
    subtitle: "Baie de Taganga, Santa Marta • Poisson frais du jour et Cayeye traditionnel",
    specialties: "Plats & Spécialités",
    clearHighlight: "Effacer la sélection",
    allergens: "Allergènes :",
    veggie: "Végétarien 🌱",
    aiRecommended: "⭐ Recommandé par SaborAI",
    conciergeTitle: "SaborAI Concierge",
    conciergeSubtitle: "Parle couramment votre langue",
    welcomeMessage: "Bonjour ! Bienvenue à Santa Marta 🌴 Je suis votre concierge SaborAI. Posez-moi vos questions sur les plats, allergies, prix ou budget !",
    inputPlaceholder: "Posez votre question (allergies, budget, conseils)...",
    send: "Envoyer",
    thinking: "SaborAI réfléchit...",
    adminTitle: "Numérisez le menu de votre restaurant en quelques secondes",
    adminSubtitle: "Téléversez un fichier PDF ou prenez une photo de votre menu papier. Gemini 1.5 Flash extrait les plats, prix et allergènes automatiquement.",
    uploadPrompt: "Cliquez pour téléverser un PDF ou une photo du menu",
    uploadFormats: "Formats pris en charge : PDF, JPG, PNG",
    processButton: "✨ Numériser avec Gemini 1.5 Flash",
    processing: "Gemini 1.5 Flash analyse le document et les allergènes...",
    success: "Menu numérisé avec succès !",
    chips: [
      { label: "🦀 Sans crustacés (<35k COP)", prompt: "Je suis allergique aux fruits de mer, mon budget est de 35 000 COP, que me conseillez-vous ?" },
      { label: "🍌 Qu'est-ce que le Cayeye ?", prompt: "Qu'est-ce que le Cayeye traditionnel et de quoi est-il composé ?" },
      { label: "🌱 Options végétariennes", prompt: "Je suis végétarien, quels plats traditionnels me recommandez-vous ?" }
    ]
  },
  de: {
    tagline: "Build with AI • DevFest Santa Marta 2026",
    touristTab: "🍽️ Tourist (Gast)",
    adminTab: "📄 Restaurant (PDF / Foto hochladen)",
    liveMenu: "Aktuelle Speisekarte",
    subtitle: "Taganga-Bucht, Santa Marta • Fangfrischer Fisch & traditionelles Cayeye",
    specialties: "Gerichte & Spezialitäten",
    clearHighlight: "Hervorhebung löschen",
    allergens: "Allergene:",
    veggie: "Vegetarisch 🌱",
    aiRecommended: "⭐ Von SaborAI empfohlen",
    conciergeTitle: "SaborAI Concierge",
    conciergeSubtitle: "Spricht Ihre Sprache",
    welcomeMessage: "Hallo! Willkommen in Santa Marta 🌴 Ich bin Ihr SaborAI Concierge. Fragen Sie mich nach Gerichten, Allergenen oder Budget!",
    inputPlaceholder: "Fragen Sie auf Deutsch (Allergien, Budget, Empfehlungen)...",
    send: "Senden",
    thinking: "SaborAI denkt nach...",
    adminTitle: "Speisekarte in Sekundenschnelle digitalisieren",
    adminSubtitle: "Laden Sie ein PDF hoch oder fotografieren Sie Ihre Speisekarte. Gemini 1.5 Flash extrahiert Gerichte, Preise und Allergene automatisch.",
    uploadPrompt: "Klicken Sie hier, um ein PDF oder Menü-Foto hochzuladen",
    uploadFormats: "Unterstützte Formate: PDF, JPG, PNG",
    processButton: "✨ Mit Gemini 1.5 Flash digitalisieren",
    processing: "Gemini 1.5 Flash analysiert Dokument & Allergene...",
    success: "Menü erfolgreich digitalisiert!",
    chips: [
      { label: "🦀 Keine Meeresfrüchte (<35k COP)", prompt: "Ich bin allergisch gegen Meeresfrüchte, mein Budget ist 35.000 COP, was empfehlen Sie?" },
      { label: "🍌 Was ist Cayeye?", prompt: "Was ist traditionelles Cayeye und welche Zutaten enthält es?" },
      { label: "🌱 Vegetarische Optionen", prompt: "Ich bin Vegetarier, welche typischen Gerichte gibt es hier für mich?" }
    ]
  },
  pt: {
    tagline: "Build with AI • DevFest Santa Marta 2026",
    touristTab: "🍽️ Turista (Cliente)",
    adminTab: "📄 Restaurante (Enviar PDF / Foto)",
    liveMenu: "Cardápio ao Vivo",
    subtitle: "Baía de Taganga, Santa Marta • Peixe fresco do dia e Cayeye tradicional",
    specialties: "Pratos e Especialidades",
    clearHighlight: "Limpar destaque",
    allergens: "Alérgenos:",
    veggie: "Vegetariano 🌱",
    aiRecommended: "⭐ Recomendado por SaborAI",
    conciergeTitle: "SaborAI Concierge",
    conciergeSubtitle: "Fala em qualquer idioma",
    welcomeMessage: "Olá! Bem-vindo a Santa Marta 🌴 Sou o seu concierge SaborAI. Pergunte-me sobre pratos locais, alergias, preços ou orçamento!",
    inputPlaceholder: "Pergunte em português (alergias, orçamento, recomendações)...",
    send: "Enviar",
    thinking: "SaborAI pensando...",
    adminTitle: "Digitalize o cardápio do seu restaurante em segundos",
    adminSubtitle: "Envie um arquivo PDF ou foto do cardápio físico. Gemini 1.5 Flash extrai pratos, preços e alérgenos automaticamente.",
    uploadPrompt: "Clique para enviar um PDF ou imagem do cardápio",
    uploadFormats: "Formatos suportados: PDF, JPG, PNG",
    processButton: "✨ Digitalizar com Gemini 1.5 Flash",
    processing: "Gemini 1.5 Flash analisando documento e alérgenos...",
    success: "Cardápio digitalizado com sucesso!",
    chips: [
      { label: "🦀 Sem frutos do mar (<$35k COP)", prompt: "Sou alérgico a frutos do mar, meu orçamento é de 35.000 COP, o que recomenda?" },
      { label: "🍌 O que é Cayeye?", prompt: "O que é o Cayeye tradicional e quais ingredientes leva?" },
      { label: "🌱 Opções vegetarianas", prompt: "Sou vegetariano, quais opções típicas posso pedir aqui?" }
    ]
  }
};

const DEFAULT_MENU: MenuData = {
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

export default function Home() {
  const [lang, setLang] = useState<LanguageCode>("es");
  const [activeTab, setActiveTab] = useState<"turista" | "admin">("turista");
  const [menu, setMenu] = useState<MenuData>(DEFAULT_MENU);
  const [highlightedDishIds, setHighlightedDishIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState<"COP" | "USD" | "EUR">("COP");

  const t = I18N[lang];

  // Chat state
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: t.welcomeMessage
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Admin upload state (Supports both Images and PDFs)
  const [selectedFile, setSelectedFile] = useState<{
    base64: string;
    mimeType: string;
    name: string;
    sizeKB: number;
    isPdf: boolean;
  } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPrice = (cop: number) => {
    if (currency === "USD") {
      return `$${(cop / 4000).toFixed(1)} USD`;
    }
    if (currency === "EUR") {
      return `€${(cop / 4300).toFixed(1)} EUR`;
    }
    return `$${cop.toLocaleString("es-CO")} COP`;
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLang(newLang);
    const newT = I18N[newLang];
    // Mensaje de bienvenida en el nuevo idioma
    setMessages((prev) => [
      ...prev,
      { sender: "ai", text: newT.welcomeMessage }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isChatLoading) return;

    const newMessages = [...messages, { sender: "user" as const, text }];
    setMessages(newMessages);
    setInputMessage("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, menu, language: lang })
      });
      const data = await res.json();

      setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
      if (data.recommendedDishIds && data.recommendedDishIds.length > 0) {
        setHighlightedDishIds(data.recommendedDishIds);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "¡Te recomiendo probar el Cayeye o la Sierra frita fresca!"
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("El reconocimiento de voz requiere Chrome o Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    const langMap: Record<LanguageCode, string> = {
      es: "es-CO",
      en: "en-US",
      fr: "fr-FR",
      de: "de-DE",
      pt: "pt-BR"
    };
    recognition.lang = langMap[lang] || "es-CO";
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      handleSendMessage(transcript);
    };

    recognition.start();
  };

  // Manejo de carga de archivos (Imágenes y PDFs)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          base64: reader.result as string,
          mimeType: isPdf ? "application/pdf" : file.type || "image/jpeg",
          name: file.name,
          sizeKB: Math.round(file.size / 1024),
          isPdf
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Procesar archivo con Gemini 1.5 Flash (Vision / PDF nativo)
  const handleParseMenu = async () => {
    if (!selectedFile) return;

    setIsParsing(true);
    setParseStatus(t.processing);

    try {
      const res = await fetch("/api/parse-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: selectedFile.base64,
          mimeType: selectedFile.mimeType
        })
      });

      const data = await res.json();
      if (data && data.dishes) {
        setMenu(data);
        setParseStatus(t.success);
        setTimeout(() => setActiveTab("turista"), 1200);
      }
    } catch (err) {
      setParseStatus("Error al procesar el archivo. Usando menú de respaldo.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Navbar Superior */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-teal-500 flex items-center justify-center text-white text-xl shadow-md">
              🌴
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg leading-tight text-slate-800">MenúSamario AI</h1>
                <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
                  Build with AI
                </span>
              </div>
              <p className="text-xs text-slate-500">{t.tagline}</p>
            </div>
          </div>

          {/* Selectores: Idioma, Moneda y Modo */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Selector de Idiomas */}
            <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-medium text-slate-700">
              {LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  onClick={() => handleLanguageChange(item.code)}
                  title={item.label}
                  className={`px-2 py-1 rounded transition flex items-center gap-1 ${
                    lang === item.code
                      ? "bg-white text-teal-800 font-bold shadow-xs"
                      : "hover:text-slate-900 opacity-80 hover:opacity-100"
                  }`}
                >
                  <span>{item.flag}</span>
                  <span className="uppercase text-[10px] font-bold">{item.code}</span>
                </button>
              ))}
            </div>

            {/* Moneda */}
            <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-medium text-slate-600">
              {(["COP", "USD", "EUR"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2 py-1 rounded ${
                    currency === curr ? "bg-white text-slate-900 shadow-xs font-bold" : ""
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Pestañas Modo */}
            <div className="flex bg-teal-50 border border-teal-200 rounded-lg p-1 text-xs font-medium">
              <button
                onClick={() => setActiveTab("turista")}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeTab === "turista"
                    ? "bg-teal-600 text-white font-semibold shadow-xs"
                    : "text-teal-800 hover:text-teal-950"
                }`}
              >
                {t.touristTab}
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeTab === "admin"
                    ? "bg-teal-600 text-white font-semibold shadow-xs"
                    : "text-teal-800 hover:text-teal-950"
                }`}
              >
                {t.adminTab}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {activeTab === "turista" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Columna Izquierda: Menú Digital (7 columnas) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-xs bg-teal-900/60 text-teal-200 px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                    {t.liveMenu}
                  </span>
                  <h2 className="text-2xl font-black mt-1">{menu.restaurantName}</h2>
                  <p className="text-teal-100 text-xs mt-1">{t.subtitle}</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 pointer-events-none">
                  🐟
                </div>
              </div>

              {/* Lista de Platos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                    {t.specialties} ({menu.dishes.length})
                  </h3>
                  {highlightedDishIds.length > 0 && (
                    <button
                      onClick={() => setHighlightedDishIds([])}
                      className="text-xs text-amber-600 font-semibold hover:underline"
                    >
                      {t.clearHighlight}
                    </button>
                  )}
                </div>

                {menu.dishes.map((dish) => {
                  const isHighlighted = highlightedDishIds.includes(dish.id);
                  return (
                    <div
                      key={dish.id}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        isHighlighted
                          ? "bg-amber-50/90 border-amber-400 shadow-md ring-2 ring-amber-400/50 scale-[1.01]"
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-slate-900">{dish.name}</h4>
                            {dish.isVegetarian && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                {t.veggie}
                              </span>
                            )}
                            {isHighlighted && (
                              <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                                {t.aiRecommended}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {dish.description}
                          </p>
                          {dish.localHighlight && (
                            <p className="text-[11px] text-teal-700 bg-teal-50/80 rounded px-2 py-1 inline-block font-medium">
                              🌴 {dish.localHighlight}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-emerald-700 text-base">
                            {formatPrice(dish.priceCOP)}
                          </span>
                        </div>
                      </div>

                      {/* Alérgenos */}
                      {dish.allergens && dish.allergens.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-600 font-semibold uppercase">
                            {t.allergens}
                          </span>
                          {dish.allergens.map((alg) => (
                            <span
                              key={alg}
                              className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-medium"
                            >
                              ⚠️ {alg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Columna Derecha: Asistente SaborAI Concierge (5 columnas) */}
            <div className="lg:col-span-5 flex flex-col h-[640px] bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden sticky top-20">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{t.conciergeTitle}</h3>
                    <p className="text-[11px] text-teal-100">{t.conciergeSubtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] bg-teal-800 text-teal-200 px-2.5 py-1 rounded-full font-medium">
                  <span>Gemini 1.5 Flash</span>
                </div>
              </div>

              {/* Chips Rápidos de Prueba en el idioma activo */}
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar text-xs">
                {t.chips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip.prompt)}
                    className="bg-white border border-slate-200 hover:border-teal-500 text-slate-700 px-2.5 py-1 rounded-full shrink-0 transition text-[11px] font-medium"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Mensajes del Chat */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                        m.sender === "user"
                          ? "bg-teal-600 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-none px-3.5 py-2 text-slate-500 text-xs flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      <span className="ml-1 text-[11px]">{t.thinking}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Caja de entrada con micrófono */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-2"
                >
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2.5 rounded-xl border transition ${
                      isRecording
                        ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
                    }`}
                    title="Hablar por micrófono"
                  >
                    🎙️
                  </button>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={t.inputPlaceholder}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !inputMessage.trim()}
                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition"
                  >
                    {t.send}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* MODO RESTAURANTERO (CARGAR PDF O FOTO) */
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-4xl">📄</span>
              <h2 className="text-xl font-black text-slate-900">{t.adminTitle}</h2>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">{t.adminSubtitle}</p>
            </div>

            {/* Zona de Subida de Archivo (PDF o Imagen) */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-3">
                  {selectedFile.isPdf ? (
                    <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-teal-200 shadow-xs max-w-sm mx-auto">
                      <span className="text-5xl mb-2">📑</span>
                      <p className="font-bold text-slate-800 text-sm text-center break-all">
                        {selectedFile.name}
                      </p>
                      <span className="text-[11px] bg-red-100 text-red-700 font-semibold px-2.5 py-0.5 rounded-full mt-1">
                        Documento PDF ({selectedFile.sizeKB} KB)
                      </span>
                    </div>
                  ) : (
                    <img
                      src={selectedFile.base64}
                      alt="Previsualización del menú"
                      className="max-h-56 rounded-lg shadow-xs mx-auto object-contain border"
                    />
                  )}
                  <p className="text-xs text-teal-700 font-medium">
                    Clic para cambiar archivo
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-slate-600">
                  <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-2xl mx-auto shadow-xs">
                    📁
                  </div>
                  <p className="text-sm font-bold text-slate-800">{t.uploadPrompt}</p>
                  <p className="text-xs text-slate-500">{t.uploadFormats}</p>
                </div>
              )}
            </div>

            {/* Botón de Procesamiento con IA */}
            <div className="space-y-3">
              <button
                onClick={handleParseMenu}
                disabled={!selectedFile || isParsing}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2"
              >
                {isParsing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{t.processing}</span>
                  </>
                ) : (
                  <>
                    <span>{t.processButton}</span>
                  </>
                )}
              </button>

              {parseStatus && (
                <div className="text-center text-xs font-semibold text-teal-800 bg-teal-50 py-2.5 rounded-lg border border-teal-200">
                  {parseStatus}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
