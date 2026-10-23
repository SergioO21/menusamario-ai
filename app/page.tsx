"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Dropdown from "../components/Dropdown";
import {
  ChatIcon,
  CloseIcon,
  FileIcon,
  LeafIcon,
  MicIcon,
  SendIcon,
  UploadIcon,
  UtensilsIcon
} from "../components/icons";
import {
  HANDWRITTEN_LANGUAGES,
  I18N,
  LANGUAGE_CODES,
  buildDictionary,
  currencyName,
  flattenDictionary,
  fmt,
  isLanguageCode,
  isRtl,
  languageName,
  type Dictionary,
  type LanguageCode
} from "../lib/i18n";
import {
  DEFAULT_MENU,
  FALLBACK_RATES,
  MAX_UPLOAD_MB,
  PINNED_CURRENCIES,
  currencyDigits,
  currencySymbol,
  hashString,
  isMenuData,
  type CurrencyCode,
  type MenuData
} from "../lib/menu";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  dishIds?: string[];
  // El saludo se pinta con el diccionario activo, así sigue al idioma elegido
  welcome?: boolean;
}

// Claves de localStorage: preferencias, la última carta digitalizada y las traducciones
const STORAGE = {
  lang: "menusamario:lang",
  currency: "menusamario:currency",
  menu: "menusamario:menu",
  ui: (lang: LanguageCode) => `menusamario:ui:${UI_VERSION}:${lang}`,
  menuTranslation: (lang: LanguageCode, menu: MenuData) =>
    `menusamario:menu-tr:${lang}:${hashString(JSON.stringify(menu))}`,
};

// Cambia cuando cambian los textos base: invalida las traducciones guardadas
const UI_VERSION = hashString(JSON.stringify(flattenDictionary(I18N.en)));

const isHandwritten = (lang: LanguageCode) =>
  (HANDWRITTEN_LANGUAGES as readonly string[]).includes(lang);

// Locale para precios y dictado: el español de la app es el de Colombia
const localeFor = (lang: LanguageCode) => (lang === "es" ? "es-CO" : lang);

const requestTranslations = async (lang: LanguageCode, entries: Record<string, string>) => {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetLanguage: lang, entries })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.translations ?? {}) as Record<string, string>;
};

const readStorage = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string | null) => {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Modo privado o almacenamiento bloqueado: la app sigue funcionando sin persistir
  }
};

// Separa "Restaurante X - Bahía de Taganga" en nombre y lugar
const splitRestaurantName = (name: string) => {
  const [title, ...rest] = name.split(/\s+[-–—]\s+/);
  return { title, place: rest.join(" · ") };
};

