import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface FlowchartRendererProps {
  mermaidCode: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
});

function stripMermaidFences(code: string): string {
  return code
    .replace(/^```(?:mermaid)?\s*\n?/i, "")
    .replace(/\n?```\s*$/, "")
    .trim();
}

const FlowchartRenderer = ({ mermaidCode }: FlowchartRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mermaidCode || !containerRef.current) return;

    const renderDiagram = async () => {
      try {
        setError(null);
        const cleanCode = stripMermaidFences(mermaidCode);
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, cleanCode);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to render diagram"
        );
      }
    };

    renderDiagram();
  }, [mermaidCode]);

  if (!mermaidCode) return null;

  return (
    <div className="rounded-lg border bg-white p-4 pb-98">
      <h3 className="text-lg font-semibold mb-2">Flowchart</h3>
      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <div ref={containerRef} className="flex justify-center overflow-auto" />
      )}
    </div>
  );
};

export default FlowchartRenderer;
