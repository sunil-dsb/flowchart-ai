# Flowchart AI

An AI-powered diagram generator that converts natural language descriptions into fully editable visual diagrams. Type what you want in natural language, and get an interactive diagram you can customize. Supports flowcharts, sequence diagrams, ER diagrams, state machines, Gantt charts, and more.

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand + Excalidraw + Mermaid.js + OpenRouter AI

---

## Table of Contents

- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Architecture & Data Flow](#architecture--data-flow)
- [Core Modules](#core-modules)
- [UI Components](#ui-components)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [Example Prompts](#example-prompts)

---

## How It Works

```
User types a prompt ──► AI generates Mermaid code ──► Converted to Excalidraw/image ──► Rendered on editable canvas
```

1. **User Input** — Describe any process, system, or relationship in plain English (e.g., "User login flow with 2FA")
2. **AI Generation** — OpenRouter API (Step 3.5 Flash model) converts the prompt into valid Mermaid syntax
   - Automatically detects appropriate diagram type (flowchart, sequence, ER, state machine, gantt, mindmap, etc.)
   - Maintains conversation context for iterative refinements
3. **Diagram Conversion** — Mermaid code converts to Excalidraw-compatible elements (or renders as image for non-interactive types)
4. **Interactive Canvas** — Diagram renders on Excalidraw canvas where users can drag, resize, restyle, and annotate elements
5. **Conversation History** — All prompts and generated code stored in chat history for reference and iteration

---

## Project Structure

```
flowchart-ai/
├── src/
│   ├── main.tsx                          # React entry point
│   ├── App.tsx                           # Root component — composes ChatInterface + ExcalidrawEditor
│   ├── App.css                           # Tailwind imports + CSS theme variables (oklch)
│   │
│   ├── services/
│   │   ├── aiService.ts                  # OpenRouter API — prompt → Mermaid code with validation
│   │   └── mermaidService.ts             # Mermaid code → Excalidraw elements conversion
│   │
│   ├── store/
│   │   └── diagramStore.ts               # Zustand store — orchestrates AI + conversion pipeline + conversation history
│   │
│   ├── components/
│   │   ├── PromptInput.tsx               # Input form with Zod validation + React Hook Form
│   │   ├── ExcalidrawEditor.tsx          # Excalidraw canvas wrapper with imperative API
│   │   ├── FlowchartRenderer.tsx         # Direct Mermaid SVG renderer (alternative view)
│   │   ├── MermaidPreview.tsx            # Raw Mermaid code text preview
│   │   ├── chatUI/
│   │   │   └── ChatInterface.tsx         # Conversation modal dialog + history display
│   │   └── ui/                           # shadcn/ui component library
│   │       ├── button.tsx                #   CVA-based button with size/variant props
│   │       ├── card.tsx                  #   Card, CardHeader, CardContent, CardFooter
│   │       ├── dialog.tsx                #   Modal dialog with Radix UI
│   │       ├── field.tsx                 #   Form field wrapper (vertical/horizontal layout)
│   │       ├── input.tsx                 #   Styled text input
│   │       ├── input-group.tsx           #   Composite input with addons/icons
│   │       ├── label.tsx                 #   Radix UI label
│   │       ├── separator.tsx             #   Visual divider
│   │       ├── sonner.tsx                #   Toast notification (Sonner)
│   │       └── textarea.tsx              #   Multiline text input
│   │
│   ├── lib/
│   │   └── utils.ts                      # cn() — clsx + tailwind-merge utility
│   │
│   └── assets/
│       └── react.svg
│
├── public/
│   └── vite.svg
│
├── index.html                            # HTML entry
├── package.json                          # Dependencies & scripts
├── pnpm-lock.yaml                        # Lockfile (pnpm)
├── vite.config.ts                        # Vite + React plugin + Tailwind CSS plugin
├── tsconfig.json                         # Base TS config with path aliases
├── tsconfig.app.json                     # App TS config (strict, ES2022)
├── tsconfig.node.json                    # Build tooling TS config
├── eslint.config.js                      # ESLint + TypeScript rules
├── components.json                       # shadcn/ui configuration
├── Flowchart.md                          # Original project plan
├── .env                                  # API keys (not committed)
└── .gitignore
```

---

## Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                       │
│  ┌──────────────────────────────┐         ┌───────────────────────────┐    │
│  │      ChatInterface           │         │   ExcalidrawEditor        │    │
│  │                              │         │                           │    │
│  │  Dialog modal with           │         │  Excalidraw canvas        │    │
│  │  conversation history        │         │  updateScene() + reactive │    │
│  │  + PromptInput               │         │  rendering via store      │    │
│  └──────────┬───────────────────┘         └──────────────▲────────────┘    │
│             │                                            │                 │
│             │ onSubmit(prompt)                           │                 │
│             ▼                                            │ excalidrawData  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │              useDiagramStore (Zustand)                               │  │
│  │                                                                      │  │
│  │  State:                                                              │  │
│  │  - mermaidCode | excalidrawData | loading                            │  │
│  │  - prompt | conversationData[] (Message[])                           │  │
│  │                                                                      │  │
│  │  generateFromPrompt(prompt):                                         │  │
│  │    1. setLoading(true), addMessage(prompt)                           │  │
│  │    2. mermaidCode = await generateMermaid(prompt, currentCode)       │  │
│  │    3. excalidrawData = await mermaidToExcalidrawElements(code)       │  │
│  │    4. addMessage(mermaidCode), setLoading(false)                     │  │
│  └──────┬─────────────────────────────────────────────┬─────────────────┘  │
│         │                                             │                     │
│         ▼                                             ▼                     │
│  ┌──────────────────────┐            ┌─────────────────────────────────┐   │
│  │  aiService.ts        │            │  mermaidService.ts              │   │
│  │                      │            │                                 │   │
│  │  OpenRouter API      │            │  stripMermaidFences()           │   │
│  │  stepfun/step-3.5    │            │  mermaidToExcalidrawElements()  │   │
│  │  -flash:free         │            │  validateMermaidCode()          │   │
│  │  Multi-turn support  │            │  (with retry logic)             │   │
│  │  (all Mermaid types) │            │                                 │   │
│  └──────────────────────┘            └─────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── ChatInterface
│   └── Dialog
│       ├── DialogHeader (title + icon)
│       ├── Dialog conversation list (scrollable)
│       └── DialogFooter
│           └── PromptInput
│               └── Card > CardContent + CardFooter
│                   └── Form (React Hook Form)
│                       ├── InputGroup > Textarea
│                       └── Button (Submit — Send/Loader icon)
│
└── ExcalidrawEditor
    └── Excalidraw (canvas with imperative API ref)
```

---

## Core Modules

### `services/aiService.ts` — AI Integration

Connects to the **OpenRouter API** using the free `stepfun/step-3.5-flash:free` model.

- **Input:** Natural language prompt + optional current Mermaid code for context
- **Output:** Mermaid diagram code (supports all Mermaid diagram types)
- **Features:**
  - Multi-turn conversation support (maintains context via `currentMermaidCode` parameter)
  - Automatic diagram type detection (flowchart, sequence, ER, state machine, gantt, etc.)
  - Validation & retry logic (up to 2 retries on syntax errors)
  - Mermaid syntax validation using `mermaid.parse()`
- **System prompt** enforces:
  - Valid Mermaid syntax for all supported diagram types
  - Raw code output (no markdown fences, no explanations)
  - Proper diagram type declaration on first line

### `services/mermaidService.ts` — Diagram Conversion

Handles the Mermaid-to-Excalidraw pipeline with support for all Mermaid diagram types:

| Function | Purpose |
|---|---|
| `stripMermaidFences(code)` | Removes markdown code fences from AI output |
| `mermaidToExcalidrawElements(code)` | Parses Mermaid → Excalidraw elements + image files |
| `mermaidToExcalidraw(code, api)` | Directly updates an Excalidraw scene via imperative API |

Supports rendering all Mermaid types as Excalidraw elements or static images when direct conversion isn't available.

### `store/diagramStore.ts` — State Management (Zustand)

Central store that orchestrates the entire generation pipeline with conversation history:

| State | Type | Purpose |
|---|---|---|
| `mermaidCode` | `string` | Current/latest generated Mermaid code |
| `prompt` | `string` | Last user prompt |
| `excalidrawData` | `{ elements, files }` | Converted Excalidraw scene data |
| `loading` | `boolean` | API call in progress |
| `conversationData` | `Message[]` | History of all user prompts + AI responses |

**Exposed functions:**
- `generateFromPrompt(prompt)` — runs the full AI → conversion → render pipeline
- `addMessage(msg)` — adds a message to conversation history
- `clearConversation()` — resets conversation history
- `setMermaidCode(code)` — updates the Mermaid code
- `setExcalidrawData(data)` — updates the Excalidraw data

---

## UI Components

### `ChatInterface.tsx`

Modal dialog with conversation history, positioned in the bottom-right corner:

- Displays full conversation history (user prompts & AI responses)
- Shows Mermaid code responses in code block format
- User messages displayed in colored bubbles (sent alignment)
- Accessible via floating message icon button
- Contains the `PromptInput` component in the footer

### `PromptInput.tsx`

Input form nested inside ChatInterface footer. Features:

- **Validation:** Zod schema enforces minimum character length
- **Form state:** React Hook Form with `@hookform/resolvers/zod`
- **UX:** Animated loader icon during generation, disabled state while loading
- **Keyboard UX:** Enter to submit, Shift+Enter for newline, auto-resets after submit

### `ExcalidrawEditor.tsx`

Full-screen Excalidraw canvas that reactively updates when new diagram data arrives:

- Watches `excalidrawData` prop and syncs via `updateScene()` + `scrollToContent()`
- Imperative API ref for direct canvas control
- Users can freely edit, drag, restyle, and annotate the generated diagram
- Supports all Mermaid diagram types (renders as interactive elements or images)

### `FlowchartRenderer.tsx`

Alternative Mermaid SVG renderer (currently unused in main layout). Renders Mermaid code directly as an SVG element with error handling for invalid syntax.

### `ui/` — shadcn/ui Library

Pre-built, accessible components using Radix UI primitives + CVA (Class Variance Authority):

- **Button** — Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes: `xs` through `lg`, plus `icon` variants
- **Card** — Composable: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- **Dialog** — Modal dialog with header, content, and footer sections
- **InputGroup** — Composite input with addon slots (icons, buttons, text)
- **Field** — Form field wrapper with orientation support (vertical/horizontal/responsive)
- Toast notifications via **Sonner**

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Framework** | React 19 | UI rendering |
| **Language** | TypeScript 5.9 | Type safety |
| **Build** | Vite 7.3 | Dev server + bundling with HMR |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with oklch color system |
| **UI Kit** | shadcn/ui + Radix UI | Accessible, composable components |
| **State** | Zustand | Lightweight state management |
| **Forms** | React Hook Form + Zod | Form state + schema validation |
| **Diagrams** | Mermaid.js | All Mermaid diagram types + syntax validation |
| **Canvas** | Excalidraw | Interactive, editable whiteboard |
| **Conversion** | @excalidraw/mermaid-to-excalidraw | Mermaid → Excalidraw bridge (with image fallback) |
| **AI** | OpenRouter SDK | LLM API gateway (Step 3.5 Flash free tier) |
| **Icons** | Lucide React | Icon library |
| **Theming** | next-themes | Light/dark mode support |
| **Desktop** | Electron (planned) | Desktop app packaging |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** (recommended package manager)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd flowchart-ai

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your OpenRouter API key to .env
```

### Development

```bash
pnpm dev
```

Opens the app at `http://localhost:5173` with hot module replacement.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm build` | Type-check (`tsc -b`) then build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint across the project |

---

## Environment Variables

Currently, the API key is hardcoded in `services/aiService.ts`. To use your own OpenRouter API key:

1. Get a free key at [openrouter.ai](https://openrouter.ai)
2. Update the `OPEN_ROUTER_KEY` variable in `services/aiService.ts`

> ⚠️ **Note:** Avoid committing API keys to version control. Consider moving to `.env` file in future updates.

---

## Example Prompts

Try these to generate diagrams in various formats:

```
Flowchart:
"User login process with 2FA"
"E-commerce checkout flow"
"CI/CD pipeline steps"
"Database backup and recovery workflow"

Sequence Diagram:
"API request flow from client to server and back"
"OAuth 2.0 authentication flow"

Entity Relationship Diagram:
"Database schema for an e-commerce platform"
"User, Order, Product relationships"

Gantt Chart:
"Project timeline for web application development"
"Sprint schedule for an agile team"

Mindmap:
"Product roadmap breakdown"
"Course curriculum structure"
```