export default function Home() {
  const [lang, setLang] = useState<LanguageCode>("es");
  const [activeTab, setActiveTab] = useState<"turista" | "admin">("turista");
  const [menu, setMenu] = useState<MenuData>(DEFAULT_MENU);
  const [isCustomMenu, setIsCustomMenu] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [highlightedDishIds, setHighlightedDishIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>("COP");
  const [avoidedAllergens, setAvoidedAllergens] = useState<string[]>([]);
  const [vegOnly, setVegOnly] = useState(false);
  // Unidades de cada moneda por 1 COP
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [ratesLive, setRatesLive] = useState(false);
  // Interfaz traducida por Gemini (idiomas sin textos escritos a mano)
  const [translatedUI, setTranslatedUI] = useState<Record<LanguageCode, Dictionary>>({});
  // Descripciones, notas y alérgenos de la carta en el idioma activo
  const [menuTranslation, setMenuTranslation] = useState<Record<string, string>>({});
  const [pendingTranslations, setPendingTranslations] = useState(0);

  const t = I18N[lang] ?? translatedUI[lang] ?? I18N.en;
  const tr = (key: string, original: string) => menuTranslation[key] ?? original;

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "ai", text: "", welcome: true }
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
  const [isDragging, setIsDragging] = useState(false);
  const [parseStatus, setParseStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recuperar preferencias y la carta digitalizada de la visita anterior
  useEffect(() => {
    const savedLang = readStorage(STORAGE.lang);
    if (isLanguageCode(savedLang)) setLang(savedLang);
    const savedCurrency = readStorage(STORAGE.currency);
    if (savedCurrency && /^[A-Z]{3}$/.test(savedCurrency)) setCurrency(savedCurrency);
    try {
      const savedMenu = JSON.parse(readStorage(STORAGE.menu) ?? "null");
      if (isMenuData(savedMenu)) {
        setMenu(savedMenu);
        setIsCustomMenu(true);
      }
    } catch {
      writeStorage(STORAGE.menu, null);
    }
  }, []);

  // Tasas de cambio en vivo para todas las monedas
  useEffect(() => {
    fetch("/api/rates")
      .then((res) => res.json())
      .then((data) => {
        if (data?.rates && typeof data.rates === "object") {
          setRates({ ...FALLBACK_RATES, ...data.rates });
          setRatesLive(Boolean(data.live));
        }
      })
      .catch(() => {
        // Se mantienen las tasas de referencia
      });
  }, []);

  // Idioma en que realmente está la interfaz (inglés mientras no llegue la traducción)
  const uiLang = I18N[lang] || translatedUI[lang] ? lang : "en";
  useEffect(() => {
    document.documentElement.lang = uiLang;
    document.documentElement.dir = isRtl(uiLang) ? "rtl" : "ltr";
  }, [uiLang]);

  // Idiomas sin textos propios: traducir la interfaz una vez y guardarla
  useEffect(() => {
    if (isHandwritten(lang) || translatedUI[lang]) return;
    try {
      const cached = JSON.parse(readStorage(STORAGE.ui(lang)) ?? "null");
      if (cached && typeof cached === "object") {
        setTranslatedUI((prev) => ({ ...prev, [lang]: buildDictionary(I18N.en, cached) }));
        return;
      }
    } catch {
      writeStorage(STORAGE.ui(lang), null);
    }

    let cancelled = false;
    setPendingTranslations((n) => n + 1);
    requestTranslations(lang, flattenDictionary(I18N.en))
      .then((translations) => {
        writeStorage(STORAGE.ui(lang), JSON.stringify(translations));
        if (!cancelled) setTranslatedUI((prev) => ({ ...prev, [lang]: buildDictionary(I18N.en, translations) }));
      })
      .catch(() => {
        // Sin traducción disponible: la interfaz queda en inglés
      })
      .finally(() => setPendingTranslations((n) => n - 1));
    return () => {
      cancelled = true;
    };
  }, [lang, translatedUI]);

  // La carta está escrita en español: traducir descripciones, notas y alérgenos
  useEffect(() => {
    setMenuTranslation({});
    if (lang === "es") return;

    const entries: Record<string, string> = {};
    menu.dishes.forEach((dish) => {
      if (dish.description) entries[`d.${dish.id}.description`] = dish.description;
      if (dish.localHighlight) entries[`d.${dish.id}.highlight`] = dish.localHighlight;
      dish.allergens.forEach((allergen) => {
        entries[`a.${allergen.toLowerCase()}`] = allergen.toLowerCase();
      });
    });

    const cacheKey = STORAGE.menuTranslation(lang, menu);
    try {
      const cached = JSON.parse(readStorage(cacheKey) ?? "null");
      if (cached && typeof cached === "object") {
        setMenuTranslation(cached);
        return;
      }
    } catch {
      writeStorage(cacheKey, null);
    }

    let cancelled = false;
    setPendingTranslations((n) => n + 1);
    requestTranslations(lang, entries)
      .then((translations) => {
        writeStorage(cacheKey, JSON.stringify(translations));
        if (!cancelled) setMenuTranslation(translations);
      })
      .catch(() => {
        // Sin traducción disponible: se muestra el texto original
      })
      .finally(() => setPendingTranslations((n) => n - 1));
    return () => {
      cancelled = true;
    };
  }, [lang, menu]);

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

  // Alérgenos presentes en la carta actual, para los filtros
  const menuAllergens = useMemo(
    () =>
      Array.from(new Set(menu.dishes.flatMap((dish) => dish.allergens.map((a) => a.toLowerCase())))).sort(
        (a, b) => a.localeCompare(b, "es")
      ),
    [menu]
  );

  const visibleDishes = menu.dishes.filter(
    (dish) =>
      (!vegOnly || dish.isVegetarian) &&
      !dish.allergens.some((a) => avoidedAllergens.includes(a.toLowerCase()))
  );
  const hasFilters = vegOnly || avoidedAllergens.length > 0;

  const priceFormatter = useMemo(() => {
    const digits = currencyDigits(currency);
    const options: Intl.NumberFormatOptions = {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    };
    try {
      return new Intl.NumberFormat(localeFor(lang), options);
    } catch {
      return new Intl.NumberFormat("en", options);
    }
  }, [lang, currency]);
  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;
  const formatPrice = (cop: number) => priceFormatter.format(cop * rate);

  // Todas las monedas con tasa disponible; COP, USD y EUR primero
  const currencyCodes = useMemo(
    () => [
      ...PINNED_CURRENCIES,
      ...Object.keys(rates)
        .filter((code) => !PINNED_CURRENCIES.includes(code) && /^[A-Z]{3}$/.test(code))
        .sort()
    ],
    [rates]
  );

  const closeChat = () => {
    setIsChatOpen(false);
    chatBubbleRef.current?.focus({ preventScroll: true });
  };

  const switchTab = (tab: "turista" | "admin") => {
    setActiveTab(tab);
    setIsChatOpen(false);
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLang(newLang);
    writeStorage(STORAGE.lang, newLang);
    // Si la conversación ya empezó, saludar de nuevo en el idioma elegido
    setMessages((prev) => (prev.length === 1 ? prev : [...prev, { sender: "ai", text: "", welcome: true }]));
  };

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    writeStorage(STORAGE.currency, newCurrency);
  };

  const toggleAllergen = (allergen: string) => {
    setAvoidedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const clearFilters = () => {
    setAvoidedAllergens([]);
    setVegOnly(false);
  };

  const restoreDemoMenu = () => {
    setMenu(DEFAULT_MENU);
    setIsCustomMenu(false);
    setHighlightedDishIds([]);
    clearFilters();
    writeStorage(STORAGE.menu, null);
  };

  // Resalta los platos recomendados y los lleva a la vista
  const showDishesInMenu = (dishIds: string[]) => {
    setHighlightedDishIds(dishIds);
    // Un plato recomendado podría estar oculto por los filtros
    clearFilters();
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

    // El historial reciente da contexto a preguntas de seguimiento ("¿y sin lácteos?")
    const history = messages
      .filter((m) => !m.welcome)
      .slice(-8)
      .map((m) => ({ role: m.sender, text: m.text }));
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputMessage("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, menu, language: lang, currency, unitsPerCOP: rate })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const dishIds: string[] = (data.recommendedDishIds || []).filter((id: string) =>
        menu.dishes.some((dish) => dish.id === id)
      );
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply || t.chatFallback, dishIds }]);
      if (dishIds.length > 0) {
        setHighlightedDishIds(dishIds);
      }
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", text: t.chatFallback }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((prev) => [...prev, { sender: "ai", text: t.voiceUnsupported }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = localeFor(lang);
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

  // Validación y lectura de archivos (imágenes y PDFs), desde el selector o arrastrando
  const loadFile = (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type.startsWith("image/");
    setParseStatus("");
    setParseError(null);

    if (!isPdf && !isImage) {
      setParseError(t.unsupportedFile);
      setParseStatus(t.unsupportedFile);
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setParseError(fmt(t.fileTooLarge, { mb: MAX_UPLOAD_MB }));
      setParseStatus(fmt(t.fileTooLarge, { mb: MAX_UPLOAD_MB }));
      return;
    }

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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    // Permite volver a elegir el mismo archivo
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
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
      if (res.ok && isMenuData(data) && data.dishes.length > 0) {
        setMenu(data);
        setIsCustomMenu(true);
        setHighlightedDishIds([]);
        clearFilters();
        writeStorage(STORAGE.menu, JSON.stringify(data));
        setParseStatus(fmt(t.successParsed, { n: data.dishes.length, name: data.restaurantName }));
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: fmt(t.chatMenuLoaded, { n: data.dishes.length, name: data.restaurantName }) }
        ]);
        setTimeout(() => setActiveTab("turista"), 1400);
      } else {
        const errText = data?.error || t.parseFailed;
        setParseError(errText);
        setParseStatus(errText);
      }
    } catch {
      setParseError(t.networkError);
      setParseStatus(t.networkError);
    } finally {
      setIsParsing(false);
    }
  };

  // Selector de modo: en móvil y tablet va bajo el header, en escritorio dentro de él
  const renderModeSwitch = (className: string) => (
    <nav className={`flex gap-6 text-sm font-medium ${className}`}>
      {(["turista", "admin"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          aria-pressed={activeTab === tab}
          onClick={() => switchTab(tab)}
          className={`-mb-px flex items-center gap-2 border-b-2 py-3 transition focus:outline-none focus-visible:text-ink ${
            activeTab === tab
              ? "border-achiote text-ink"
              : "border-transparent text-ink-mute hover:text-ink"
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
    </nav>
  );

  // Idiomas: nombre propio ("日本語") y, debajo, en el idioma activo ("Japonés")
  const languageOptions = LANGUAGE_CODES.map((code) => {
    const ownName = languageName(code);
    const localName = languageName(code, lang);
    return {
      value: code,
      label: ownName,
      hint: localName !== ownName ? localName : undefined,
      keywords: `${languageName(code, "es")} ${languageName(code, "en")}`
    };
  });
  const { title: restaurantTitle, place: restaurantPlace } = splitRestaurantName(menu.restaurantName);

  return (
    <div className="paper-grain min-h-screen bg-paper text-ink">
      {/* Navbar Superior */}
      <header className="sticky top-0 z-30 border-b border-ink-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          {/* Logotipo */}
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="font-display text-[1.45rem] leading-none tracking-tight">
              <span className="font-normal italic text-achiote">Menú</span>
              <span className="font-semibold">Samario</span>
            </h1>
            <p className="hidden truncate border-l border-ink-line pl-3 text-xs text-ink-mute md:block">
              {t.tagline}
            </p>
          </div>

          {renderModeSwitch("hidden lg:flex self-stretch items-end")}

          {/* Selectores: Idioma y Moneda */}
          <div className="flex shrink-0 items-center gap-1.5">
            <Dropdown<LanguageCode>
              label={t.language}
              value={lang}
              onChange={handleLanguageChange}
              options={languageOptions}
              searchPlaceholder={t.search}
              emptyLabel={t.noMatches}
            >
              {pendingTranslations > 0 && (
                <span
                  role="status"
                  aria-label={t.translating}
                  className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-achiote border-t-transparent"
                />
              )}
              <span className="text-xs font-semibold uppercase">{lang}</span>
            </Dropdown>

            <Dropdown<CurrencyCode>
              label={t.currency}
              value={currency}
              onChange={handleCurrencyChange}
              searchPlaceholder={t.search}
              emptyLabel={t.noMatches}
              options={currencyCodes.map((code) => ({
                value: code,
                label: code,
                hint: currencyName(code, lang),
                icon: (
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-ink-line px-1 text-[11px] font-semibold text-ink-soft">
                    {currencySymbol(code, localeFor(lang))}
                  </span>
                )
              }))}
            >
              <span className="text-xs font-semibold">{currency}</span>
            </Dropdown>
          </div>
        </div>
        {renderModeSwitch("mx-auto max-w-5xl px-4 lg:hidden")}
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto max-w-5xl px-4 pb-36">
        {activeTab === "turista" ? (
          <div key="turista" className="animate-fade-up motion-reduce:animate-none">
            {/* Cabecera de la carta */}
            <section className="border-b-2 border-ink pb-6 pt-8 sm:pb-8 sm:pt-14">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-achiote">
                {isCustomMenu ? t.touristTab : t.location}
              </p>
              <h2 className="mt-3 text-balance font-display text-[2.6rem] font-medium leading-[1.02] tracking-tight [font-variation-settings:'opsz'_144,'SOFT'_50] sm:text-6xl">
                {restaurantTitle}
                {restaurantPlace && (
                  <span className="mt-1 block font-normal italic text-ink-soft">{restaurantPlace}</span>
                )}
              </h2>
              {!isCustomMenu && (
                <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">{t.subtitle}</p>
              )}
              <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium uppercase tracking-[0.14em] text-ink-mute">
                <span>{fmt(menu.dishes.length === 1 ? t.dishCountOne : t.dishCountOther, { n: menu.dishes.length })}</span>
                <span aria-hidden="true">·</span>
                <span>{fmt(t.pricesIn, { currency: currencyName(currency, lang) })}</span>
                {currency !== "COP" && ratesLive && (
                  <a
                    href="https://www.exchangerate-api.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="normal-case tracking-normal underline decoration-ink-line underline-offset-4 hover:text-ink"
                  >
                    {t.ratesSource}
                  </a>
                )}
              </p>
            </section>

            {isCustomMenu && (
              <div className="mt-6 flex flex-col gap-2 border-l-2 border-olive bg-olive-soft/60 px-4 py-3 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
                <p>{fmt(t.customMenuActive, { n: menu.dishes.length, name: menu.restaurantName })}</p>
                <button
                  type="button"
                  onClick={restoreDemoMenu}
                  className="shrink-0 self-start font-semibold text-ink underline decoration-ink-line underline-offset-4 hover:decoration-ink sm:self-auto"
                >
                  {t.restoreDemo}
                </button>
              </div>
            )}

            {/* Filtros por alérgeno y dieta */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {menuAllergens.length > 0 && (
                <>
                  <span className="me-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                    {t.avoid}
                  </span>
                  {menuAllergens.map((allergen) => {
                    const active = avoidedAllergens.includes(allergen);
                    return (
                      <button
                        key={allergen}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleAllergen(allergen)}
                        className={`rounded-full border px-3 py-1.5 text-[13px] capitalize transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                          active
                            ? "border-ink bg-ink text-paper line-through decoration-paper/60"
                            : "border-ink-line text-ink-soft hover:border-ink-mute hover:text-ink"
                        }`}
                      >
                        {tr(`a.${allergen}`, allergen)}
                      </button>
                    );
                  })}
                  <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-ink-line sm:block" />
                </>
              )}
              <button
                type="button"
                aria-pressed={vegOnly}
                onClick={() => setVegOnly((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                  vegOnly
                    ? "border-olive bg-olive text-paper"
                    : "border-ink-line text-ink-soft hover:border-ink-mute hover:text-ink"
                }`}
              >
                <LeafIcon className="h-3.5 w-3.5" />
                {t.vegOnly}
              </button>
              {(hasFilters || highlightedDishIds.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    clearFilters();
                    setHighlightedDishIds([]);
                  }}
                  className="ms-auto text-[13px] font-medium text-achiote underline-offset-4 hover:underline"
                >
                  {hasFilters ? t.clearFilters : t.clearHighlight}
                </button>
              )}
            </div>

            {/* Lista de Platos */}
            <section aria-label={t.specialties} className="mt-4">
              {visibleDishes.length === 0 ? (
                <p className="border-y border-ink-line py-10 text-center font-display text-lg italic text-ink-mute">
                  {t.noResults}
                </p>
              ) : (
                <ul className="grid md:grid-cols-2 md:gap-x-12">
                  {visibleDishes.map((dish) => {
                    const isHighlighted = highlightedDishIds.includes(dish.id);
                    return (
                      <li key={dish.id} className="border-b border-ink-line">
                        <article
                          id={`dish-${dish.id}`}
                          className={`-mx-3 my-2 scroll-mt-32 rounded-sm px-3 py-4 transition-colors duration-500 ${
                            isHighlighted ? "bg-achiote-soft/60 shadow-[inset_3px_0_0_#B4432A]" : ""
                          }`}
                        >
                          {isHighlighted && (
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-achiote">
                              {t.aiRecommended}
                            </p>
                          )}

                          <div className="flex items-baseline gap-2">
                            <h3 className="font-display text-[1.25rem] font-medium leading-snug">{dish.name}</h3>
                            <span aria-hidden="true" className="leader h-4 min-w-6 flex-1" />
                            <p className="shrink-0 font-display text-[1.15rem] tabular-nums">
                              {formatPrice(dish.priceCOP)}
                            </p>
                          </div>

                          {dish.description && (
                            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">
                              {tr(`d.${dish.id}.description`, dish.description)}
                            </p>
                          )}

                          {dish.localHighlight && (
                            <p className="mt-2 font-display text-[0.95rem] italic leading-snug text-ink-mute">
                              {tr(`d.${dish.id}.highlight`, dish.localHighlight)}
                            </p>
                          )}

                          {/* Vegetariano y alérgenos */}
                          {(dish.isVegetarian || dish.allergens.length > 0) && (
                            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                              {dish.isVegetarian && (
                                <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.12em] text-olive">
                                  <LeafIcon className="h-3.5 w-3.5" />
                                  {t.vegetarian}
                                </span>
                              )}
                              {dish.allergens.length > 0 && (
                                <span className="text-ink-mute">
                                  {t.contains}:{" "}
                                  <span className="font-medium text-ink-soft">{dish.allergens.map((a) => tr(`a.${a.toLowerCase()}`, a)).join(", ")}</span>
                                </span>
                              )}
                            </p>
                          )}
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        ) : (
          /* MODO RESTAURANTERO (CARGAR PDF O FOTO) */
          <section
            key="admin"
            className="grid animate-fade-up gap-10 pt-8 motion-reduce:animate-none sm:pt-14 lg:grid-cols-[1fr_1.1fr] lg:gap-14"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-achiote">{t.adminEyebrow}</p>
              <h2 className="mt-3 text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
                {t.adminTitle}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">{t.adminSubtitle}</p>

              <ol className="mt-8 border-t-2 border-ink">
                {t.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-4 border-b border-ink-line py-4">
                    <span className="w-8 shrink-0 font-display text-xl italic text-achiote">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block font-semibold">{step.title}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">{step.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-4">
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
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex min-h-[300px] w-full flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                  isDragging
                    ? "border-achiote bg-achiote-soft/50"
                    : "border-ink-mute/60 bg-paper-card hover:border-ink"
                }`}
              >
                {selectedFile ? (
                  <span className="block space-y-4">
                    {selectedFile.isPdf ? (
                      <span className="mx-auto flex max-w-xs flex-col items-center gap-2">
                        <FileIcon className="h-12 w-12 text-ink-soft" />
                        <span className="break-all text-sm font-semibold">{selectedFile.name}</span>
                        <span className="text-xs text-ink-mute">
                          {t.pdfDocument} · {selectedFile.sizeKB} KB
                        </span>
                      </span>
                    ) : (
                      // Vista previa local en data URL: next/image no aporta nada aquí
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedFile.base64}
                        alt={selectedFile.name}
                        className="mx-auto max-h-64 rounded-sm object-contain shadow-md shadow-ink/10"
                      />
                    )}
                    <span className="block text-xs font-medium text-ink-mute underline underline-offset-4">
                      {t.changeFile}
                    </span>
                  </span>
                ) : (
                  <span className="block space-y-3">
                    <UploadIcon className="mx-auto h-8 w-8 text-ink-mute" />
                    <span className="block font-display text-lg">{t.uploadPrompt}</span>
                    <span className="block text-xs text-ink-mute">{fmt(t.uploadFormats, { mb: MAX_UPLOAD_MB })}</span>
                  </span>
                )}
              </button>

              {/* Botón de Procesamiento con IA */}
              <button
                type="button"
                onClick={handleParseMenu}
                disabled={!selectedFile || isParsing}
                className="flex w-full items-center justify-center gap-2.5 rounded-md bg-ink px-4 py-3.5 text-base font-semibold text-paper transition hover:bg-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-achiote focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
              >
                {isParsing && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper border-t-transparent" />
                )}
                <span>{isParsing ? t.processing : t.processButton}</span>
              </button>

              {parseStatus && (
                <p
                  role="status"
                  className={`border-l-2 px-3 py-2 text-sm ${
                    parseError
                      ? "border-achiote bg-achiote-soft/50 text-achiote-dark"
                      : "border-olive bg-olive-soft/60 text-ink-soft"
                  }`}
                >
                  {parseStatus}
                </p>
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
            className={`fixed inset-0 z-50 flex flex-col overflow-hidden bg-paper-card transition-[opacity,transform,visibility] duration-300 ease-out motion-reduce:transition-none sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[400px] sm:origin-bottom-right sm:rounded-lg sm:border sm:border-ink-line sm:shadow-2xl sm:shadow-ink/20 ${
              isChatOpen
                ? "visible translate-y-0 opacity-100 sm:scale-100"
                : "pointer-events-none invisible translate-y-full opacity-0 sm:translate-y-4 sm:scale-95"
            }`}
          >
            <header className="flex items-center gap-3 bg-ink px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-paper">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-achiote font-display text-lg italic">
                S
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg leading-tight">{t.conciergeTitle}</h2>
                <p className="truncate text-xs text-paper/60">{t.conciergeSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={closeChat}
                aria-label={t.closeChat}
                className="-me-1.5 flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-paper/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-paper"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </header>

            {/* Mensajes del Chat */}
            <div
              ref={chatScrollRef}
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-paper px-4 py-4 text-[0.95rem] leading-relaxed"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      m.sender === "user"
                        ? "rounded-br-sm bg-ink text-paper"
                        : "rounded-bl-sm border border-ink-line bg-paper-card text-ink"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.welcome ? t.welcomeMessage : m.text}</p>
                    {m.dishIds && m.dishIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => showDishesInMenu(m.dishIds!)}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-achiote underline decoration-achiote/30 underline-offset-4 transition hover:decoration-achiote"
                      >
                        {t.seeInMenu} ({m.dishIds.length}) →
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-ink-line bg-paper-card px-3.5 py-2.5 text-xs text-ink-mute">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-achiote"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-achiote [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-achiote [animation-delay:0.4s]"></span>
                    <span className="ml-1">{t.thinking}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Preguntas rápidas + caja de entrada con micrófono */}
            <div className="border-t border-ink-line bg-paper-card pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5">
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5">
                {t.chips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip.prompt)}
                    disabled={isChatLoading}
                    className="shrink-0 rounded-full border border-ink-line px-3 py-1.5 text-xs text-ink-soft transition hover:border-ink hover:text-ink disabled:opacity-50"
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
                className="mx-4 flex items-center gap-1 rounded-full border border-ink-line bg-paper p-1 transition focus-within:border-ink"
              >
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  aria-label={t.voiceInput}
                  aria-pressed={isRecording}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                    isRecording
                      ? "animate-pulse bg-achiote text-paper"
                      : "text-ink-mute hover:bg-paper-deep hover:text-ink"
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
                  maxLength={500}
                  className="min-w-0 flex-1 text-ellipsis bg-transparent px-1 text-base text-ink placeholder:text-ink-mute focus:outline-none sm:text-sm"
                />
                <button
                  type="submit"
                  aria-label={t.send}
                  disabled={isChatLoading || !inputMessage.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-achiote text-paper transition hover:bg-achiote-dark disabled:bg-ink-line disabled:text-paper"
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
            className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-50 flex h-14 items-center justify-center gap-2 rounded-full bg-ink text-paper shadow-lg shadow-ink/25 transition hover:bg-ink-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-achiote/40 active:scale-95 sm:right-6 ${
              isChatOpen ? "w-14 max-sm:hidden" : "w-14 sm:w-auto sm:pl-5 sm:pr-6"
            }`}
          >
            {isChatOpen ? <CloseIcon className="h-6 w-6" /> : <ChatIcon className="h-5 w-5" />}
            {!isChatOpen && <span className="hidden text-sm font-semibold sm:inline">{t.openChat}</span>}
            {!isChatOpen && unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-achiote px-1 text-[11px] font-bold text-paper ring-2 ring-paper">
                {unreadCount}
              </span>
            )}
          </button>
        </>
      )}
    </div>
  );
}
