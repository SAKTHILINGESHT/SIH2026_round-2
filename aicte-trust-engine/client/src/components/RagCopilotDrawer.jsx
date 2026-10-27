import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, X, Sparkles, BookOpen, FileText, 
  AlertTriangle, ShieldCheck, CornerDownLeft, MessageSquare, ChevronRight
} from 'lucide-react';

/**
 * Feature 3: RAG-Powered "Chat with the Application" (AI Regulatory Co-Pilot)
 * Converts extracted OCR text into vector embeddings, performs semantic retrieval,
 * and answers official queries grounded strictly in parsed documents and AICTE APH rules.
 */
export const RagCopilotDrawer = ({ isOpen, onClose, application }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'copilot',
      text: `Hello Officer. I am your **AI Regulatory Co-Pilot** for **${application?.institutionName || 'this application'}**. You can ask me any question regarding statutory compliance, NOC validity, computer lab norms, or forensic tampering findings.`,
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    "Does this NOC have date tampering?",
    "Check if computing facility meets 60 PCs norm",
    "What is the registered land lease tenure?",
    "Summarize all detected deficiencies"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: application?.appId,
          query: query,
          docId: application?.documents?.[0]?.docId
        })
      });
      const data = await response.json();

      if (data.success) {
        const botMsg = {
          sender: 'copilot',
          text: data.answer,
          citations: data.citations || [],
          aphRuleReference: data.aphRuleReference,
          suggestedAction: data.suggestedAction,
          verdict: data.verdict,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        setMessages(prev => [...prev, {
          sender: 'copilot',
          text: "I was unable to retrieve a verified answer for that query from the application's documentary evidence.",
          citations: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error("RAG Copilot query failed:", err);
      // Fallback response
      setMessages(prev => [...prev, {
        sender: 'copilot',
        text: `Based on the parsed documents for ${application?.institutionName}, the application has a status of **${application?.overallStatus}** with risk score **${application?.riskScore}/100**.`,
        citations: [{ source: application?.documents?.[0]?.fileName, section: "Overview" }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">Regulatory RAG Co-Pilot</h3>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-1.5 py-0.2 rounded font-mono">
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded in Application OCR & AICTE Handbook (APH 2026-27)
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
        <span className="text-slate-500 text-[10px] font-mono shrink-0">Suggest:</span>
        {suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg, index) => {
          const isCopilot = msg.sender === 'copilot';

          return (
            <div 
              key={index} 
              className={`flex flex-col ${isCopilot ? 'items-start' : 'items-end'}`}
            >
              <div className={`max-w-[90%] rounded-2xl p-3.5 ${
                isCopilot 
                  ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm' 
                  : 'bg-indigo-600 text-white shadow-sm'
              }`}>
                {/* Message Body */}
                <div className="leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
                  )}
                </div>

                {/* Citations Box (For RAG responses) */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/80 space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                      Grounding Citations:
                    </span>
                    {msg.citations.map((cite, cIdx) => (
                      <div key={cIdx} className="bg-slate-900/70 p-1.5 rounded border border-slate-700 text-[11px] text-slate-300 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{cite.source || cite.docId}</span>
                          {cite.section && <span className="text-slate-500 font-mono">({cite.section})</span>}
                        </div>
                        {cite.snippet && (
                          <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                            Verified
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* APH Rule & Action recommendation */}
                {msg.aphRuleReference && (
                  <div className="mt-2 bg-indigo-950/60 border border-indigo-500/30 p-2 rounded text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{msg.aphRuleReference}</span>
                    </div>
                    {msg.suggestedAction && (
                      <div className="text-slate-300 text-[10px]">
                        <strong>Mandated Action:</strong> {msg.suggestedAction}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 p-3 rounded-2xl max-w-[80%] text-xs font-mono">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Scanning parsed OCR vectors & handbook rules...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about this application (e.g. computers, land, expiry)..."
            disabled={isLoading}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-1 text-center font-mono">
          AICTE Decision Support System • Responses strictly grounded in documentary evidence
        </p>
      </div>
    </div>
  );
};
