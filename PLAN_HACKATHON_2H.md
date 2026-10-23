# ⚡ MenúSamario AI — Plan Táctico Sprint de 2 Horas
> **Hackathon:** DevFest Santa Marta 2026 (Build with AI - GDG & SamaTech)  
> **Tiempo total:** 120 minutos | **Equipo:** 4 personas

---

## 🎯 Objetivo Innegociable del MVP (Lo que se muestra al jurado)
1. **Flujo 1 (El Restaurantero):** Subir/tomar foto a una carta real de restaurante local escrita en papel o pizarra. Gemini extrae automáticamente los platos, precios en COP y alérgenos en formato estructurado.
2. **Flujo 2 (El Turista):** Escaneo de QR o acceso a la webapp donde el turista pregunta por voz o texto en inglés/español con restricciones dietéticas y presupuesto (ej. *"Allergic to shellfish, budget $35,000 COP"*), y Gemini recomienda el plato local ideal con explicación cultural.

---

## 👥 División de Roles (4 Personas)

```
┌─────────────────────────────────────────────────────────────┐
│                       DIVISIÓN DE ROLES                     │
├──────────────────────────────┬──────────────────────────────┤
│ 👤 Persona 1: Frontend Lead   │ 👤 Persona 2: AI & Backend   │
│ • UI comensal y admin        │ • SDK Gemini 1.5 Flash       │
│ • Chat interactivo y subida  │ • Endpoints de extracción    │
│ • Conexión con endpoints     │ • Contrato JSON con Mock     │
├──────────────────────────────┼──────────────────────────────┤
│ 👤 Persona 3: Data & QA      │ 👤 Persona 4: Pitch Master   │
│ • Carta física real en papel │ • Diapositivas (4 slides)    │
│ • Pruebas en AI Studio       │ • Guión cronometrado (3 min) │
│ • QR y soporte despliegue    │ • Video de respaldo (Backup) │
└──────────────────────────────┴──────────────────────────────┘
```

### 👤 Persona 1: Frontend Lead (UI & Integración)
* **Misión:** Tener la interfaz lista, atractiva y conectada a los endpoints.
* **Stack sugerido:** Vite + React / Next.js + Tailwind CSS (o HTML/JS vanilla rápido con CDN).
* **Entregables específicos:**
  - [ ] Pantalla 1: Selector simple o switch: **"Modo Restaurante"** (botón de subir imagen / cámara) vs **"Modo Comensal"** (chat).
  - [ ] Componente de carga de foto con preview y visualización de la lista de platos extraídos en tarjetas limpias.
  - [ ] Componente de chat conversacional con burbujas de mensaje y botón de micrófono (Web Speech API nativa del navegador).

