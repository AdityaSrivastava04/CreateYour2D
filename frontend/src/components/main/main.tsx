import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const ChatArea: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    // Add user message
    setMessages((prev) => [...prev, newMessage]);

    // Clear input
    setInput('');

    // Dummy assistant reply (replace with your API call)
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `You said: ${trimmed}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 600);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col  bg-gray-950">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 ">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xl rounded-2xl px-4 py-3 text-sm shadow 
              ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-100 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {msg.content}
              </div>
              <div className="mt-1 text-[10px] text-gray-300 text-right">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area fixed at bottom */}
      <div className="border-t border-gray-800 bg-gray-900 pt-3  ">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your prompt here..."
            className="flex-1 rounded-xl bg-gray-800 text-gray-100 px-4 py-3 text-sm 
              outline-none border border-gray-700 focus:border-blue-500 
              focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium
              disabled:bg-gray-600 disabled:cursor-not-allowed
              hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
