import "./App.css";
import ChatInterface from "./components/chatUI/ChatInterface";
import ExcalidrawEditor from "./components/ExcalidrawEditor";
import FlowchartRenderer from "./components/FlowchartRenderer";
import { useDiagramStore } from "./store/diagramStore";

const App = () => {
  const { excalidrawData } = useDiagramStore();

  return (
    <div className="w-full h-screen relative">
      <ChatInterface />
      {/* <FlowchartRenderer mermaidCode={mermaidCode} /> */}
      <ExcalidrawEditor excalidrawData={excalidrawData} />
    </div>
  );
};

export default App;
