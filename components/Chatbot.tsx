"use client";

import { useState, useEffect, useRef } from "react";
import { type WorkflowZone } from "./Sidebar";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  currentZone: WorkflowZone;
}

const STANDARDS = {
  prion: "Le standard pour un cycle Prion est de 134°C à 2.1 bars pendant 18 minutes.",
  bpph: "Les Bonnes Pratiques de Pharmacie Hospitalière (BPPH) imposent une traçabilité complète de chaque dispositif médical.",
  afnor: "Les normes AFNOR (notamment NF EN ISO 17665) encadrent la validation et le contrôle de routine de la stérilisation à la vapeur d'eau.",
};

const TROUBLESHOOTING = {
  non_conformity: "Traitement des non-conformités : Isolez la boîte, étiquetez-la comme 'non-stérile', et recommencez la phase de lavage.",
  scellé_casse: "Si un scellé est cassé, le dispositif doit être considéré comme non-stérile et renvoyé en zone de lavage.",
  humidite: "En cas d'humidité résiduelle dans l'emballage, la charge est non-conforme. Refaire le conditionnement et la stérilisation.",
};

const LOCATIONS: Record<string, string> = {
  "BOITE-ORTHO-001": "Rayonnage B / Étage 03",
  "BOITE-ORTHO-005": "Rayonnage A / Étage 02",
  "CONTENEUR-A1": "Zone de Lavage - Poste 2",
};

export function Chatbot({ currentZone }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting based on zone
  useEffect(() => {
    const greetings: Record<WorkflowZone, string> = {
      "zone-sale": "Bonjour ! Je suis votre superviseur en Zone Sale. N'oubliez pas de vérifier l'intégrité des instruments avant la prédésinfection.",
      "zone-propre": "Bonjour ! Je suis votre superviseur en Zone Propre. Assurez-vous que les instruments sont parfaitement secs avant l'emballage.",
      "zone-sterile": "Bonjour ! Je suis votre superviseur en Zone Stérile. Vérifiez bien l'intégrité des emballages lors du déchargement.",
      "liaison": "Bonjour ! Prêt pour la liaison patient. Scannez d'abord le bracelet du patient.",
      "dashboard": "Bonjour ! Je suis votre assistant de stérilisation. Comment puis-je vous aider aujourd'hui ?",
      "maintenance": "Mode maintenance activé. Consultez les protocoles de vérification des autoclaves.",
      "edition": "Mode édition. Besoin d'aide pour générer un rapport ?",
    };

    setMessages([
      {
        id: "1",
        role: "assistant",
        content: greetings[currentZone] || "Bonjour ! Comment puis-je vous aider ?",
        timestamp: new Date(),
      },
    ]);
  }, [currentZone]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      let responseContent = "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ?";
      const lowerInput = inputValue.toLowerCase();

      if (lowerInput.includes("prion") || lowerInput.includes("paramètre")) {
        responseContent = STANDARDS.prion;
      } else if (lowerInput.includes("bpph") || lowerInput.includes("afnor")) {
        responseContent = `${STANDARDS.bpph} ${STANDARDS.afnor}`;
      } else if (lowerInput.includes("non-conforme") || lowerInput.includes("erreur")) {
        responseContent = TROUBLESHOOTING.non_conformity;
      } else if (lowerInput.includes("où est") || lowerInput.includes("localisation") || lowerInput.includes("boite")) {
        const foundBox = Object.keys(LOCATIONS).find(key => lowerInput.includes(key.toLowerCase()) || lowerInput.includes(key.split('-')[1].toLowerCase()));
        if (foundBox) {
          responseContent = `Le dispositif ${foundBox} est situé à l'emplacement : ${LOCATIONS[foundBox]}. Je l'ai mis en évidence sur votre plan.`;
          // In a real app, we would trigger a global event or state update here
          console.log(`ACTION: Highlight location for ${foundBox}`);
        } else if (lowerInput.includes("ortho") && lowerInput.includes("5")) {
           responseContent = `Le dispositif BOITE-ORTHO-005 est situé à l'emplacement : ${LOCATIONS["BOITE-ORTHO-005"]}. Je l'ai mis en évidence sur votre plan.`;
        } else {
          responseContent = "Je ne trouve pas ce dispositif dans l'inventaire actuel.";
        }
      } else if (lowerInput.includes("conseil") || lowerInput.includes("aide")) {
        if (currentZone === "zone-sale") responseContent = "En zone sale, portez toujours vos EPI et respectez le temps de trempage de 15 minutes.";
        if (currentZone === "zone-propre") responseContent = "En zone propre, le contrôle visuel à la loupe est obligatoire pour les instruments complexes.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-app">
      {/* Chat window */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[500px] bg-white rounded-3xl border border-[#d5e2ea] shadow-[0_24px_60px_rgba(11,72,103,0.25)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-[#0b4867] p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#1378ac] flex items-center justify-center text-xl border-2 border-white/20 shadow-inner">🤖</div>
              <div>
                <p className="text-sm font-bold tracking-tight">Superviseur IA</p>
                <p className="text-[10px] text-[#8de7da] font-medium uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#11b5a2] animate-pulse"></span> En ligne
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f8fbfd]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  msg.role === "user" 
                    ? "bg-[#1378ac] text-white rounded-tr-none shadow-md" 
                    : "bg-white text-slate-700 border border-[#d5e2ea] rounded-tl-none shadow-sm"
                }`}>
                  {msg.content}
                  <p className={`text-[9px] mt-1 opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-[#d5e2ea]">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Posez une question (Prion, aide...)"
                className="flex-1 bg-[#f4f8fb] border border-[#d5e2ea] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#1378ac] transition-colors"
              />
              <button 
                onClick={handleSendMessage}
                className="h-10 w-10 rounded-xl bg-[#1378ac] text-white flex items-center justify-center hover:bg-[#0b4867] transition-all shadow-md active:scale-95"
              >
                <span className="text-lg">➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 group ${
          isOpen ? "bg-white text-[#0b4867] border border-[#d5e2ea]" : "bg-[#0b4867] text-white"
        }`}
      >
        {isOpen ? "💬" : "🤖"}
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#11b5a2] rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
          1
        </span>
      </button>
    </div>
  );
}
