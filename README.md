# Wisp Mobile

**Habla. Publica.**

Wisp Mobile es la versión nativa de Wisp: convierte notas de voz en contenido listo para publicar en redes, usando IA, directamente desde tu móvil. Graba una idea suelta mientras caminas, mientras conduces, o simplemente cuando te venga a la cabeza — Wisp la transcribe, la transforma en el formato y tono que elijas, y aprende tu estilo con el tiempo según qué posts marques como útiles.

Comparte backend y base de datos con la versión web de Wisp, así que tu historial, tu perfil y tu racha son los mismos entres ambas plataformas.

## Cómo funciona

1. Grabas una nota de voz (o escribes/editas la transcripción antes de continuar)
2. Eliges uno de los tres modos de generación:
   - **Estándar** — genera tres variantes con distinto tono: reflexivo, directo y cercano
   - **Tono personalizado** — describes tú mismo el tono que quieres, y Wisp lo respeta
   - **Comparativa** — genera la misma idea adaptada a 2-3 formatos distintos a la vez, para comparar lado a lado
3. Eliges el formato de destino (LinkedIn, X, Instagram, TikTok, YouTube o email)
4. Copias el resultado, lo abres directamente en la app/web de destino, o lo guardas en tu historial
5. Marcas si un post te resultó útil o no — Wisp usa esa señal para priorizar ejemplos de tu propio estilo en generaciones futuras

## Funcionalidades adicionales

- **Racha diaria** — genera contenido en días consecutivos para desbloquear generaciones extra cada semana
- **Perfil de contexto** — cuéntale a Wisp a qué te dedicas, y lo tendrá en cuenta al generar contenido
- **Guardado de borrador** — si cierras la app a medio grabar, recuperas el texto donde lo dejaste
- **Historial con feedback** — marca posts como útiles, y bórralos si ya no los necesitas

## Stack técnico

**Frontend (móvil)**

- Expo + React Native + TypeScript
- Expo Router (navegación basada en archivos)
- `expo-audio` (grabación de audio nativa)
- Supabase Auth (autenticación, compartida con la web)
- Arquitectura en componentes con tema centralizado (`constants/theme.ts`)

**Backend** (compartido con la versión web, repositorio [`wisp`](https://github.com/DarioRB03/wisp))

- Python + FastAPI
- Arquitectura en capas: `routers`, `services`, `models`, `prompts`, `database`, `auth`
- Anthropic Claude API (generación de contenido)
- OpenAI Whisper (transcripción de audio)
- Verificación de JWT vía JWKS de Supabase

**Base de datos**

- PostgreSQL (Supabase), con Row Level Security por usuario