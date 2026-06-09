import { StyleSheet, ScrollView, Pressable, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { apiService, Equipment } from '@/services/api';

export default function EquipmentScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bike');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [totalDistance, setTotalDistance] = useState(''); // Updated to match BE name

  const fetchEquipment = useCallback(async () => {
    try {
      const data = await apiService.getEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEquipment();
    setRefreshing(false);
  }, [fetchEquipment]);

  const handleAddEquipment = async () => {
    if (!name || !brand) {
      Alert.alert('Błąd', 'Proszę podać nazwę i markę sprzętu.');
      return;
    }

    try {
      await apiService.createEquipment({
        name,
        category,
        brand,
        model,
        totalDistance: parseFloat(totalDistance) || 0, // Sending initial distance
        purchaseDate: new Date().toISOString(),
      });
      setIsModalVisible(false);
      resetForm();
      fetchEquipment();
    } catch (error: any) {
      console.error('Failed to add equipment:', error);
      Alert.alert('Błąd', `Nie udało się dodać sprzętu: ${error.message}`);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('Bike');
    setBrand('');
    setModel('');
    setTotalDistance('');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'bike': return 'bike';
      case 'shoes': return 'run';
      default: return 'wrench';
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <ThemedText style={styles.title}>Mój Sprzęt</ThemedText>
        <Pressable onPress={() => setIsModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add" size={28} color="#1DB954" />
        </Pressable>
      </ThemedView>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.four }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1DB954']} />}
      >
        {equipment.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bike-fast" size={64} color={theme.backgroundSelected} />
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              Nie masz jeszcze dodanego sprzętu.
            </ThemedText>
            <Button title="Dodaj pierwszy sprzęt" onPress={() => setIsModalVisible(true)} />
          </ThemedView>
        ) : (
          equipment.map((item) => (
            <Pressable key={item.id} onPress={() => router.push(`/equipment/${item.id}`)}>
              <Card style={styles.equipmentCard}>
                <ThemedView style={styles.cardHeader}>
                  <ThemedView style={[styles.iconContainer, { backgroundColor: theme.backgroundElement }]}>
                    <MaterialCommunityIcons name={getCategoryIcon(item.category) as any} size={24} color="#1DB954" />
                  </ThemedView>
                  <ThemedView style={styles.cardTitleContainer}>
                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">{item.brand} {item.model}</ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.usageContainer}>
                  <ThemedView style={styles.usageHeader}>
                    <ThemedText type="small" themeColor="textSecondary">Aktualny przebieg</ThemedText>
                    <ThemedText style={styles.currentMileage}>
                      {item.totalDistance?.toFixed(1) || '0.0'} km
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <ThemedText style={styles.modalTitle}>Dodaj Sprzęt</ThemedText>
            
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundElement }]}
              placeholder="Nazwa (np. Szosa)"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
            />
            
            <ThemedView style={styles.categoryRow}>
              {['Bike', 'Shoes', 'Other'].map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryChip,
                    { 
                      backgroundColor: category === cat ? '#1DB954' : theme.backgroundElement,
                    }
                  ]}
                >
                  <ThemedText style={{ color: category === cat ? '#fff' : theme.text }}>{cat}</ThemedText>
                </Pressable>
              ))}
            </ThemedView>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundElement }]}
              placeholder="Marka"
              placeholderTextColor={theme.textSecondary}
              value={brand}
              onChangeText={setBrand}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundElement }]}
              placeholder="Model"
              placeholderTextColor={theme.textSecondary}
              value={model}
              onChangeText={setModel}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundElement }]}
              placeholder="Aktualny przebieg (km)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={totalDistance}
              onChangeText={setTotalDistance}
            />

            <ThemedView style={styles.modalButtons}>
              <Button title="Anuluj" variant="secondary" onPress={() => setIsModalVisible(false)} />
              <Button title="Zapisz" onPress={handleAddEquipment} />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  backButton: {
    padding: Spacing.one,
    marginLeft: -Spacing.one,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  addButton: {
    padding: Spacing.one,
    marginRight: -Spacing.one,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  equipmentCard: {
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  usageContainer: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentMileage: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1DB954',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
