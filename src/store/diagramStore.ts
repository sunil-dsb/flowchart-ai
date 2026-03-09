import { create } from "zustand"
import generateMermaid from "@/services/aiService";
import { mermaidToExcalidrawElements } from "@/services/mermaidService";

type ExcalidrawData = {
    elements: any[];
    files: any;
}

export type Message = {
  message: string;
  role: "user" | "assistant";
}

type DiagramStore = {
    mermaidCode: string;
    prompt: string;
    excalidrawData: ExcalidrawData;
    loading: boolean;
    conversationData: Message[];

    setMermaidCode: (code: string) => void;
    setExcalidrawData: (data: ExcalidrawData) => void;
    generateFromPrompt: (prompt: string) => Promise<void>;
    addMessage: (msg: Message) => void;
    clearConversation: () => void;
}

export const useDiagramStore = create<DiagramStore>((set,get) => ({
    mermaidCode: "",
    prompt: "",
    excalidrawData: { elements: [], files: {} },
    loading: false,
    conversationData: [],

    setMermaidCode: (code) => set({ mermaidCode: code }),
    setExcalidrawData: (data) => set({excalidrawData: data}),
    addMessage: (msg) => set((state) => ({conversationData: [...state.conversationData, msg]})),
    clearConversation: () => set({conversationData: []}),
    generateFromPrompt: async (prompt) => {
        set({loading: true});
        set({prompt: prompt});
        get().addMessage({ message: prompt, role: "user" });
        try{
            const currentMermaid = get().mermaidCode;
            const code = await generateMermaid(prompt, currentMermaid);
            set({mermaidCode: code});
            const excalidrawData = await mermaidToExcalidrawElements(code);
            set({excalidrawData: excalidrawData});
            get().addMessage({ message: code, role: "assistant" });
        } catch (error) {
            get().addMessage({ message: "An error occurred", role: "assistant" });
            console.error(error);
        } finally {
            set({loading: false});
        }
    }
}))