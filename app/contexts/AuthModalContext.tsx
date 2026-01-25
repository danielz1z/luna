import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthModalContextValue {
  isAuthModalVisible: boolean;
  showAuthModal: () => void;
  hideAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  // Idempotent: calling when already visible is a no-op
  const showAuthModal = useCallback(() => {
    setIsAuthModalVisible(true);
  }, []);

  const hideAuthModal = useCallback(() => {
    setIsAuthModalVisible(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isAuthModalVisible, showAuthModal, hideAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);

  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }

  return context;
}

export default AuthModalProvider;
