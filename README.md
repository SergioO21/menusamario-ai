# 🌴 MenúSamario AI — DevFest Santa Marta 2026
> **Build with AI Hackathon** — GDG Santa Marta & SamaTech  
> Digitalización y Concierge Gastronómico Multimodal para el Caribe Colombiano usando **Google Gemini 1.5 Flash**.

---

## 📌 El Problema
En destinos turísticos como Santa Marta (Centro Histórico, Taganga, Minca, Rodadero), miles de viajeros internacionales enfrentan barreras lingüísticas y culturales al ordenar comida típica (*cayeye*, pescados locales, cazuelas). Además, personas con alergias severas (mariscos, frutos secos, lácteos) o presupuestos específicos corren riesgos o terminan recurriendo a cadenas de comida rápida. Los restaurantes locales, por su parte, dependen de cartas en papel deterioradas o PDFs estáticos difíciles de actualizar.

---

## 💡 La Solución
**MenúSamario AI** conecta a restauranteros locales y comensales a través de Inteligencia Artificial de Google:

1. **Digitalización Instantánea (Restaurantero):** Basta con tomar una fotografía a la carta en papel o pizarra de tiza. **Gemini 1.5 Flash (Vision)** con *Structured Outputs* extrae automáticamente los platos, precios en COP, traduce alérgenos y añade notas sobre el contexto cultural samario.
2. **SaborAI Concierge (Turista):** El comensal escanea un QR y conversa por voz o texto en cualquier idioma (inglés, francés, alemán, español). La IA recomienda platos personalizados filtrando estrictamente por alergias y presupuesto en COP/USD/EUR, e ilumina las opciones recomendadas en la carta digital.

---

## 🛠️ Stack Tecnológico Google
* **Google Gemini 1.5 Flash (`@google/genai`):**
  * *Vision Multimodal:* Extracción estructurada (JSON Schema) desde fotos de cartas.
  * *Conversational AI:* Razonamiento semántico multilingüe y recomendación gastronómica.
* **Next.js 14 (App Router) + TypeScript + Tailwind CSS:** Frontend y API Routes unificadas.
* **Web Speech API:** Reconocimiento de voz nativo en el navegador para consultas manos libres.

---

## 🚀 Instalación y Puesta en Marcha

```bash
# 1. Clonar el repositorio
git clone https://github.com/SergioO21/menusamario-ai.git
cd menusamario-ai

# 2. Instalar dependencias
npm install

# 3. Configurar API Key de Gemini
cp .env.local.example .env.local
# Agrega tu GEMINI_API_KEY obtenida gratis en https://aistudio.google.com/apikey

# 4. Iniciar en desarrollo
npm run dev
```

Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

---

## 👥 Equipo
Proyecto desarrollado en el sprint de 2 horas para el **DevFest Santa Marta 2026 / Build with AI**.
