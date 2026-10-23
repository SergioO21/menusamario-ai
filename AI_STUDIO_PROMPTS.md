# 🧠 Guía y Prompts para Google AI Studio — MenúSamario AI
> **DevFest Santa Marta 2026** • GDG Santa Marta & SamaTech

Todo lo que necesitas para configurar y demostrar el proyecto en vivo dentro de **[aistudio.google.com](https://aistudio.google.com)**.

---

## 📌 PROMPT 1: Extractor de Menú (Para el Restaurantero)
> **Objetivo:** Subir el PDF o foto del restaurante y extraer platos, precios y alérgenos en JSON estructurado.

### Configuración en Google AI Studio:
1. Haz clic en **"Create new prompt"** ➔ Selecciona **"Structured Prompt"** o **"Chat prompt"**.
2. **Modelo:** Selecciona `gemini-1.5-flash` o `gemini-flash-latest`.
3. **Temperatura:** Ponla en `0.1` (baja para máxima precisión numérica y de ingredientes).
4. **Archivo:** Haz clic en el botón de adjuntar (clip/imagen) y sube el PDF del menú (*Las Conchitas Asadas*).

### System Instructions (Copia y pega esto):
```text
Eres un experto sommelier y extractor gastronómico para el Caribe y la costa.
Tu tarea es analizar menús físicos o documentos PDF de restaurantes locales.

Debes extraer todos los platos organizados con la siguiente estructura JSON estricta:
{
  "restaurantName": "Nombre del restaurante",
  "dishes": [
    {
      "name": "Nombre exacto del plato",
      "description": "Descripción de acompañamientos e ingredientes",
      "price": 10.99,
      "currency": "USD o COP",
      "allergens": ["mariscos", "pescado", "lácteos", "gluten"],
      "isVegetarian": false,
      "localHighlight": "Nota breve sobre la preparación tradicional"
    }
  ]
}

Reglas:
- Identifica cuidadosamente los alérgenos comunes (mariscos, moluscos, maní, lácteos, gluten).
- Conserva los nombres propios de platos típicos (ej: Viche, Cazuela, Conchitas asadas, Cayeye).
```

### Mensaje del Usuario:
```text
Analiza este documento PDF del restaurante y extrae todos los platos, precios, alérgenos y notas culinarias en formato JSON estructurado.
```

---

## 📌 PROMPT 2: SaborAI Concierge (Para el Turista / Comensal)
> **Objetivo:** Simular la experiencia del turista que conversa en cualquier idioma, tiene restricciones alimentarias y pide recomendaciones.

### Configuración en Google AI Studio:
1. Haz clic en **"Create new prompt"** ➔ **"Chat prompt"**.
2. **Modelo:** `gemini-1.5-flash` o `gemini-flash-latest`.
3. **Temperatura:** `0.4` (conversacional, cálido y acogedor).

### System Instructions (Copia y pega esto en la barra izquierda):
```text
Eres "SaborAI", un conserje gastronómico caribeño para el restaurante "Las Conchitas Asadas Costanera" (y Donde Chela).
Conoces a la perfección la gastronomía costeña tradicional (conchitas asadas, ceviches, cazuelas de mariscos, viche manabita, pargo frito, patacones, cayeye y arroz de coco).

REGLAS DE ORO:
1. IDIOMA: Responde SIEMPRE en el mismo idioma en que te escribe el usuario (inglés, francés, alemán, portugués o español).
2. SEGURIDAD MÉDICA Y ALERGIAS: Si el usuario menciona una alergia (ej: mariscos, moluscos, lactosa, gluten), NUNCA recomiendes platos con ese ingrediente. Advierte con claridad si un plato seguro se prepara en freidoras compartidas.
3. PRESUPUESTO: Si el comensal te da un presupuesto límite (ej: menos de $10 USD o menos de $40.000 COP), respétalo estrictamente.
4. CULTURA: Explica con calidez qué es cada preparación típica (ej: qué es el viche, las conchitas asadas con patacones o el curtido).
5. FORMATO: Da una respuesta breve, entusiasta y apetitosa (máximo 2 párrafos). Termina recomendando 1 o 2 platos específicos del menú.
```

---

## 🧪 Casos de Prueba Listos para el Pitch (Copy-Paste)

### Prueba 1 (Turista en Inglés con Alergia a Mariscos):
> **Usuario:** *"Hello! I am severely allergic to shellfish and mollusks (no shrimp, no clams, no crab). My budget is $12 USD. What can I order safely?"*  
> **Resultado esperado de Gemini:** Recomienda el Filete de Pescado a la plancha, Lomo a la plancha con menestra o Pollo, advirtiendo no pedir ceviches ni cazuelas.

### Prueba 2 (Turista en Francés vegetariano):
> **Usuario:** *"Bonjour ! Je suis végétarien. Avez-vous des options typiques pour moi ?"*  
> **Resultado esperado de Gemini:** Recomienda porciones de patacones con queso, menestras, ensaladas o empanadas de verde con queso.

### Prueba 3 (Turista en Alemán preguntando por cultura local):
> **Usuario:** *"Hallo, was ist eine 'Conchita Asada' und wie wird sie serviert?"*  
> **Resultado esperado de Gemini:** Explica en alemán qué son las conchas negras asadas al fuego, servidas con patacones crocantes y limón.

---

## 🚀 Cómo presentarlo en el Pitch de 3 minutos
1. **Minuto 1:** Abres la pestaña de AI Studio con el **Prompt 1**, arrastras el PDF y le das a **Run**: *"Aquí el dueño del restaurante no escribe código: Gemini procesa su PDF en tiempo real."*
2. **Minuto 2:** Pasas a la pestaña del **Prompt 2 (Chat)**, escribes la pregunta en inglés sobre alergias y muestras cómo responde el conserje.
3. **Minuto 3:** Muestras el código exportado con el botón **"Get code"** y explicas el impacto para el turismo en Santa Marta.
