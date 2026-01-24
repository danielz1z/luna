import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

import type { Id } from '@/convex/_generated/dataModel';

interface ChatContextValue {
  conversationId: Id<'conversations'> | null;
  setConversationId: (id: Id<'conversations'> | null) => void;
  onSelectConversation: (id: Id<'conversations'>) => void;
  onNewChat: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversationId, setConversationId] = useState<Id<'conversations'> | null>(null);

  const onSelectConversation = useCallback((id: Id<'conversations'>) => {
    setConversationId(id);
  }, []);

  const onNewChat = useCallback(() => {
    setConversationId(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{ conversationId, setConversationId, onSelectConversation, onNewChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}
