
import { OpenRouter } from '@openrouter/sdk';
import mermaid from 'mermaid';

const OPEN_ROUTER_KEY = "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"

const openRouter = new OpenRouter({
    apiKey: OPEN_ROUTER_KEY
});

const MAX_RETRIES = 2;

const SYSTEM_PROMPT = `You are a Mermaid diagram generator. Generate ONLY valid Mermaid diagram code.

Supported diagram types:
- flowchart (graph TD/LR/BT/RL)
- sequenceDiagram
- erDiagram
- classDiagram
- stateDiagram-v2
- gantt
- gitGraph
- pie
- requirementDiagram
- journey
- xychart-beta
- mindmap
- timeline
- quadrantChart
- block-beta
- packet-beta
- C4Context / C4Container / C4Component / C4Dynamic / C4Deployment

Requirements:
- Automatically detect the most appropriate diagram type based on the user's request.
- ALWAYS start with the correct diagram type declaration on the first line.
- Follow the correct Mermaid syntax strictly for the chosen diagram type.
- Return ONLY raw Mermaid code. No markdown. No explanation. No \`\`\` code fences.

When the user asks to modify or improve a diagram, use the provided current diagram as the base and apply the requested changes. Preserve the existing diagram type unless the user explicitly asks to change it.`;

function stripMermaidFences(code: string): string {
    return code.replace(/^```(?:mermaid)?\s*\n?/i, '').replace(/\n?```\s*$/, '').trim();
}

async function validateMermaidCode(code: string): Promise<{ valid: boolean; error?: string }> {
    try {
        await mermaid.parse(code);
        return { valid: true };
    } catch (e: any) {
        const errorMessage = e?.message || e?.str || String(e);
        return { valid: false, error: errorMessage };
    }
}

const generateMermaid = async (prompt: string, currentMermaidCode: string) => {
    const messages: { role: "system" | "user"; content: string }[] = [
        { role: "system", content: SYSTEM_PROMPT },
    ];

    if (currentMermaidCode) {
        messages.push({
            role: "user",
            content: `Current diagram:\n${currentMermaidCode}`
        });
    }

    messages.push({
        role: "user",
        content: prompt
    });

    let lastCode = "";

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const completion = await openRouter.chat.send({
            chatGenerationParams: {
            model: "stepfun/step-3.5-flash:free",
                messages
            }
        });

        console.log(completion);
        lastCode = stripMermaidFences(completion.choices[0].message.content || "");

        const { valid, error } = await validateMermaidCode(lastCode);

        if (valid) {
            return lastCode;
        }

        console.warn(`Mermaid validation failed (attempt ${attempt + 1}):`, error);

        messages.push({
            role: "user",
            content: `The Mermaid code you generated has a syntax error:\n${error}\n\nHere is the invalid code:\n${lastCode}\n\nPlease fix the syntax error and return only the corrected Mermaid code.`
        });
    }

    return lastCode;
}

export default generateMermaid
