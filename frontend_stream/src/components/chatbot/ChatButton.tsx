import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleChatbot } from '../../store/slices/chatbotSlice';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { cn } from '../ui/utils';

export function ChatButton() {
  const dispatch = useAppDispatch();
  const chatbotState = useAppSelector(state => state.chatbot);

  // Safety check: if chatbot state is not initialized, don't render
  if (!chatbotState) {
    return null;
  }

  const { isOpen, currentSession } = chatbotState;

  // Compter les messages non lus (simulation - peut être étendu)
  const unreadCount = 0;

  const handleToggle = () => {
    dispatch(toggleChatbot());
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <Button
        onClick={handleToggle}
        size="lg"
        className={cn(
          "h-16 w-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group relative overflow-hidden",
          isOpen 
            ? "bg-destructive hover:bg-destructive/90" 
            : "bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700"
        )}
        aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {/* Effet de brillance animé */}
        {!isOpen && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
        
        <div className="relative z-10">
          {isOpen ? (
            <X className="h-7 w-7 text-white" />
          ) : (
            <>
              <MessageCircle className="h-7 w-7 text-white transition-transform group-hover:rotate-12" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-3 -right-3 h-6 w-6 p-0 flex items-center justify-center shadow-lg animate-bounce"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </>
          )}
          
          {/* Pulse animation quand fermé */}
          {!isOpen && (
            <>
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
              <span className="absolute inset-0 rounded-full bg-purple-500 animate-pulse opacity-20" />
            </>
          )}
        </div>
      </Button>

      {/* Tooltip hint pour première utilisation - amélioré */}
      {!isOpen && !currentSession && (
        <div className="absolute bottom-full right-0 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 text-white px-4 py-3 rounded-2xl shadow-xl border border-white/20 max-w-[220px] backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <p className="leading-snug">Besoin d{'\''}aide ?</p>
                <p className="text-white/90 mt-0.5 leading-snug">
                  Je peux répondre à vos questions
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-gradient-to-br from-blue-600 to-purple-600 border-r border-b border-white/20" />
          </div>
        </div>
      )}
    </div>
  );
}