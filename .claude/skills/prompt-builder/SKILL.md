---
name: prompt-builder
description: Convierte una idea breve del usuario en un prompt pulido y listo para alimentar a otro agente que generará un plan de implementación. Hace preguntas de clarificación cuando falta contexto crítico antes de escribir el prompt final.
---

# prompt-builder

Tu trabajo en esta skill es **transformar una idea cruda del usuario en un prompt de alta calidad** que otro agente (o tú mismo en otra sesión) usará para producir un plan de implementación detallado.

NO implementes la tarea. NO escribas código. El entregable es **el prompt**.

## Flujo

### 1. Lee la idea inicial

El usuario invocará la skill con texto libre describiendo qué quiere construir o cambiar. Trátalo como una intención, no como una especificación.

### 2. Inspecciona el repo lo justo

Antes de preguntar nada, dedica 1–2 minutos a entender el contexto:

- Lee `CLAUDE.md` y `AGENTS.md` si existen.
- Si la idea menciona archivos, módulos o features concretos, ábrelos.
- Si menciona algo que no localizas, búscalo con `grep`/`find` (una o dos pasadas, no más).

El objetivo es **no preguntar lo que el repo ya responde**.

### 3. Decide si necesitas preguntar

Solo haz preguntas si la respuesta cambia materialmente el plan. Filtros:

- ¿Hay ambigüedad de **alcance**? (¿solo UI, también API, también tests?)
- ¿Hay decisiones de **diseño** que el usuario debe tomar y no puedes inferir? (formato de datos, contrato de API, comportamiento ante errores, criterio de éxito)
- ¿Hay **restricciones implícitas** que probablemente existan? (compatibilidad, performance, deadlines, dependencias bloqueantes)
- ¿Falta un **criterio de aceptación** verificable?

Si nada de lo anterior aplica, **no preguntes** — escribe el prompt directamente.

Reglas para preguntar bien:

- Máximo **3–5 preguntas** en una sola tanda. Nada de interrogatorios por turnos.
- Cada pregunta debe ofrecer una **opción por defecto razonable** que el usuario pueda aceptar con un "sí" o "ok". Ejemplo: *"¿Quieres que el caché use TTL fijo (por defecto, 5 min) o invalidación manual?"*
- Agrupa las preguntas por tema, no las dispares sueltas.
- No preguntes cosas cosméticas (nombres de variables, indentación) — esas las decide el plan.

### 4. Escribe el prompt final

Una vez tengas la información, produce el prompt en un bloque de código markdown (` ```text ... ``` `) para que el usuario lo pueda copiar literal. Estructura recomendada:

```text
# Objetivo
<una frase: qué se va a construir/cambiar y por qué>

# Contexto del repo
- Stack: <lenguajes, frameworks, build tools relevantes>
- Archivos clave: <rutas con línea cuando aplique>
- Convenciones a respetar: <patrones del proyecto que el plan debe seguir>

# Requisitos
- <requisito funcional 1>
- <requisito funcional 2>
- ...

# Restricciones
- <qué NO se debe tocar / romper>
- <compatibilidad, performance, dependencias bloqueadas, etc.>

# Criterios de aceptación
- <condición verificable 1>
- <condición verificable 2>

# Entregable esperado
Un plan de implementación paso a paso que indique:
1. Qué archivos crear/modificar y qué cambia en cada uno.
2. Orden de ejecución y dependencias entre pasos.
3. Riesgos identificados y cómo mitigarlos.
4. Cómo validar cada paso (comando, test, verificación manual).

No escribas código todavía — solo el plan.
```

Adapta las secciones a la naturaleza de la tarea. Si una sección no aporta, omítela en lugar de rellenarla con humo.

### 5. Cierra con una nota corta

Después del bloque del prompt, en 1–2 líneas:

- Indica qué supuestos asumiste (si los hay) para que el usuario los corrija si quiere.
- Sugiere cómo usar el prompt: *"Pégalo en una nueva sesión de Claude Code o pásalo a un agente Plan."*

## Principios

- **Específico > genérico.** Un prompt que nombra archivos y líneas concretas produce planes mucho mejores que uno que dice "el módulo de usuarios".
- **Verificable > aspiracional.** Cada requisito debe poderse comprobar. "Que sea rápido" no sirve; "que la consulta tarde <200ms en p95" sí.
- **Cita el repo.** Cuando el contexto del proyecto sea relevante, referencia rutas reales (`src/queries/FetchData.ts`) en lugar de describir en abstracto.
- **No infles.** Si el usuario pidió algo de 3 líneas, no devuelvas un prompt de 80 — escala el detalle al tamaño real de la tarea.
