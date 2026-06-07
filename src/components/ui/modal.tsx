import React from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function InfoModal({ visible, onClose, title, message }: InfoModalProps) {
  const theme = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Card style={[styles.modalContent, { backgroundColor: theme.background }]}>
              <ThemedText style={styles.icon}>🚀</ThemedText>
              <ThemedText style={styles.title}>{title}</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.message}>
                {message}
              </ThemedText>
              <Button title="Rozumiem" onPress={onClose} variant="primary" />
            </Card>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
    // Add border to stand out on plain background
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  icon: {
    fontSize: 40,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.two,
    lineHeight: 22,
  },
});
