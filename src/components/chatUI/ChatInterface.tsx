import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDown, MessageCircle } from "lucide-react";
import PromptInput from "../PromptInput";
import { useDiagramStore } from "@/store/diagramStore";

const ChatInterface = () => {
  const conversation = useDiagramStore((state) => state.conversationData);
  console.log("conversation : ", conversation);

  return (
    <Dialog modal={false}>
      <form>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="absolute bottom-4 right-16 z-10 border-0 shadow-none bg-gray-200 cursor-pointer"
          >
            <MessageCircle className="bg-gray-200 text-gray-600" />
          </Button>
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="sm:max-w-sm translate-x-0 left-auto right-4 h-125 pr-4"
        >
          <DialogHeader className="gap-0">
            <DialogTitle className="flex items-center gap-2 font-normal text-sm -mt-2">
              <span>Past Conversations </span>
              <ChevronDown className="size-3 pt-0.5" />
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-300px pr-2 mb-4 overflow-y-auto overflow-x-hidden custom-scrollbar text-sm">
            {conversation.map((conversation, idx) =>
              conversation.role === "user" ? (
                <div key={idx} className="bg-[#e0dfff] text-zinc-900 px-2 py-1 rounded-md shadow-sm mb-4 self-end">
                  {conversation.message}
                </div>
              ) : (
                <pre key={idx} className="text-zinc-900 px-2 py-1 rounded-md shadow-sm mb-4 self-start">
                  {conversation.message}
                </pre>
                //  max-w-60 overflow-x-auto custom-scrollbar
              ),
            )}
          </div>
          <DialogFooter>
            <PromptInput />
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default ChatInterface;
