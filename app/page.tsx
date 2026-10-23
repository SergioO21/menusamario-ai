"use client";

import React, { useState, useRef, useEffect } from "react";

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
      description: "Bebida granizada con crema de coco artesanal y limón mandarino.",
      priceCOP: 12000,
      allergens: [],
      isVegetarian: true,
      localHighlight: "Bebida refrescante por excelencia para el calor caribeño."
    }
  ]
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"turista" | "admin">("turista");
  const [menu, setMenu] = useState<MenuData>(DEFAULT_MENU);
  const [highlightedDishIds, setHighlightedDishIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState<"COP" | "USD" | "EUR">("COP");

  // Chat state
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "¡Hola! Welcome to Santa Marta 🌴 I am your SaborAI concierge. Ask me anything in any language: recommendations, ingredients, budget, or allergies!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Admin upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Conversión de moneda (1 USD = 4,000 COP, 1 EUR = 4,300 COP)
  const formatPrice = (cop: number) => {
    if (currency === "USD") {
      return `$${(cop / 4000).toFixed(1)} USD`;
    }
    if (currency === "EUR") {
      return `€${(cop / 4300).toFixed(1)} EUR`;
    }
    return `$${cop.toLocaleString("es-CO")} COP`;
  };

  // Enviar mensaje de chat a Gemini
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
        body: JSON.stringify({ message: text, menu })
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
          text: "¡Te recomiendo probar el Cayeye o el Pescado frito fresco de la bahía!"
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Reconocimiento de voz nativo por micrófono
  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("El reconocimiento de voz no es compatible con este navegador. Usa Chrome en Android/PC o Safari en iOS.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-CO"; // Se adapta dinámicamente
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

  // Manejo de carga de imagen para el restaurantero
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Procesar imagen con Gemini Vision
  const handleParseMenu = async () => {
    if (!selectedImage) return;

    setIsParsing(true);
    setParseStatus("Gemini 1.5 Flash analizando imagen del menú...");

    try {
      const res = await fetch("/api/parse-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: "image/jpeg"
        })
      });

      const data = await res.json();
      if (data && data.dishes) {
        setMenu(data);
        setParseStatus("¡Menú digitalizado con éxito!");
        setTimeout(() => setActiveTab("turista"), 1200);
      }
    } catch (err) {
      setParseStatus("Error al procesar la imagen. Usando menú de respaldo.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Navbar Superior */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
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
              <p className="text-xs text-slate-500">DevFest Santa Marta 2026 • GDG & SamaTech</p>
            </div>
          </div>

          {/* Moneda & Selector de modo */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-medium text-slate-600">
              <button
                onClick={() => setCurrency("COP")}
                className={`px-2 py-1 rounded ${currency === "COP" ? "bg-white text-slate-900 shadow-xs font-bold" : ""}`}
              >
                COP
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-2 py-1 rounded ${currency === "USD" ? "bg-white text-slate-900 shadow-xs font-bold" : ""}`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency("EUR")}
                className={`px-2 py-1 rounded ${currency === "EUR" ? "bg-white text-slate-900 shadow-xs font-bold" : ""}`}
              >
                EUR
              </button>
            </div>

            <div className="flex bg-teal-50 border border-teal-200 rounded-lg p-1 text-xs font-medium">
              <button
                onClick={() => setActiveTab("turista")}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeTab === "turista"
                    ? "bg-teal-600 text-white font-semibold shadow-sm"
                    : "text-teal-800 hover:text-teal-950"
                }`}
              >
                🍽️ Turista (Comensal)
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeTab === "admin"
                    ? "bg-teal-600 text-white font-semibold shadow-sm"
                    : "text-teal-800 hover:text-teal-950"
                }`}
              >
                📸 Restaurantero (Subir Carta)
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
                    Carta en Vivo
                  </span>
                  <h2 className="text-2xl font-black mt-1">{menu.restaurantName}</h2>
                  <p className="text-teal-100 text-xs mt-1">
                    Bahía de Taganga, Santa Marta • Especialidad en Pesca del Día y Cayeye Criollo
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 pointer-events-none">
                  🐟
                </div>
              </div>

              {/* Lista de Platos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                    Platos & Especialidades ({menu.dishes.length})
                  </h3>
                  {highlightedDishIds.length > 0 && (
                    <button
                      onClick={() => setHighlightedDishIds([])}
                      className="text-xs text-amber-600 font-semibold hover:underline"
                    >
                      Limpiar resaltado
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
                                Veggie 🌱
                              </span>
                            )}
                            {isHighlighted && (
                              <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                                ⭐ Recomendado por SaborAI
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
                            Alérgenos:
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
                    <h3 className="font-bold text-sm">SaborAI Concierge</h3>
                    <p className="text-[11px] text-teal-100">Habla en cualquier idioma</p>
                  </div>
                </div>
                <span className="text-[11px] bg-teal-800 text-teal-200 px-2 py-0.5 rounded-full font-medium">
                  Gemini 1.5 Flash
                </span>
              </div>

              {/* Chips Rápidos de Prueba (Demo Pitch) */}
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar text-xs">
                <button
                  onClick={() =>
                    handleSendMessage("I am allergic to shellfish, my budget is $35,000 COP, what do you recommend?")
                  }
                  className="bg-white border border-slate-200 hover:border-teal-500 text-slate-700 px-2.5 py-1 rounded-full shrink-0 transition text-[11px]"
                >
                  🦀 No mariscos (&lt;$35k COP)
                </button>
                <button
                  onClick={() => handleSendMessage("¿Qué es el Cayeye y qué ingredientes lleva?")}
                  className="bg-white border border-slate-200 hover:border-teal-500 text-slate-700 px-2.5 py-1 rounded-full shrink-0 transition text-[11px]"
                >
                  🍌 ¿Qué es el Cayeye?
                </button>
                <button
                  onClick={() => handleSendMessage("Je suis végétarien, avez-vous des options pour moi?")}
                  className="bg-white border border-slate-200 hover:border-teal-500 text-slate-700 px-2.5 py-1 rounded-full shrink-0 transition text-[11px]"
                >
                  🌱 Végétarien (FR)
                </button>
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
                      <span className="ml-1 text-[11px]">SaborAI pensando...</span>
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
                    placeholder="Pregunta en cualquier idioma (ej: alergias, presupuesto)..."
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !inputMessage.trim()}
                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* MODO RESTAURANTERO (ADMIN UPLOAD) */
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-3xl">📸</span>
              <h2 className="text-xl font-black text-slate-900">
                Digitaliza la carta de tu restaurante en segundos
              </h2>
              <p className="text-xs text-slate-500">
                Toma una foto de tu menú en papel o pizarra de tiza. Gemini 1.5 Flash extraerá los platos, precios y alérgenos de forma automática.
              </p>
            </div>

            {/* Zona de Subida de Imagen */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {selectedImage ? (
                <div className="space-y-2">
                  <img
                    src={selectedImage}
                    alt="Previsualización del menú"
                    className="max-h-56 rounded-lg shadow-sm mx-auto object-contain border"
                  />
                  <p className="text-xs text-teal-700 font-medium">
                    Clic para cambiar imagen
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-slate-600">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xl mx-auto">
                    📷
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Haz clic para tomar foto o subir archivo
                  </p>
                  <p className="text-xs text-slate-500">
                    Formatos JPG, PNG • Pizarras, volantes o cartas físicas
                  </p>
                </div>
              )}
            </div>

            {/* Botón de Procesamiento con IA */}
            <div className="space-y-3">
              <button
                onClick={handleParseMenu}
                disabled={!selectedImage || isParsing}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2"
              >
                {isParsing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Procesando con Gemini 1.5 Flash...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Digitalizar con Inteligencia Artificial</span>
                  </>
                )}
              </button>

              {parseStatus && (
                <div className="text-center text-xs font-semibold text-teal-800 bg-teal-50 py-2 rounded-lg border border-teal-200">
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
