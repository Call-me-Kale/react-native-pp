import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, View, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { apiService } from '@/services/api';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const theme = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Błąd', 'Wszystkie pola są wymagane.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Błąd', 'Nowe hasła nie są identyczne.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Błąd', 'Nowe hasło musi mieć co najmniej 8 znaków.');
      return;
    }

    setLoading(true);
    try {
      await apiService.changePassword({
        currentPassword,
        newPassword,
      });
      Alert.alert('Sukces', 'Hasło zostało zmienione pomyślnie.');
      handleClose();
    } catch (error: any) {
      Alert.alert('Błąd', error.message || 'Nie udało się zmienić hasła.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Card style={[styles.modalContent, { backgroundColor: theme.background }]}>
              <ThemedText style={styles.title}>Zmień hasło</ThemedText>
              
              <View style={styles.form}>
                <Input
                  label="Obecne hasło"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder="Wprowadź obecne hasło"
                />
                
                <Input
                  label="Nowe hasło"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Min. 8 znaków, cyfra i znak specjalny"
                />
                
                <Input
                  label="Potwierdź nowe hasło"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Powtórz nowe hasło"
                />
              </View>

              <View style={styles.actions}>
                <Button 
                  title="Anuluj" 
                  onPress={handleClose} 
                  variant="secondary" 
                  disabled={loading}
                />
                <Button 
                  title={loading ? "Zapisywanie..." : "Zapisz"} 
                  onPress={handleSave} 
                  variant="primary" 
                  disabled={loading}
                />
              </View>
              
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#1DB954" />
                </View>
              )}
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
    maxWidth: 400,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  form: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.one,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 1,
  },
});
