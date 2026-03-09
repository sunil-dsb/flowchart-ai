interface MermaidPreviewProps {
  mermaidCode: string;
}

const MermaidPreview = ({ mermaidCode }: MermaidPreviewProps) => {
  return (
    <div>
      <h3>Mermaid Preview</h3>
      <pre className="text-sm">{mermaidCode}</pre>
    </div>
  );
};

export default MermaidPreview;
