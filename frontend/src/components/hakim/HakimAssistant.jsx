import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';

const HAKIM_AVATAR = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/bfdsnfxc_Hakim%20Character%20Examples%20and%20Referance%2001.avif';

export const HakimAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'مرحباً! أنا حكيم، مساعدك الذكي في منصة نَسَّق. كيف يمكنني مساعدتك اليوم؟',
      suggestions: ['تعرف على النظام', 'إدارة المدارس', 'إدارة المستخدمين'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { api, user } = useAuth();
  const { isRTL } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/hakim/chat', {
        message: text,
        context: null,
        user_role: user?.role,
        tenant_id: user?.tenant_id,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        suggestions: response.data.suggestions || [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Hakim error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
          suggestions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        data-testid="hakim-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 z-50 w-14 h-14 rounded-full shadow-lg
          bg-brand-purple hover:bg-brand-purple-light
          transition-all duration-300 hover:scale-110
          ${isRTL ? 'left-6' : 'right-6'}
        `}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Sparkles className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card
          data-testid="hakim-chat-window"
          className={`
            fixed bottom-24 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)]
            rounded-2xl shadow-2xl border-brand-purple/20 overflow-hidden
            animate-fade-up
            ${isRTL ? 'left-6' : 'right-6'}
          `}
        >
          {/* Header */}
          <div className="bg-brand-purple p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 overflow-hidden flex-shrink-0">
              <img
                src={HAKIM_AVATAR}
                alt="حكيم"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-cairo font-bold text-white">حكيم</h3>
              <p className="text-white/70 text-sm">المساعد الذكي</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 h-[340px] p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-brand-purple/10 overflow-hidden flex-shrink-0">
                      <img
                        src={HAKIM_AVATAR}
                        alt="حكيم"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-brand-navy text-white'
                        : 'bg-muted'
                    } rounded-2xl px-4 py-3`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs bg-brand-turquoise/10 text-brand-turquoise hover:bg-brand-turquoise/20 rounded-lg px-3 py-1.5 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-purple/10 overflow-hidden flex-shrink-0">
                    <img
                      src={HAKIM_AVATAR}
                      alt="حكيم"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-purple" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                data-testid="hakim-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRTL ? 'اكتب رسالتك...' : 'Type your message...'}
                className="flex-1 rounded-xl"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="bg-brand-purple hover:bg-brand-purple-light rounded-xl"
                data-testid="hakim-send-btn"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
};
