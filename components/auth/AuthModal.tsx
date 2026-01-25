import { Modal, View, TouchableOpacity, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useAuthModal } from '@/app/contexts/AuthModalContext';
import SignInWith from './SignInWith';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';

export default function AuthModal() {
  const { isAuthModalVisible, hideAuthModal } = useAuthModal();

  return (
    <Modal
      visible={isAuthModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={hideAuthModal}>
      <Pressable style={styles.overlay} onPress={hideAuthModal}>
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <TouchableOpacity style={styles.closeButton} onPress={hideAuthModal}>
            <Icon name="X" size={24} />
          </TouchableOpacity>

          <ThemedText style={styles.title}>Sign in to continue</ThemedText>

          <SignInWith strategy="oauth_google" onSuccess={hideAuthModal} />
          <SignInWith strategy="oauth_apple" onSuccess={hideAuthModal} />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.bg,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
}));
