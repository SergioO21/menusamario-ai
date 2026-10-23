"use client";

import React, { useState, useRef, useEffect } from "react";
import Dropdown from "../components/Dropdown";
import {
  ChatIcon,
  CloseIcon,
  MicIcon,
  SendIcon,
  UploadIcon,
  UtensilsIcon
} from "../components/icons";

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

type CurrencyCode = "COP" | "USD" | "EUR";

const CURRENCIES: Array<{ code: CurrencyCode; symbol: string }> = [
  { code: "COP", symbol: "$" },
  { code: "USD", symbol: "US$" },
  { code: "EUR", symbol: "€" },
];

// Nombre de la moneda en el idioma activo ("Peso colombiano", "US Dollar"...)
const currencyName = (code: CurrencyCode, lang: LanguageCode) => {
  try {
    const name = new Intl.DisplayNames([lang], { type: "currency" }).of(code) ?? code;
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return code;
  }
};

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  dishIds?: string[];
}

const I18N = {
  es: {
    tagline: "Build with AI • DevFest Santa Marta 2026",
    touristTab: "Ver carta",
    adminTab: "Subir carta",
    language: "Idioma",
    currency: "Moneda",
    openChat: "Abrir chat con SaborAI",
    closeChat: "Cerrar chat",
    seeInMenu: "Ver en la carta",
    voiceInput: "Dictar por voz",
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
    adminSubtitle: "Sube un archivo PDF o una fotografía de tu menú físico o pizarra. Gemini Flash extraerá los platos, precios y alérgenos automáticamente.",
    uploadPrompt: "Haz clic para subir un PDF o imagen del menú",
    uploadFormats: "Formatos admitidos: PDF, JPG, PNG • Menús digitales, volantes o cartas físicas",
    processButton: "✨ Digitalizar con Gemini Flash",
    processing: "Gemini Flash analizando documento y alérgenos...",
    success: "¡Menú digitalizado con éxito!",
    chips: [
      { label: "🦀 Sin mariscos (<$35k COP)", prompt: "Soy alérgico a los mariscos, mi presupuesto es de $35.000 COP, ¿qué me recomiendas?" },
      { label: "🍌 ¿Qué es el Cayeye?", prompt: "¿Qué es el Cayeye tradicional y qué ingredientes lleva?" },
      { label: "🌱 Opciones vegetarianas", prompt: "Soy vegetariano, ¿qué platos típicos puedo probar aquí?" }
    ]
  },
  en: {
    tagline: "Build with AI • DevFest Santa Marta 2026",
    touristTab: "Menu",
    adminTab: "Upload menu",
    language: "Language",
    currency: "Currency",
    openChat: "Open SaborAI chat",
    closeChat: "Close chat",
    seeInMenu: "Show in menu",
    voiceInput: "Voice input",
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
    adminSubtitle: "Upload a PDF menu file or snap a picture of your physical chalkboard/menu. Gemini Flash extracts dishes, prices, and allergens automatically.",
    uploadPrompt: "Click to upload a PDF or Menu Image",
    uploadFormats: "Supported formats: PDF, JPG, PNG • Digital PDFs or physical photos",
    processButton: "✨ Digitize with Gemini Flash",
    processing: "Gemini Flash analyzing document & allergens...",
    success: "Menu digitized successfully!",
    chips: [
      { label: "🦀 No shellfish (<$35k COP)", prompt: "I am allergic to shellfish, my budget is $35,000 COP, what do you recommend?" },
      { label: "🍌 What is Cayeye?", prompt: "What is traditional Cayeye and what are its ingredients?" },
      { label: "🌱 Vegetarian options", prompt: "I am vegetarian, what local dishes can I order here?" }
    ]
  },
  fr: {
    tagline: "Build with AI • DevFest Santa Marta 2026",
    touristTab: "Menu",
    adminTab: "Importer un menu",
    language: "Langue",
    currency: "Devise",
    openChat: "Ouvrir le chat SaborAI",
    closeChat: "Fermer le chat",
    seeInMenu: "Voir dans le menu",
    voiceInput: "Saisie vocale",
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
    adminSubtitle: "Téléversez un fichier PDF ou prenez une photo de votre menu papier. Gemini Flash extrait les plats, prix et allergènes automatiquement.",
    uploadPrompt: "Cliquez pour téléverser un PDF ou une photo du menu",
    uploadFormats: "Formats pris en charge : PDF, JPG, PNG",
    processButton: "✨ Numériser avec Gemini Flash",
    processing: "Gemini Flash analyse le document et les allergènes...",
    success: "Menu numérisé avec succès !",
    chips: [
      { label: "🦀 Sans crustacés (<35k COP)", prompt: "Je suis allergique aux fruits de mer, mon budget est de 35 000 COP, que me conseillez-vous ?" },
      { label: "🍌 Qu'est-ce que le Cayeye ?", prompt: "Qu'est-ce que le Cayeye traditionnel et de quoi est-il composé ?" },
      { label: "🌱 Options végétariennes", prompt: "Je suis végétarien, quels plats traditionnels me recommandez-vous ?" }
    ]
  },
  de: {
    tagline: "Build with AI • DevFest Santa Marta 2026",
    touristTab: "Speisekarte",
    adminTab: "Karte hochladen",
    language: "Sprache",
    currency: "Währung",
    openChat: "SaborAI-Chat öffnen",
    closeChat: "Chat schließen",
    seeInMenu: "In der Karte zeigen",
    voiceInput: "Spracheingabe",
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
    adminSubtitle: "Laden Sie ein PDF hoch oder fotografieren Sie Ihre Speisekarte. Gemini Flash extrahiert Gerichte, Preise und Allergene automatisch.",
    uploadPrompt: "Klicken Sie hier, um ein PDF oder Menü-Foto hochzuladen",
    uploadFormats: "Unterstützte Formate: PDF, JPG, PNG",
    processButton: "✨ Mit Gemini Flash digitalisieren",
    processing: "Gemini Flash analysiert Dokument & Allergene...",
    success: "Menü erfolgreich digitalisiert!",
    chips: [
      { label: "🦀 Keine Meeresfrüchte (<35k COP)", prompt: "Ich bin allergisch gegen Meeresfrüchte, mein Budget ist 35.000 COP, was empfehlen Sie?" },
      { label: "🍌 Was ist Cayeye?", prompt: "Was ist traditionelles Cayeye und welche Zutaten enthält es?" },
      { label: "🌱 Vegetarische Optionen", prompt: "Ich bin Vegetarier, welche typischen Gerichte gibt es hier für mich?" }
    ]
  },
  pt: {
    tagline: "Build with AI • DevFest Santa Marta 2026",
    touristTab: "Cardápio",
    adminTab: "Enviar cardápio",
    language: "Idioma",
    currency: "Moeda",
    openChat: "Abrir chat com SaborAI",
    closeChat: "Fechar chat",
    seeInMenu: "Ver no cardápio",
    voiceInput: "Entrada por voz",
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
    adminSubtitle: "Envie um arquivo PDF ou foto do cardápio físico. Gemini Flash extrai pratos, preços e alérgenos automaticamente.",
    uploadPrompt: "Clique para enviar um PDF ou imagem do cardápio",
    uploadFormats: "Formatos suportados: PDF, JPG, PNG",
    processButton: "✨ Digitalizar com Gemini Flash",
    processing: "Gemini Flash analisando documento e alérgenos...",
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
  const [isCustomMenu, setIsCustomMenu] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [highlightedDishIds, setHighlightedDishIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>("COP");

  const t = I18N[lang];

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: t.welcomeMessage
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatBubbleRef = useRef<HTMLButtonElement>(null);

  const unreadCount = messages.slice(seenCount).filter((m) => m.sender === "ai").length;

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

  // Con el chat abierto: marcar como leído y bajar al último mensaje
  useEffect(() => {
    if (!isChatOpen) return;
    setSeenCount(messages.length);
    const list = chatScrollRef.current;
    list?.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [isChatOpen, messages.length, isChatLoading]);

  // En móvil el chat ocupa toda la pantalla: bloquear el scroll de fondo.
  // En escritorio, enfocar el campo de texto. Escape cierra en ambos.
  useEffect(() => {
    if (!isChatOpen) return;
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      chatInputRef.current?.focus({ preventScroll: true });
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsChatOpen(false);
        chatBubbleRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isChatOpen]);

  const closeChat = () => {
    setIsChatOpen(false);
    chatBubbleRef.current?.focus({ preventScroll: true });
  };

  const switchTab = (tab: "turista" | "admin") => {
    setActiveTab(tab);
    setIsChatOpen(false);
  };

  const formatPrice = (cop: number) => {
    if (currency === "USD") {
      return { amount: `$${(cop / 4000).toFixed(2)}`, code: "USD" };
    }
    if (currency === "EUR") {
      return { amount: `€${(cop / 4300).toFixed(2)}`, code: "EUR" };
    }
    return { amount: `$${cop.toLocaleString("es-CO")}`, code: "COP" };
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLang(newLang);
    const newT = I18N[newLang];
    // Si la conversación no ha empezado, reemplazar el saludo en vez de acumularlo
    setMessages((prev) =>
      prev.length === 1
        ? [{ sender: "ai", text: newT.welcomeMessage }]
        : [...prev, { sender: "ai", text: newT.welcomeMessage }]
    );
  };

  // Resalta los platos recomendados y los lleva a la vista
  const showDishesInMenu = (dishIds: string[]) => {
    setHighlightedDishIds(dishIds);
    if (window.matchMedia("(max-width: 639px)").matches) setIsChatOpen(false);
    requestAnimationFrame(() => {
      const target = dishIds
        .map((id) => document.getElementById(`dish-${id}`))
        .find(Boolean);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
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

      const dishIds: string[] = (data.recommendedDishIds || []).filter((id: string) =>
        menu.dishes.some((dish) => dish.id === id)
      );
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply, dishIds }]);
      if (dishIds.length > 0) {
        setHighlightedDishIds(dishIds);
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
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "El reconocimiento de voz no está soportado en este navegador o entorno. Puedes escribir tu consulta en el campo de texto."
        }
      ]);
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

  // Procesar archivo con Gemini Flash (Vision / PDF nativo)
  const handleParseMenu = async () => {
    if (!selectedFile) return;

    setIsParsing(true);
    setParseError(null);
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
      if (res.ok && data && data.dishes && data.dishes.length > 0) {
        setMenu(data);
        setIsCustomMenu(true);
        setHighlightedDishIds([]);
        setParseStatus(`¡Menú digitalizado con éxito! (${data.dishes.length} platos extraídos de "${data.restaurantName}")`);
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `🌴 ¡Carta digitalizada con éxito! Acabo de cargar ${data.dishes.length} platos de "${data.restaurantName}". Pregúntame sobre cualquier plato, ingredientes, precios o alérgenos en tu idioma.`
          }
        ]);
        setTimeout(() => setActiveTab("turista"), 1400);
      } else {
        const errText = data?.error || "No se pudieron extraer los platos del archivo. Asegúrate de que el menú sea legible.";
        setParseError(errText);
        setParseStatus(errText);
      }
    } catch (err: any) {
      const errText = "Error de red al procesar el menú. Por favor intenta de nuevo.";
      setParseError(errText);
      setParseStatus(errText);
    } finally {
      setIsParsing(false);
    }
  };

  // Selector de modo: en móvil y tablet va bajo el header, en escritorio dentro de él
  const renderModeSwitch = (className: string) => (
    <div className={`grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm font-semibold ${className}`}>
      {(["turista", "admin"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          aria-pressed={activeTab === tab}
          onClick={() => switchTab(tab)}
          className={`flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
            activeTab === tab
              ? "bg-white text-teal-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {tab === "turista" ? (
            <UtensilsIcon className="h-4 w-4" />
          ) : (
            <UploadIcon className="h-4 w-4" />
          )}
          <span>{tab === "turista" ? t.touristTab : t.adminTab}</span>
        </button>
      ))}
    </div>
  );

  const activeLanguage = LANGUAGES.find((item) => item.code === lang) ?? LANGUAGES[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar Superior */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-teal-500 text-lg text-white shadow-sm sm:h-10 sm:w-10">
              🌴
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-display text-base font-bold leading-tight text-slate-900 sm:text-lg">
                  MenúSamario AI
                </h1>
              </div>
              <p className="hidden text-xs text-slate-500 sm:block">{t.tagline}</p>
            </div>
          </div>

          {renderModeSwitch("hidden lg:grid")}

          {/* Selectores: Idioma y Moneda */}
          <div className="flex shrink-0 items-center gap-1.5">
            <Dropdown<LanguageCode>
              label={t.language}
              value={lang}
              onChange={handleLanguageChange}
              options={LANGUAGES.map((item) => ({
                value: item.code,
                label: item.label,
                icon: item.flag
              }))}
            >
              <span className="text-base leading-none">{activeLanguage.flag}</span>
              <span className="hidden text-xs font-bold uppercase sm:inline">{activeLanguage.code}</span>
            </Dropdown>

            <Dropdown<CurrencyCode>
              label={t.currency}
              value={currency}
              onChange={setCurrency}
              options={CURRENCIES.map((item) => ({
                value: item.code,
                label: item.code,
                hint: currencyName(item.code, lang),
                icon: (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                    {item.symbol}
                  </span>
                )
              }))}
            >
              <span className="text-xs font-bold">{currency}</span>
            </Dropdown>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto max-w-5xl px-4 pb-32 pt-4 sm:pt-6">
        {renderModeSwitch("mb-4 lg:hidden")}

        {activeTab === "turista" ? (
          <div className="space-y-5">
            {/* Portada del restaurante */}
            <section className="relative overflow-hidden rounded-3xl bg-teal-900 px-5 pb-12 pt-5 text-white sm:px-8 sm:pb-14 sm:pt-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-teal-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t.liveMenu}
              </span>
              <h2 className="mt-3 text-balance font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                {menu.restaurantName}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-teal-100/90 sm:text-base">
                {t.subtitle}
              </p>
              {/* Mar y arena */}
              <svg
                viewBox="0 0 400 40"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-8 w-full sm:h-10"
              >
                <path d="M0 20 C50 8 100 8 150 20 S250 34 300 22 S370 10 400 16 V40 H0Z" fill="rgb(45 212 191 / 0.22)" />
                <path d="M0 30 C60 20 120 22 180 30 S300 40 400 27 V40 H0Z" fill="#f2d29b" />
              </svg>
            </section>

            {isCustomMenu && (
              <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  ✨ <strong>¡Carta digitalizada activa!</strong> {menu.dishes.length} platos cargados para{" "}
                  <em>{menu.restaurantName}</em>.
                </p>
                <button
                  onClick={() => {
                    setMenu(DEFAULT_MENU);
                    setIsCustomMenu(false);
                    setHighlightedDishIds([]);
                  }}
                  className="shrink-0 self-start font-semibold text-teal-800 underline underline-offset-2 hover:text-teal-950 sm:self-auto"
                >
                  Restaurar menú demo
                </button>
              </div>
            )}

            {/* Lista de Platos */}
            <section className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {t.specialties}{" "}
                  <span className="font-sans text-base font-medium text-slate-400">{menu.dishes.length}</span>
                </h3>
                {highlightedDishIds.length > 0 && (
                  <button
                    onClick={() => setHighlightedDishIds([])}
                    className="shrink-0 text-sm font-semibold text-amber-700 hover:underline"
                  >
                    {t.clearHighlight}
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {menu.dishes.map((dish) => {
                  const isHighlighted = highlightedDishIds.includes(dish.id);
                  const price = formatPrice(dish.priceCOP);
                  const hasAllergens = dish.allergens && dish.allergens.length > 0;
                  return (
                    <article
                      key={dish.id}
                      id={`dish-${dish.id}`}
                      className={`scroll-mt-24 rounded-2xl border p-4 transition-colors duration-300 sm:p-5 ${
                        isHighlighted
                          ? "border-amber-300 bg-amber-50 ring-2 ring-amber-400/60"
                          : "border-slate-200/80 bg-white"
                      }`}
                    >
                      {isHighlighted && (
                        <span className="mb-2.5 inline-flex rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold text-amber-950">
                          {t.aiRecommended}
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-display text-lg font-bold leading-snug text-slate-900">
                          {dish.name}
                        </h4>
                        <p className="shrink-0 pt-0.5 text-right leading-none">
                          <span className="font-display text-lg font-extrabold text-teal-800">
                            {price.amount}
                          </span>
                          <span className="mt-1 block text-[10px] font-semibold text-slate-400">
                            {price.code}
                          </span>
                        </p>
                      </div>

                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{dish.description}</p>

                      {dish.localHighlight && (
                        <p className="mt-3 flex gap-2 rounded-xl bg-teal-50 px-3 py-2 text-[13px] leading-snug text-teal-800">
                          <span aria-hidden="true">🌴</span>
                          <span>{dish.localHighlight}</span>
                        </p>
                      )}

                      {/* Vegetariano y alérgenos */}
                      {(dish.isVegetarian || hasAllergens) && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {dish.isVegetarian && (
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-800">
                              {t.veggie}
                            </span>
                          )}
                          {hasAllergens && (
                            <span className="ml-0.5 text-[11px] font-semibold text-slate-500">{t.allergens}</span>
                          )}
                          {dish.allergens.map((alg) => (
                            <span
                              key={alg}
                              className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700"
                            >
                              {alg}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        ) : (
          /* MODO RESTAURANTERO (CARGAR PDF O FOTO) */
          <section className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <UploadIcon className="h-6 w-6" />
              </div>
              <h2 className="text-balance font-display text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                {t.adminTitle}
              </h2>
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-500">{t.adminSubtitle}</p>
            </div>

            {/* Zona de Subida de Archivo (PDF o Imagen) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[200px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 p-5 text-center transition hover:border-teal-500 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:min-h-[220px] sm:p-6"
            >
              {selectedFile ? (
                <span className="block space-y-3">
                  {selectedFile.isPdf ? (
                    <span className="mx-auto flex max-w-sm flex-col items-center rounded-xl border border-teal-200 bg-white p-4 shadow-sm">
                      <span className="mb-2 text-5xl">📑</span>
                      <span className="break-all text-center text-sm font-bold text-slate-800">
                        {selectedFile.name}
                      </span>
                      <span className="mt-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                        Documento PDF ({selectedFile.sizeKB} KB)
                      </span>
                    </span>
                  ) : (
                    <img
                      src={selectedFile.base64}
                      alt="Previsualización del menú"
                      className="mx-auto max-h-56 rounded-lg border object-contain shadow-sm"
                    />
                  )}
                  <span className="block text-xs font-medium text-teal-700">Clic para cambiar archivo</span>
                </span>
              ) : (
                <span className="block space-y-2 text-slate-600">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-2xl text-teal-700">
                    📁
                  </span>
                  <span className="block text-sm font-bold text-slate-800">{t.uploadPrompt}</span>
                  <span className="block text-xs text-slate-500">{t.uploadFormats}</span>
                </span>
              )}
            </button>

            {/* Botón de Procesamiento con IA */}
            <div className="space-y-3">
              <button
                onClick={handleParseMenu}
                disabled={!selectedFile || isParsing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3.5 text-base font-bold text-white shadow-md transition hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 sm:text-sm"
              >
                {isParsing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    <span>{t.processing}</span>
                  </>
                ) : (
                  <span>{t.processButton}</span>
                )}
              </button>

              {parseStatus && (
                <div
                  className={`rounded-xl border px-3 py-2.5 text-center text-sm font-semibold ${
                    parseError
                      ? "border-rose-200 bg-rose-50 text-rose-800"
                      : "border-teal-200 bg-teal-50 text-teal-800"
                  }`}
                >
                  {parseStatus}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Asistente SaborAI Concierge: burbuja flotante + panel */}
      {activeTab === "turista" && (
        <>
          <section
            role="dialog"
            aria-label={t.conciergeTitle}
            className={`fixed inset-0 z-50 flex flex-col overflow-hidden bg-white transition-[opacity,transform,visibility] duration-300 ease-out motion-reduce:transition-none sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[400px] sm:origin-bottom-right sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-2xl sm:shadow-slate-900/20 ${
              isChatOpen
                ? "visible translate-y-0 opacity-100 sm:scale-100"
                : "pointer-events-none invisible translate-y-full opacity-0 sm:translate-y-4 sm:scale-95"
            }`}
          >
            <header className="flex items-center gap-3 bg-teal-900 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg">
                🤖
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold leading-tight">{t.conciergeTitle}</h3>
                <p className="truncate text-xs text-teal-100/80">{t.conciergeSubtitle}</p>
              </div>
              <span className="hidden rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-teal-100 sm:inline">
                Gemini Flash
              </span>
              <button
                type="button"
                onClick={closeChat}
                aria-label={t.closeChat}
                className="-mr-1.5 flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </header>

            {/* Mensajes del Chat */}
            <div
              ref={chatScrollRef}
              className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50 px-4 py-4 text-sm leading-relaxed"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      m.sender === "user"
                        ? "rounded-br-md bg-teal-700 text-white"
                        : "rounded-bl-md border border-slate-200/80 bg-white text-slate-800 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.dishIds && m.dishIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => showDishesInMenu(m.dishIds!)}
                        className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-200"
                      >
                        ⭐ {t.seeInMenu} ({m.dishIds.length})
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs text-slate-500 shadow-sm">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:0.4s]"></span>
                    <span className="ml-1">{t.thinking}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Preguntas rápidas + caja de entrada con micrófono */}
            <div className="border-t border-slate-200 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5">
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5">
                {t.chips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip.prompt)}
                    disabled={isChatLoading}
                    className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-800 disabled:opacity-50"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="mx-4 flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 transition focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/20"
              >
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  aria-label={t.voiceInput}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                    isRecording
                      ? "animate-pulse bg-rose-500 text-white"
                      : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  }`}
                >
                  <MicIcon className="h-5 w-5" />
                </button>
                <input
                  ref={chatInputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  enterKeyHint="send"
                  className="min-w-0 flex-1 text-ellipsis bg-transparent px-1 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm"
                />
                <button
                  type="submit"
                  aria-label={t.send}
                  disabled={isChatLoading || !inputMessage.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white transition hover:bg-teal-800 disabled:bg-slate-300"
                >
                  <SendIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </section>

          {/* Burbuja: en móvil se oculta con el chat abierto (el panel trae su botón de cerrar) */}
          <button
            ref={chatBubbleRef}
            type="button"
            onClick={() => (isChatOpen ? closeChat() : setIsChatOpen(true))}
            aria-label={isChatOpen ? t.closeChat : t.openChat}
            aria-expanded={isChatOpen}
            className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg shadow-teal-900/30 transition hover:bg-teal-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/40 active:scale-95 sm:right-6 ${
              isChatOpen ? "max-sm:hidden" : ""
            }`}
          >
            {isChatOpen ? <CloseIcon className="h-6 w-6" /> : <ChatIcon className="h-6 w-6" />}
            {!isChatOpen && unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-amber-950 ring-2 ring-slate-50">
                {unreadCount}
              </span>
            )}
          </button>
        </>
      )}
    </div>
  );
}
