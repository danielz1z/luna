import React, { useState } from 'react';
import { View, Pressable, Modal, ScrollView, Keyboard, Alert, Text, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from './Button';
import Icon, { IconName } from './Icon';
import ThemedText from './ThemedText';
import Input from '../forms/Input';

import { useUnistyles } from 'react-native-unistyles';
import { palette, withOpacity } from '@/lib/unistyles';

interface ProductVariantCreatorProps {
  hasStock?: boolean;
}

interface Option {
  name: string;
  values: string[];
}

interface Variant extends Record<string, string | null> {
  price: string;
  stock: string;
  image: null;
}

const ProductVariantCreator: React.FC<ProductVariantCreatorProps> = ({ hasStock }) => {
  const { theme } = useUnistyles();
  const isDark = theme.isDark;
  const [options, setOptions] = useState<Option[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOption, setCurrentOption] = useState<Option>({ name: '', values: [''] });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addOption = () => {
    if (options.length < 3) {
      setModalVisible(true);
      setCurrentOption({ name: '', values: [''] });
      setEditingIndex(null);
    }
  };

  const editOption = (index: number) => {
    setCurrentOption(options[index]);
    setEditingIndex(index);
    setModalVisible(true);
  };

  const handleSaveOption = () => {
    const trimmedValues = currentOption.values.filter((v) => v.trim());

    if (!currentOption.name.trim()) {
      Alert.alert('Missing Option Name', 'Please enter an option name before saving.');
      return;
    }

    if (trimmedValues.length === 0) {
      Alert.alert('Missing Values', 'Please enter at least one value before saving.');
      return;
    }

    const updatedOptions = [...options];
    if (editingIndex !== null) {
      updatedOptions[editingIndex] = { ...currentOption, values: trimmedValues };
    } else {
      updatedOptions.push({ ...currentOption, values: trimmedValues });
    }

    setOptions(updatedOptions);
    setModalVisible(false);
    generateVariants(updatedOptions);
  };

  const addValue = () => {
    // Adds a new empty value to the current option values
    setCurrentOption((prevOption) => ({
      ...prevOption,
      values: [...prevOption.values, ''],
    }));
  };
  const deleteOption = () => {
    if (editingIndex === null) return;
    const updatedOptions = [...options];
    updatedOptions.splice(editingIndex, 1); // Removes the option at the index being edited
    setOptions(updatedOptions);
    setModalVisible(false);
    generateVariants(updatedOptions); // Update variants after deleting an option
  };

  const removeValue = (index: number) => {
    const updatedValues = [...currentOption.values];
    updatedValues.splice(index, 1);
    setCurrentOption({ ...currentOption, values: updatedValues.length ? updatedValues : [''] });
  };

  const generateVariants = (updatedOptions: Option[]) => {
    const combinations = updatedOptions.reduce((acc: Record<string, string>[], option) => {
      if (acc.length === 0) return option.values.map((v) => ({ [option.name]: v }));
      return acc.flatMap((prev) =>
        option.values.map((value) => ({ ...prev, [option.name]: value }))
      );
    }, []);
    setVariants(combinations.map((variant) => ({ ...variant, price: '', stock: '', image: null })));
  };

  return (
    <>
      <View style={[styles.optionsContainer, options.length > 0 && styles.optionsContainerBorder]}>
        {options.map((option, index) => (
          <Pressable onPress={() => editOption(index)} key={index} style={styles.optionRow}>
            <View style={styles.optionRowHeader}>
              <ThemedText style={styles.optionTitle}>{option.name}</ThemedText>
              <View style={styles.optionEditIconWrapper}>
                <Icon name="Edit" size={20} />
              </View>
            </View>
            <View style={styles.optionValuesRow}>
              {option.values.map((value, i) => (
                <View
                  key={i}
                  style={[styles.valueTag, isDark ? styles.valueTagDark : styles.valueTagLight]}>
                  <ThemedText style={styles.valueTagText}>{value}</ThemedText>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
      </View>
      {options.length < 3 ? (
        <Pressable
          onPress={addOption} // Calls addValue to add a new empty input
          style={styles.addOptionButton}>
          <Icon name="Plus" size={20} />
          <Text style={[styles.addOptionText, { color: theme.colors.text }]}>Add option </Text>
        </Pressable>
      ) : (
        <View style={styles.addOptionButtonDisabled}>
          <Text
            style={[
              styles.addOptionText,
              styles.addOptionTextDisabled,
              { color: isDark ? theme.colors.text : palette.neutral400 },
            ]}>
            You&apos;ve reached 3 options limit
          </Text>
        </View>
      )}

      {variants.length > 0 && (
        <View style={styles.variantsSection}>
          <Text style={[styles.variantsTitle, { color: theme.colors.text }]}>Variants</Text>
          {variants.map((variant, index) => (
            <View key={index} style={styles.variantCard}>
              <View style={styles.variantRow}>
                <Text style={[styles.variantLabel, { color: theme.colors.text }]}>
                  {Object.values(variant).slice(0, -3).join(' / ')}
                </Text>
                <View style={styles.variantInputsRow}>
                  <View style={styles.priceInputWrapper}>
                    <Input
                      label="Price"
                      containerClassName="mb-0"
                      //placeholder="Price"
                      keyboardType="numeric"
                      value={variant.price}
                      onChangeText={(text: string) => {
                        const updatedVariants = [...variants];
                        updatedVariants[index].price = text;
                        setVariants(updatedVariants);
                      }}
                    />
                  </View>
                  {hasStock && (
                    <Input
                      label="Stock"
                      containerClassName="mb-0 w-20 ml-2"
                      //placeholder="Stock"
                      keyboardType="numeric"
                      //value={variant.stock}
                      onFocus={() => {
                        const updatedVariants = [...variants];
                        updatedVariants[index].stock = variant.stock;
                        setVariants(updatedVariants);
                      }}
                    />
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: theme.colors.bg }]}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                <Icon name="X" size={25} />
              </Pressable>

              <View style={styles.modalHeaderRight}>
                <Pressable
                  onPress={() => {
                    Alert.alert('Delete Option', 'Are you sure you want to delete this option?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteOption() },
                    ]);
                  }}
                  style={styles.modalDeleteButton}>
                  <Icon name="Trash" size={18} />
                </Pressable>
                <Button onPress={handleSaveOption} title="Save" size="medium" />
              </View>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.modalContent}>
                <ThemedText style={styles.modalSectionTitle}>Option name</ThemedText>
                <ThemedText style={styles.modalSectionDescription}>
                  Sizes, colors, duration
                </ThemedText>
                <Input
                  label="Name"
                  value={currentOption.name}
                  onChangeText={(text: string) =>
                    setCurrentOption({ ...currentOption, name: text })
                  }
                />
                <ThemedText style={styles.modalSectionTitleValues}>Values</ThemedText>
                <ThemedText style={styles.modalValuesHint}>Black, large, hours, etc</ThemedText>
                <FlashList
                  style={styles.valuesList}
                  data={currentOption.values}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <View style={styles.valuesRow}>
                      <TextInput
                        style={[styles.valueInput, { color: theme.colors.text }]}
                        placeholder="Enter value"
                        placeholderTextColor={theme.colors.placeholder}
                        value={item}
                        onChangeText={(text) => {
                          const updatedValues = currentOption.values.map((val, i) =>
                            i === index ? text : val
                          );

                          // If the user is typing in the last input, add a new empty one
                          if (index === updatedValues.length - 1 && text !== '') {
                            updatedValues.push('');
                          }

                          setCurrentOption({
                            ...currentOption,
                            values: updatedValues,
                          });
                        }}
                        onSubmitEditing={Keyboard.dismiss}
                      />
                      <Pressable
                        onPress={() => removeValue(index)}
                        style={styles.removeValueButton}>
                        <Icon name="Trash" size={20} />
                      </Pressable>
                    </View>
                  )}
                  ListFooterComponent={
                    <Pressable onPress={addValue} style={styles.addValueButton}>
                      <Icon name="Plus" size={20} />
                      <ThemedText style={styles.addValueText}>Add value</ThemedText>
                    </Pressable>
                  }
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default ProductVariantCreator;

const styles = StyleSheet.create((theme) => ({
  optionsContainer: {
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
    borderRadius: 12,
    borderColor: palette.neutral400,
  },
  optionsContainerBorder: {
    borderWidth: 1,
  },
  optionRow: {
    marginBottom: -1,
    borderBottomWidth: 1,
    borderBottomColor: palette.neutral300,
    padding: 16,
  },
  optionRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTitle: {
    fontWeight: '600',
  },
  optionEditIconWrapper: {
    borderRadius: 8,
  },
  optionValuesRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  valueTag: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  valueTagLight: {
    backgroundColor: palette.gray200,
  },
  valueTagDark: {
    backgroundColor: palette.gray700,
  },
  valueTagText: {
    fontSize: 14,
  },
  addOptionButton: {
    position: 'relative',
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.neutral400,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addOptionButtonDisabled: {
    position: 'relative',
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.neutral200,
    borderWidth: 0,
  },
  addOptionText: {
    marginLeft: 8,
  },
  addOptionTextDisabled: {
    marginLeft: 0,
  },
  variantsSection: {
    marginTop: 16,
  },
  variantsTitle: {
    marginBottom: 8,
    marginTop: 0,
    fontSize: 20,
    fontWeight: '500',
  },
  variantCard: {
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.neutral400,
    padding: 8,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  variantLabel: {
    marginLeft: 8,
  },
  variantInputsRow: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInputWrapper: {
    width: 80,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalContainer: {
    width: '100%',
    flex: 1,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  modalCloseButton: {
    height: 48,
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDeleteButton: {
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  modalBody: {
    marginTop: 32,
    flex: 1,
  },
  modalContent: {
    width: '100%',
    paddingHorizontal: 16,
  },
  modalSectionTitle: {
    fontSize: 20,
    fontWeight: '500',
  },
  modalSectionDescription: {
    marginBottom: 16,
    width: '100%',
    fontSize: 14,
  },
  modalSectionTitleValues: {
    marginTop: 32,
    fontSize: 20,
    fontWeight: '500',
  },
  modalValuesHint: {
    width: '100%',
    fontSize: 14,
    color: theme.colors.subtext,
  },
  valuesList: {
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.neutral500,
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.neutral500,
  },
  valueInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  removeValueButton: {
    paddingHorizontal: 12,
  },
  addValueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addValueText: {
    marginLeft: 8,
  },
}));
