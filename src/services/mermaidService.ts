import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw';
import { convertToExcalidrawElements } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw';

function stripMermaidFences(code: string): string {
  return code.replace(/^```(?:mermaid)?\s*\n?/i, '').replace(/\n?```\s*$/,  '').trim();
}

export async function mermaidToExcalidrawElements(
  mermaidCode: string
): Promise<{ elements: any[]; files: any[] }> {
  const { elements: rawElements, files } = await parseMermaidToExcalidraw(stripMermaidFences(mermaidCode));
  const elements = convertToExcalidrawElements(rawElements);
  return { elements, files: files ?? {} };
}

export async function mermaidToExcalidraw(
  mermaidCode: string,
  excalidrawAPI: ExcalidrawImperativeAPI
) {
  const { elements, files } = await mermaidToExcalidrawElements(mermaidCode);
  excalidrawAPI.updateScene({ elements, files });
}