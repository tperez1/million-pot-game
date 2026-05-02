import { useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, ChevronDown, ChevronUp, Minimize2, Maximize2, Trash2, MessageCircle } from 'lucide-react';
import { useGameStore, MillyMood } from '../store/gameStore';
import { useMilly } from '../hooks/useMilly';

const SUGGESTIONS = [
  'How do I win?',
  'What if it goes over $1M?',
  'How do refunds work?',
  'Who built this?'
];

const MOOD_LABELS: Record<MillyMood, { label: string; color: string }> = {
  calm: { label: 'Calm', color: 'text-blue-400' },
  close: { label: 'Close', color: 'text-orange-400' },
  danger: { label: 'Danger', color: 'text-red-400' }
};

export function MillyAgent() {
  const {
    millyCollapsed, millyCompact, millyHasUnread,
    setMillyCollapsed, setMillyCompact, clearMillyMessages
  } = useGameStore();
  
  const { messages, inputValue, setInputValue, mood, dynamicMessage, isLoading, sendMessage } = useMilly();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const moodInfo = MOOD_LABELS[mood];
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };
  
  const toggleCollapse = () => {
    setMillyCollapsed(!millyCollapsed);
  };
  
  const toggleCompact = () => {
    setMillyCompact(!millyCompact);
  };
  
  const handleClearChat = () => {
    clearMillyMessages();
  };
  
  const latestMillyMessage = messages.filter(m => m.role === 'milly').slice(-1)[0];
  
  // Collapsed view - minimal header bar
  if (millyCollapsed) {
    return (
      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={toggleCollapse}
          className="w-full glass rounded-xl p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              {millyHasUnread && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[var(--bg)]" />
              )}
            </div>
            <div className="text-left">
              <p className="font-display font-medium text-sm">Milly</p>
              <p className="text-xs text-[var(--muted)]">{dynamicMessage.slice(0, 40)}...</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-xs ${moodInfo.color}`}>{moodInfo.label}</span>
            <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
          </div>
        </button>
      </div>
    );
  }
  
  // Compact view - latest message only
  if (millyCompact) {
    return (
      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="glass rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-display font-medium text-sm">Milly</p>
                <span className={`text-xs ${moodInfo.color}`}>{moodInfo.label}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={toggleCompact}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="Expand chat"
              >
                <Maximize2 className="w-4 h-4 text-[var(--muted)]" />
              </button>
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="Minimize"
              >
                <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
              </button>
            </div>
          </div>
          
          {/* Latest message only */}
          <div className="p-3">
            <div className="flex items-start gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--text)]">{dynamicMessage}</p>
            </div>
            
            {latestMillyMessage && (
              <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <p className="text-sm">{latestMillyMessage.content}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Full view
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="glass rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm">Milly</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">AI Game Master</span>
                <span className={`text-xs ${moodInfo.color}`}>• {moodInfo.label}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={toggleCompact}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Compact mode"
            >
              <Minimize2 className="w-4 h-4 text-[var(--muted)]" />
            </button>
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Collapse"
            >
              <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
            </button>
          </div>
        </div>
        
        {/* Dynamic Message */}
        <div className="px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--text)]">{dynamicMessage}</p>
          </div>
        </div>
        
        {/* Chat - Fixed height with scroll */}
        <div className="h-40 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <MessageCircle className="w-8 h-8 text-[var(--muted)] mb-2 opacity-50" />
              <p className="text-sm text-[var(--muted)]">Ask Milly anything!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[var(--accent)] text-black'
                      : 'bg-[var(--surface)] border border-[var(--border)]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--muted)]">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Suggestions */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-violet-500/50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
        
        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 pt-2 border-t border-[var(--border)]">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Milly..."
              className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* Clear chat button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearChat}
              className="mt-2 text-xs text-[var(--muted)] hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear chat
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
