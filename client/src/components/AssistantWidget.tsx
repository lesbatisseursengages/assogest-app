import { useState } from "react";
import { useLocation } from "wouter";
import { Bot, MessageCircle, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const welcomeMessage: Message = {
  role: "assistant",
  content: "Bonjour ! Je suis l’assistant des Bâtisseurs Engagés. Je peux vous expliquer les modules, vous guider dans les actions et vous aider à comprendre les informations affichées.",
};

const suggestedPrompts = [
  "Guide-moi pas à pas pour créer un membre",
  "Comment enregistrer un don et générer son reçu ?",
  "Comment importer mes vrais membres depuis un CSV ?",
  "Comment ajouter une tâche et déplacer sa barre dans le Gantt ?",
];

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const askMutation = trpc.assistant.ask.useMutation();

  const handleSendMessage = (content: string) => {
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    askMutation.mutate(
      { messages: nextMessages.filter((message) => message.role !== "system").map(({ role, content: messageContent }) => ({ role: role as "user" | "assistant", content: messageContent })), pagePath: location },
      {
        onSuccess: (reply) => {
          setMessages((current) => [...current, { role: "assistant", content: reply.answer, actions: reply.actions, liveData: reply.liveData }]);
        },
        onError: (error) => {
          toast.error("L’assistant est momentanément indisponible");
          setMessages((current) => [
            ...current,
            { role: "assistant", content: `Je ne peux pas répondre pour le moment. ${error.message}` },
          ]);
        },
      },
    );
  };

  const clearConversation = () => setMessages([welcomeMessage]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="fixed bottom-5 right-5 z-40 h-12 gap-2 rounded-full px-4 shadow-lg"
          aria-label="Ouvrir l’assistant IA"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Assistant IA</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </span>
            Assistant de l’application
          </DialogTitle>
          <Button type="button" variant="ghost" size="sm" onClick={clearConversation}>
            <X className="mr-2 h-4 w-4" /> Nouvelle conversation
          </Button>
        </DialogHeader>
        <AIChatBox
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={askMutation.isPending}
          height="min(70vh, 620px)"
          placeholder="Posez une question sur l’utilisation de l’application…"
          emptyStateMessage="Posez une question sur votre espace associatif"
          suggestedPrompts={suggestedPrompts}
          onAction={(path) => { setOpen(false); setLocation(path); }}
          className="rounded-none border-0 shadow-none"
        />
      </DialogContent>
    </Dialog>
  );
}
