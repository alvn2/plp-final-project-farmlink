import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const EXAMPLES = [
  'How do I prevent maize diseases?',
  'What is the best time to plant beans?',
  'How often should I water tomatoes?',
  'What fertilizer is good for Sukuma Wiki?',
];

const ChatBox = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/ai-chat', { message: msg });
      setMessages((prev) => [...prev, { role: 'ai', content: res.data.answer }]);
    } catch (err) {
      setError('AI is unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div>
      {/* Floating Button */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-primary-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl hover:bg-primary-700 focus:outline-none"
          onClick={() => setOpen(true)}
          aria-label="Open AI Chat"
        >
          <i className="fas fa-comments"></i>
        </button>
      )}
      {/* Chat Box */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[95vw] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl flex flex-col h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 bg-primary-600 rounded-t-xl">
            <span className="text-white font-bold text-lg flex items-center">
              <i className="fas fa-robot mr-2"></i> Ask FarmLink AI
            </span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200 text-xl focus:outline-none">
              <i className="fas fa-times"></i>
            </button>
          </div>
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm">
                <div className="mb-2">Try asking:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200 px-3 py-1 rounded-full text-xs hover:bg-primary-200 dark:hover:bg-primary-800"
                      onClick={() => sendMessage(ex)}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-line ${msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-800 text-gray-500 px-3 py-2 rounded-lg text-sm animate-pulse">
                  FarmLink AI is typing...
                </div>
              </div>
            )}
            {error && (
              <div className="text-center text-red-500 text-xs mt-2">{error}</div>
            )}
            <div ref={chatEndRef} />
          </div>
          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center gap-2">
            <input
              type="text"
              className="flex-1 input-field dark:bg-gray-800 dark:text-white dark:border-gray-700"
              placeholder="Ask a question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              maxLength={300}
              autoFocus
            />
            <button
              type="submit"
              className="btn-primary px-4 py-2 disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBox; 