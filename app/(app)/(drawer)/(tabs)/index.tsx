import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useQuery, useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import DrawerButton from '@/components/ui/DrawerButton';
import Header from '@/components/ui/Header';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import { withOpacity } from '@/lib/unistyles';

type Model = {
  _id: Id<'models'>;
  _creationTime: number;
  name: string;
  provider: string;
  modelId: string;
  costPerToken: number;
  maxTokens: number;
  isActive: boolean;
};

type Conversation = {
  _id: Id<'conversations'>;
  _creationTime: number;
  userId: Id<'users'>;
  title: string;
  modelId: Id<'models'>;
  updatedAt: number;
  model: {
    _id: Id<'models'>;
    name: string;
    provider: string;
  } | null;
};

export default function ConversationsScreen() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const conversations = useQuery(api.conversations.list, { limit: 50 });
  const models = useQuery(api.queries.getModels);
  const credits = useQuery(api.queries.getUserCredits);
  const createConversation = useMutation(api.conversations.create);

  const handleNewConversation = () => {
    if (models && models.length > 0) {
      setSelectedModel(models[0]);
      setShowModelPicker(true);
    }
  };

  const handleCreateConversation = async () => {
    if (!selectedModel) return;

    setIsCreating(true);
    try {
      const id = await createConversation({ modelId: selectedModel._id });
      setShowModelPicker(false);
      router.push(`/(drawer)/(tabs)/chat/${id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleConversationPress = (conversationId: Id<'conversations'>) => {
    router.push(`/(drawer)/(tabs)/chat/${conversationId}`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatCredits = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`;
    return amount.toString();
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <Pressable
      style={({ pressed }) => [styles.conversationItem, pressed && styles.conversationItemPressed]}
      onPress={() => handleConversationPress(item._id)}>
      <View style={styles.conversationIcon}>
        <Icon name="MessageCircle" size={20} color={theme.colors.highlight} />
      </View>
      <View style={styles.conversationContent}>
        <ThemedText style={styles.conversationTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <View style={styles.conversationMeta}>
          <ThemedText style={styles.conversationModel}>
            {item.model?.name || 'Unknown model'}
          </ThemedText>
          <ThemedText style={styles.conversationDate}>{formatDate(item.updatedAt)}</ThemedText>
        </View>
      </View>
      <Icon name="ChevronRight" size={18} color={theme.colors.subtext} />
    </Pressable>
  );

  const renderModelItem = (model: Model) => (
    <Pressable
      key={model._id}
      style={[styles.modelItem, selectedModel?._id === model._id && styles.modelItemSelected]}
      onPress={() => setSelectedModel(model)}>
      <View style={styles.modelInfo}>
        <ThemedText style={styles.modelName}>{model.name}</ThemedText>
        <ThemedText style={styles.modelProvider}>{model.provider}</ThemedText>
      </View>
      <View style={styles.modelCost}>
        <ThemedText style={styles.modelCostText}>{model.costPerToken} credits/token</ThemedText>
      </View>
      {selectedModel?._id === model._id && (
        <Icon name="Check" size={20} color={theme.colors.highlight} />
      )}
    </Pressable>
  );

  const leftComponent = [
    <DrawerButton key="drawer-button" />,
    <ThemedText key="app-title" style={styles.appTitle}>
      Luna<Text style={styles.appTitleDot}>.</Text>
    </ThemedText>,
  ];

  const rightComponents = [
    <View key="credits" style={styles.creditsContainer}>
      <Icon name="Coins" size={16} color={theme.colors.highlight} />
      <ThemedText style={styles.creditsText}>
        {credits !== undefined ? formatCredits(credits) : '...'}
      </ThemedText>
    </View>,
  ];

  return (
    <View style={styles.container}>
      <Header title="" leftComponent={leftComponent} rightComponents={rightComponents} />

      {conversations === undefined ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.highlight} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Icon name="MessageSquarePlus" size={48} color={theme.colors.subtext} />
          </View>
          <ThemedText style={styles.emptyTitle}>No conversations yet</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Start a new conversation to begin chatting with AI
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable style={styles.fab} onPress={handleNewConversation}>
        <Icon name="Plus" size={24} color="white" />
      </Pressable>

      <Modal
        visible={showModelPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModelPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Model</ThemedText>
              <Pressable onPress={() => setShowModelPicker(false)} style={styles.modalClose}>
                <Icon name="X" size={24} />
              </Pressable>
            </View>

            <View style={styles.modelList}>{models?.map(renderModelItem)}</View>

            <Pressable
              style={[styles.createButton, isCreating && styles.createButtonDisabled]}
              onPress={handleCreateConversation}
              disabled={isCreating || !selectedModel}>
              {isCreating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <ThemedText style={styles.createButtonText}>Start Conversation</ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  appTitle: {
    marginLeft: 16,
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
  },
  appTitleDot: {
    color: theme.colors.highlight,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: withOpacity(theme.colors.highlight, 0.1),
  },
  creditsText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.highlight,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: withOpacity(theme.colors.subtext, 0.1),
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    borderCurve: 'continuous',
  },
  conversationItemPressed: {
    backgroundColor: withOpacity(theme.colors.secondary, 0.7),
  },
  conversationIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(theme.colors.highlight, 0.1),
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conversationModel: {
    fontSize: 12,
    color: theme.colors.highlight,
    fontWeight: '500',
  },
  conversationDate: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: withOpacity('black', 0.5),
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderCurve: 'continuous',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalClose: {
    padding: 4,
  },
  modelList: {
    gap: 8,
    marginBottom: 20,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderColor: 'transparent',
    borderCurve: 'continuous',
  },
  modelItemSelected: {
    borderColor: theme.colors.highlight,
    backgroundColor: withOpacity(theme.colors.highlight, 0.1),
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modelProvider: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  modelCost: {
    marginRight: 12,
  },
  modelCostText: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  createButton: {
    backgroundColor: theme.colors.highlight,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
}));
