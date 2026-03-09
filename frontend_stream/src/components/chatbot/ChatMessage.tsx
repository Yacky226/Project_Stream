import { ChatMessage as ChatMessageType } from '../../types/chatbot';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  userName?: string;
}

export function ChatMessage({ message, userName }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn(
      "flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
        )}>
          {isUser ? (
            userName ? userName[0].toUpperCase() : <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-sm" 
            : "bg-muted rounded-bl-sm"
        )}>
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
      </div>
    </div>
  );
}
