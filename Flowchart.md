# AI + Mermaid.js + Excalidraw Flowchart App Plan

A complete React/Electron app where users input natural language prompts → AI generates Mermaid code → converts to fully editable Excalidraw canvas.

## Tech Stack

```
Frontend: React + TypeScript + Tailwind CSS
Diagram: Mermaid.js → @excalidraw/mermaid-to-excalidraw → Excalidraw
AI: OpenAI GPT-4o-mini / OpenRouter / Ollama (local)
Desktop: Electron + pnpm
Storage: PGlite (local PostgreSQL)
Export: SVG/PNG/JSON
```

## Project Structure

```
src/
├── components/
│   ├── PromptInput.tsx
│   ├── MermaidPreview.tsx
│   └── ExcalidrawEditor.tsx
├── services/
│   ├── aiService.ts         # Prompt → Mermaid
│   └── mermaidService.ts    # Mermaid → Excalidraw
├── hooks/
│   └── useDiagram.ts
├── App.tsx
└── main/                    # Electron entry
```

## 🚀 Quick Setup (10 minutes)

```bash
npx create-react-app flowchart-app --template typescript
cd flowchart-app
pnpm add @excalidraw/excalidraw @excalidraw/mermaid-to-excalidraw mermaid openai zustand tailwindcss
pnpm add -D @types/mermaid electron electron-builder concurrently wait-on
pnpm install
```

## Core Implementation

### 1. AI Service (`services/aiService.ts`)

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateMermaid(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Generate ONLY valid Mermaid flowchart code (graph TD format) for this process. No explanations or markdown:
"${prompt}"`,
      },
    ],
  });
  return response.choices[0].message.content!.trim();
}
```

### 2. Mermaid Conversion (`services/mermaidService.ts`)

```typescript
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw";

export async function mermaidToExcalidrawElements(
  mermaidCode: string,
): Promise<{ elements: any[]; files: any[] }> {
  const { elements: rawElements } = await parseMermaidToExcalidraw(mermaidCode);
  return { elements: rawElements, files: [] };
}
```

### 3. State Management Hook (`hooks/useDiagram.ts`)

```typescript
import { useState } from "react";
import { generateMermaid } from "../services/aiService";
import { mermaidToExcalidrawElements } from "../services/mermaidService";

export function useDiagram() {
  const [mermaidCode, setMermaidCode] = useState("");
  const [excalidrawData, setExcalidrawData] = useState({
    elements: [],
    files: [],
  });
  const [loading, setLoading] = useState(false);

  const generateFromPrompt = async (prompt: string) => {
    setLoading(true);
    try {
      const code = await generateMermaid(prompt);
      setMermaidCode(code);
      const excalidrawData = await mermaidToExcalidrawElements(code);
      setExcalidrawData(excalidrawData);
    } finally {
      setLoading(false);
    }
  };

  return {
    mermaidCode,
    excalidrawData,
    generateFromPrompt,
    loading,
    setMermaidCode,
    setExcalidrawData,
  };
}
```

### 4. Main App (`App.tsx`)

```tsx
import ReactExcalidraw from "@excalidraw/excalidraw";
import { useDiagram } from "./hooks/useDiagram";
import mermaid from "mermaid";

function App() {
  const { mermaidCode, excalidrawData, generateFromPrompt, loading } =
    useDiagram();
  const [prompt, setPrompt] = useState("");

  // Auto-render Mermaid when code changes
  useEffect(() => {
    if (mermaidCode) {
      mermaid.initialize({ startOnLoad: true });
    }
  }, [mermaidCode]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header & Prompt */}
      <div className="p-6 bg-white border-b shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          AI Flowchart Generator
        </h1>
        <div className="flex gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your process: 'User login → validate → dashboard or error'"
            className="flex-1 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            onClick={() => generateFromPrompt(prompt)}
            disabled={loading || !prompt}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Generating..." : "Create Flowchart"}
          </button>
        </div>
      </div>

      {/* Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mermaid Preview (Left) */}
        <div className="w-1/2 border-r border-gray-200">
          <div className="p-4 bg-white border-b">
            <h2 className="font-semibold text-gray-700">Mermaid Preview</h2>
          </div>
          <div className="h-full p-4 overflow-auto bg-gray-50">
            {mermaidCode ? (
              <div
                className="mermaid w-full h-full"
                dangerouslySetInnerHTML={{ __html: mermaidCode }}
              />
            ) : (
              <div className="text-gray-500 text-center py-20">
                Generate a flowchart to preview
              </div>
            )}
          </div>
        </div>

        {/* Excalidraw Editor (Right) */}
        <div className="w-1/2">
          <div className="p-4 bg-white border-b">
            <h2 className="font-semibold text-gray-700">Editable Canvas</h2>
          </div>
          <div className="h-full">
            <ReactExcalidraw
              initialData={excalidrawData}
              onChange={(data) => {
                /* Save state if needed */
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 📦 Electron Configuration

### `package.json` scripts

```json
{
  "scripts": {
    "dev": "react-scripts start",
    "build": "react-scripts build",
    "electron": "electron .",
    "electron-dev": "concurrently \"pnpm dev\" \"wait-on http://localhost:3000 && electron .\"",
    "dist": "pnpm build && electron-builder"
  },
  "main": "electron.main.js"
}
```

### `electron.main.js`

```javascript
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadURL("http://localhost:3000"); // Dev
  // win.loadFile(path.join(__dirname, 'build/index.html')); // Prod
}

app.whenReady().then(createWindow);
```

## 🎯 User Workflow

```
1. Type: "User registers → email verification → account active → login"
2. Click "Create Flowchart"
3. Left: Static Mermaid SVG renders instantly
4. Right: Editable Excalidraw canvas auto-populates
5. Drag/resize nodes, add annotations, change colors
6. Export: SVG/PNG/JSON via Excalidraw toolbar
```

## 🔧 Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-...
VITE_APP_TITLE=AI Flowchart Generator
```

## 🚀 Development Commands

```bash
pnpm electron-dev     # Hot reload dev mode
pnpm build            # Production build
pnpm dist            # Package Electron app
```

## 📋 Next Steps (3-Day Plan)

### Day 1: MVP (4 hours)

- [x] Basic prompt → Mermaid → Excalidraw
- [x] Split-panel UI with Tailwind
- [ ] Test with 5 sample prompts

### Day 2: Polish (3 hours)

- [ ] PGlite persistence (`npm i @electric-sql/pglite`)
- [ ] Export buttons (SVG/PNG/JSON)
- [ ] Undo/redo sync between panels

### Day 3: Production (2 hours)

- [ ] Electron packaging + auto-updater
- [ ] Drag/drop Mermaid code editing
- [ ] Themes + print-to-PDF

## 🎨 Test Prompts

```
"User login process with 2FA"
"E-commerce checkout flow"
"Database backup workflow"
"CI/CD pipeline steps"
"User registration + email verification"
```

---

**Total Time: ~9 hours to production-ready desktop app**

Save as `flowchart-app-plan.md` and start with `pnpm install`! 🚀
