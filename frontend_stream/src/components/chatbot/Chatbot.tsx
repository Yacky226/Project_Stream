import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import {
  closeChatbot,
  startNewSession,
  addUserMessage,
  addAssistantMessage,
  setTyping,
  clearCurrentSession
} from '../../store/slices/chatbotSlice';
import { getChatbotResponseAsync } from '../../lib/chatbotService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { X, Bot, Sparkles, RotateCcw, Settings, Zap } from 'lucide-react';

interface ChatbotProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

export function Chatbot({ onNavigate, currentPath }: ChatbotProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const chatbotState = useAppSelector(state => state.chatbot);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Safety check: if chatbot state is not initialized, don't render
  if (!chatbotState) {
    return null;
  }

  const { isOpen, currentSession, isTyping, quickActions } = chatbotState;

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages, isTyping]);

  // Initialiser une session si pas de session courante et chatbot ouvert
  useEffect(() => {
    if (isOpen && !currentSession && user) {
      dispatch(startNewSession({
        userId: user.id,
        userRole: user.role,
        currentPage: currentPath
      }));
    }
  }, [isOpen, currentSession, user, currentPath, dispatch]);

  const handleSendMessage = async (message: string) => {
    if (!currentSession || !user) return;

    // Ajouter le message utilisateur
    dispatch(addUserMessage(message));
    dispatch(setTyping(true));

    try {
      // Obtenir la réponse du chatbot
      const response = await getChatbotResponseAsync(message, {
        userRole: user.role,
        currentPage: currentPath,
        userName: user.firstName
      });

      // Ajouter la réponse
      dispatch(addAssistantMessage(response.message));

      // Gérer les actions si nécessaire
      if (response.action && onNavigate) {
        if (response.action.type === 'navigate') {
          setTimeout(() => {
            onNavigate(response.action!.payload);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Erreur chatbot:', error);
      dispatch(addAssistantMessage('Désolé, une erreur est survenue. Pouvez-vous réessayer ?'));
    } finally {
      dispatch(setTyping(false));
    }
  };

  const handleQuickAction = (actionLabel: string) => {
    handleSendMessage(actionLabel);
  };

  const handleRestart = () => {
    if (user) {
      dispatch(clearCurrentSession());
      dispatch(startNewSession({
        userId: user.id,
        userRole: user.role,
        currentPage: currentPath
      }));
    }
  };

  const handleClose = () => {
    dispatch(closeChatbot());
  };

  if (!isOpen) return null;

  const filteredQuickActions = quickActions.filter(action => 
    !action.roles || action.roles.includes(user?.role || 'student')
  );

  return (
    <div className="fixed bottom-4 right-4 z-[9998] w-[90vw] sm:w-[420px] lg:w-[460px] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <Card className="shadow-2xl border-2 overflow-hidden backdrop-blur-xl bg-card/95">
        {/* Header avec gradient amélioré */}
        <CardHeader className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white p-5 rounded-t-lg overflow-hidden">
          {/* Effet de fond animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar amélioré avec animation */}
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white">Assistant IA</CardTitle>
                  <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400/50" />
                  <span className="text-white/90">En ligne • Réponse instantanée</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRestart}
                className="h-9 w-9 text-white hover:bg-white/20 rounded-xl transition-all"
                aria-label="Nouvelle conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-9 w-9 text-white hover:bg-white/20 hover:rotate-90 rounded-xl transition-all duration-300"
                aria-label="Fermer le chat"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Badge indicateur */}
          <div className="relative mt-3 flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Zap className="h-3 w-3 mr-1" />
              Propulsé par IA
            </Badge>
            <span className="text-white/70">• {currentSession?.messages.length || 0} messages</span>
          </div>
        </CardHeader>

        {/* Corps du chat avec style amélioré */}
        <CardContent className="p-0 bg-gradient-to-b from-background to-muted/30">
          {/* Zone de messages */}
          <ScrollArea ref={scrollAreaRef} className="h-[400px] px-4 py-4">
            {!currentSession || currentSession.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-8">
                <div className="relative">
                  <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                    <Bot className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
                </div>
                
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-foreground">
                    Bonjour ! Je suis votre assistant IA 👋
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Je peux vous aider avec vos cours, répondre à vos questions sur la plateforme, 
                    ou vous guider dans votre apprentissage.
                  </p>
                </div>

                {/* Actions rapides stylisées */}
                <div className="mt-6 pt-4 border-t w-full">
                  <p className="text-muted-foreground mb-3">
                    Questions fréquentes :
                  </p>
                  <div className="grid gap-2">
                    {filteredQuickActions.slice(0, 3).map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action.label)}
                        className="justify-start text-left hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all group"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-2 opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all" />
                        <span className="truncate">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentSession?.messages.map((msg, index) => (
                  <ChatMessage key={index} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input zone avec style amélioré */}
          <div className="border-t bg-background/50 backdrop-blur-sm p-4">
            <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={isTyping || !currentSession}
              placeholder="Posez votre question..."
            />
            
            {/* Footer info */}
            <div className="flex items-center justify-between mt-3 px-1">
              <p className="text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                IA peut faire des erreurs
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 hover:text-primary"
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Paramètres
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}