### 👤 Persona 2: AI & Backend Lead (Google GenAI & Lógica)
* **Misión:** Que la IA procese la imagen y responda las recomendaciones en menos de 3 segundos sin fallar.
* **Stack sugerido:** Node.js (Express / Next API routes) o Python (FastAPI) con `@google/genai` o `google-genai`.
* **Entregables específicos:**
  - [ ] Obtener y configurar la `GEMINI_API_KEY` desde [Google AI Studio](https://aistudio.google.com).
  - [ ] En los primeros 15 minutos: **Crear un JSON mock** con un menú típico samario (Donde Chela) y pasárselo a Persona 1 para que empiece a maquetar sin esperarlo.
  - [ ] Endpoint `/api/parse-menu`: Recibe la imagen en Base64, invoca `gemini-1.5-flash` con esquema estructurado (`responseSchema`) y devuelve JSON limpio.
  - [ ] Endpoint `/api/chat-recommend`: Recibe la consulta del usuario + el menú JSON y devuelve la recomendación amigable.

### 👤 Persona 3: Contenido, QA & Experiencia Local (Data & Operaciones)
* **Misión:** Que los datos se sientan 100% auténticos de Santa Marta y la demo no se rompa.
* **Entregables específicos:**
  - [ ] Redactar a mano en una hoja de papel o libreta un menú real y creíble: *"Restaurante Donde Chela - Bahía de Taganga"* (Pescado sierra frito, Cayeye con queso, Cazuela de mariscos, Salpicón, Arroz de coco, Limonada de coco con precios de $15.000 a $45.000 COP).
  - [ ] Tomar 2 fotos nítidas con buena luz y compartirlas con el equipo.
  - [ ] Probar en [Google AI Studio](https://aistudio.google.com) los prompts y validar que Gemini detecte los alérgenos correctamente (ej. mariscos en la cazuela, lácteos en el queso costeño).
  - [ ] Generar un código QR que apunte a la URL local/túnel para que el jurado pueda escanearlo desde su celular durante el pitch.

### 👤 Persona 4: Pitch Master & Storytelling (Presentación & Respaldo)
* **Misión:** Ganar la hackathon en los 3 minutos de tarima.
* **Entregables específicos:**
  - [ ] Presentación en Google Slides (máximo 4 diapositivas: Problema en Santa Marta -> Solución MenúSamario -> Arquitectura Google AI -> Modelo e Impacto).
  - [ ] Guión del pitch redactado y cronometrado palabra por palabra (180 segundos exactos).
  - [ ] **Misión crítica en el min 90:** Grabar con el celular o pantalla un video de 30 segundos de la demo funcionando. *Si el Wi-Fi del evento falla en vivo, este video salva el primer lugar.*
  - [ ] Coordinar los ensayos con el equipo en los últimos 20 minutos.

---

## ⏱️ Cronograma Minuto a Minuto (120 Minutos)

```
00:00 ─── Configuración inicial & Contrato JSON (15 min)
00:15 ─── Desarrollo paralelo intensivo (45 min)
01:00 ─── Conexión Frontend + Backend con Gemini (30 min)
01:30 ─── Pulido visual, QR & Video Backup (15 min)
01:45 ─── Ensayos generales del Pitch (15 min)
02:00 ─── 🚀 ¡LISTOS PARA PRESENTAR!
```

### Fase 1: Minuto 00 a 15 — Alineación & Setup
- Persona 2 crea la API Key de Gemini y define el JSON mock.
- Persona 1 inicializa el proyecto de frontend con Tailwind/Vite.
- Persona 3 escribe el menú en papel físico y le toma fotos.
- Persona 4 abre la plantilla de Google Slides y define la historia (el caso de una turista en Santa Marta).

### Fase 2: Minuto 15 a 60 — Sprint de Construcción
- **P1:** Maqueta la UI del chat y la vista de cartas usando el JSON mock de P2.
- **P2:** Implementa la llamada a `gemini-1.5-flash` con *Structured Outputs* (visión) y el prompt del sommelier.
- **P3:** Prueba casos extremos en AI Studio: "¿Qué como si soy vegano?", "¿Qué como con $20.000 COP?".
- **P4:** Termina las diapositivas y ensaya el hook inicial de 45 segundos.

### Fase 3: Minuto 60 a 90 — Integración y Prueba de Fuego
- P1 y P2 conectan el frontend con la API real de Gemini.
- Pasan la foto tomada por P3: verifican que extraiga los platos y precios reales.
- Hacen la primera prueba de chat desde la interfaz.
- Si hay errores de parsing, forzar temperatura 0.0 y simplificar el JSON Schema.

### Fase 4: Minuto 90 a 105 — Despliegue, QR y Seguro de Vida
- P1/P2 despliegan en Vercel, Firebase Hosting o abren un túnel ngrok / Cloudflare Tunnel.
- P3 genera el código QR con la URL y lo pega en la última slide de la presentación.
- **P4 graba el video de respaldo (30 segundos)** ejecutando la prueba completa en local.

### Fase 5: Minuto 105 a 120 — Ensayos Cronometrados
- **Ensayo 1 (Min 105):** Presentación completa con reloj en mano. Ajustar partes largas.
- **Ensayo 2 (Min 115):** Prueba final con el paso de micrófonos y cambio de pantalla a la demo en vivo.

---

## 🛠️ Contrato de Datos (El JSON Mock para empezar YA)

Persona 1 puede usar este mock de inmediato mientras Persona 2 termina el backend:

```json
{
  "restaurantName": "Donde Chela - Taganga",
  "currency": "COP",
  "dishes": [
    {
      "id": "1",
      "name": "Pescado Frito Tradicional (Sierra)",
      "description": "Sierra fresca frita acompañada de arroz de coco titoté, patacón crocante y ensalada caribeña.",
      "priceCOP": 38000,
      "allergens": ["pescado"],
      "isVegetarian": false,
      "localHighlight": "Pescado capturado en la madrugada por artesanos de Taganga."
    },
    {
      "id": "2",
      "name": "Cayeye con Queso Costeño y Ahogado",
      "description": "Puré de guineo verde criollo machacado con mantequilla, coronado con abundante queso costeño rallado y sofrito de tomate y cebolla.",
      "priceCOP": 18000,
      "allergens": ["lácteos"],
      "isVegetarian": true,
      "localHighlight": "Plato insigne del Magdalena, originario de la zona bananera."
    },
    {
      "id": "3",
      "name": "Cazuela de Mariscos Samaria",
      "description": "Camarones, calamares y pulpo reducidos en leche de coco natural y especias de la Sierra Nevada.",
      "priceCOP": 45000,
      "allergens": ["mariscos", "moluscos", "lácteos"],
      "isVegetarian": false,
      "localHighlight": "Receta tradicional de la bahía con leche de coco fresca."
    },
    {
      "id": "4",
      "name": "Limonada de Coco Frappé",
      "description": "Bebida refrescante a base de crema de coco artesanal y limón mandarino de la región.",
      "priceCOP": 12000,
      "allergens": [],
      "isVegetarian": true,
      "localHighlight": "Perfecta para el calor del Caribe."
    }
  ]
}
```

---

## 🤖 Prompt del Concierge / Sommelier para Gemini

```text
Eres "SaborAI", un conserje gastronómico experto en la cultura de Santa Marta y el Caribe Colombiano.
Tienes acceso al siguiente menú del restaurante:
{{MENU_JSON}}

Instrucciones:
1. Responde SIEMPRE en el mismo idioma en el que te habla el usuario (inglés, francés, alemán, español, etc.).
2. Valida estrictamente las alergias y restricciones dietéticas del usuario. Si un plato contiene un alérgeno que el usuario no puede comer, descártalo y adviérteselo.
3. Si el usuario da un presupuesto máximo, no recomiendes platos que lo superen.
4. Explica brevemente los ingredientes locales con calidez caribeña (ej. qué es el cayeye, el arroz de coco titoté o el suero costeño).
5. Sugiere un maridaje de bebida del menú si el presupuesto lo permite.
```

---

## 🎤 Estructura del Pitch de 3 Minutos (Persona 4)

* **0:00 - 0:40 (El Problema):**
  *"Hola a todos. Piensen en un turista alemán que acaba de llegar al Parque de los Novios. Es alérgico a los mariscos. Se sienta en un restaurante tradicional, pero la carta está en una fotocopia arrugada en español, el mesero no habla inglés y el turista no tiene idea de qué es un cayeye o si el arroz comparte sartén con camarones. Por miedo a intoxicarse, termina cenando en una cadena de hamburguesas. El restaurante perdió $50.000 COP y el turista se perdió de nuestra cultura."*
* **0:40 - 1:45 (La Demo en Vivo - El Impacto):**
  1. *"Con MenúSamario AI, el dueño del local solo toma una foto a su carta física..."* (Muestran la pantalla donde la foto se procesa con Gemini 1.5 Flash y aparecen los platos estructurados con alérgenos identificados en 3 segundos).
  2. *"Ahora el turista escanea el QR desde su mesa y habla en su idioma..."* (Persona 3 envía un audio: *"Hi, I want a typical dish under 35.000 COP, no seafood"*, la IA responde de inmediato con la recomendación del Cayeye con explicación cultural).
* **1:45 - 2:30 (Tecnología Google & Escalabilidad):**
  *"Usamos Gemini 1.5 Flash con Structured Outputs para extracción multimodal ultra rápida, Firebase para sincronización en tiempo real y Google Cloud. No cobramos suscripciones abusivas: es digitalización gratuita para el micronegocio con analítica de demanda para saber qué buscan los turistas."*
* **2:30 - 3:00 (Cierre contundente):**
  *"MenúSamario AI democratiza la IA de Google para que la cocina tradicional del Magdalena hable todos los idiomas del mundo. ¡Muchas gracias!"*
