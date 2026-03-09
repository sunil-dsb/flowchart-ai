import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useEffect, useRef } from "react";

interface ExcalidrawEditorProps {
  excalidrawData: { elements: any[]; files: Record<string, any> };
}

const ExcalidrawEditor = ({ excalidrawData }: ExcalidrawEditorProps) => {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    if (excalidrawAPIRef.current && excalidrawData.elements?.length > 0) {
      excalidrawAPIRef.current.updateScene({
        elements: excalidrawData.elements,
      });
      if (excalidrawData.files && Object.keys(excalidrawData.files).length > 0) {
        excalidrawAPIRef.current.addFiles(
          Object.values(excalidrawData.files)
        );
      }
      excalidrawAPIRef.current.scrollToContent(excalidrawData.elements, {
        fitToViewport: true,
      });
    }
  }, [excalidrawData]);

  return (
    <div className="w-full h-full">
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawAPIRef.current = api;
        }}
        initialData={{
          elements: excalidrawData.elements,
          files: excalidrawData.files,
        }}
      />
    </div>
  );
};

export default ExcalidrawEditor;
