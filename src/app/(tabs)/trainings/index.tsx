import { StyleSheet, ScrollView, Platform, RefreshControl, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { ActivityItem } from '@/components/ui/activity-item';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { apiService, TrainingEntry, Equipment } from '@/services/api';

export default function TrainingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  
  const [activeTab, setActiveTab] = useState(0); // 0: Treningi, 1: Sprzęt
  const [trainings, setTrainings] = useState<TrainingEntry[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (params.tab === 'equipment') {
      setActiveTab(1);
    } else if (params.tab === 'trainings') {
      setActiveTab(0);
    }
  }, [params.tab]);

  // Equipment Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bike');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [totalDistance, setTotalDistance] = useState('');
  const [serviceInterval, setServiceInterval] = useState('');

  const fetchData = useCallback(async () => {
    try {
      if (activeTab === 0) {
        const data = await apiService.getTrainingEntries();
        setTrainings(data);
      } else {
        const data = await apiService.getEquipment();
        setEquipment(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const containerPadding = Platform.select({
    web: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
    default: {
      paddingHorizontal: Spacing.four,
      paddingTop: Math.max(insets.top, Spacing.three),
      paddingBottom: insets.bottom + Spacing.three,
    },
  });

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTrainingIcon = (type: string) => {
    switch (type) {
      case 'swimming': return 'waves';
      case 'cycling': return 'bike';
      case 'running': return 'run';
      default: return 'help-circle';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'bike': return 'bike';
      case 'shoes': return 'run';
      default: return 'wrench';
    }
  };

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
        totalDistance: parseFloat(totalDistance) || 0,
        serviceInterval: parseFloat(serviceInterval) || 0,
        purchaseDate: new Date().toISOString(),
        lastServiceDistance: parseFloat(totalDistance) || 0,
      });
      setIsModalVisible(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Failed to add equipment:', error);
      Alert.alert('Błąd', `Nie udało się dodać sprzętu: ${error.message}`);
    }
  };

  const handleResetService = async (id: string, name: string) => {
    Alert.alert(
      'Reset Serwisu',
      `Czy na pewno chcesz zresetować licznik serwisu dla: ${name}?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        { 
          text: 'Tak, zresetuj', 
          onPress: async () => {
            try {
              await apiService.resetService(id);
              fetchData();
              Alert.alert('Sukces', 'Licznik serwisu został zresetowany.');
            } catch (error: any) {
              Alert.alert('Błąd', 'Nie udało się zresetować serwisu.');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setName('');
    setCategory('Bike');
    setBrand('');
    setModel('');
    setTotalDistance('');
    setServiceInterval('');
  };

  const renderServiceBar = (item: Equipment) => {
    const isServiceable = ['bike', 'shoes'].includes(item.category.toLowerCase());
    if (!isServiceable) return null;

    const distanceSinceService = item.totalDistance - item.lastServiceDistance;
    const interval = item.serviceInterval || (item.category.toLowerCase() === 'bike' ? 5000 : 1000);
    const progress = (distanceSinceService / interval) * 100;
    const barColor = progress >= 100 ? '#FF5252' : '#1DB954';

    return (
      <ThemedView style={styles.serviceSection}>
        <ThemedView style={styles.serviceHeader}>
          <ThemedText type="small" themeColor="textSecondary">Serwis: {distanceSinceService.toFixed(0)} / {interval} km</ThemedText>
          <Pressable onPress={() => handleResetService(item.id, item.name)} style={styles.resetIcon}>
            <MaterialCommunityIcons name="wrench-clock" size={18} color={theme.textSecondary} />
          </Pressable>
        </ThemedView>
        <ThemedView style={styles.progressBarBg}>
          <ThemedView 
            style={[
              styles.progressBarFill, 
              { 
                width: `${Math.min(progress, 100)}%`, 
                backgroundColor: barColor 
              }
            ]} 
          />
        </ThemedView>
        {progress >= 100 && (
          <ThemedText style={styles.alertText}>Wymagany przegląd!</ThemedText>
        )}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemedView style={[styles.header, { paddingTop: Math.max(insets.top, Spacing.four) }]}>
        <ThemedText style={styles.title}>Aktywności</ThemedText>
        <SegmentedControl
          options={['Treningi', 'Sprzęt']}
          selectedIndex={activeTab}
          onChange={setActiveTab}
          style={styles.segmentedControl}
        />
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.four }]}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1DB954']} />
        }
      >
        <ThemedView style={styles.container}>
          {activeTab === 0 ? (
            <ThemedView style={styles.list}>
              {trainings.length > 0 ? (
                trainings.map((item) => (
                  <Pressable 
                    key={item.id} 
                    onPress={() => router.push({
                      pathname: "/trainings/[id]",
                      params: { id: item.id }
                    })}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  >
                    <ActivityItem
                      icon={getTrainingIcon(item.type)}
                      title={item.title || (item.type.charAt(0).toUpperCase() + item.type.slice(1))}
                      distance={`${item.distance} km`}
                      time={formatDuration(item.duration)}
                      date={formatDate(item.date)}
                    />
                  </Pressable>
                ))
              ) : (
                <ThemedView style={styles.emptyContainer}>
                  <ThemedText themeColor="textSecondary">Brak zarejestrowanych treningów.</ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          ) : (
            <ThemedView style={styles.list}>
              <ThemedView style={styles.equipmentActions}>
                <Button 
                  title="Dodaj Sprzęt" 
                  variant="primary" 
                  onPress={() => setIsModalVisible(true)}
                  style={{ flex: 1 }}
                />
              </ThemedView>
              
              {equipment.length > 0 ? (
                equipment.map((item) => (
                  <Pressable 
                    key={item.id} 
                    onPress={() => router.push({
                      pathname: "/equipment/[id]",
                      params: { id: item.id }
                    })}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  >
                    <Card style={styles.equipmentCard}>
                      <ThemedView style={styles.cardHeader}>
                        <ThemedView style={[styles.iconContainer, { backgroundColor: theme.backgroundElement }]}>
                          <MaterialCommunityIcons name={getCategoryIcon(item.category) as any} size={24} color="#1DB954" />
                        </ThemedView>
                        <ThemedView style={styles.cardTitleContainer}>
                          <ThemedView style={styles.nameRow}>
                            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                            <ThemedText style={styles.totalMileage}>{item.totalDistance.toFixed(0)} km</ThemedText>
                          </ThemedView>
                          <ThemedText type="small" themeColor="textSecondary">{item.brand} {item.model}</ThemedText>
                        </ThemedView>
                      </ThemedView>
                      {renderServiceBar(item)}
                    </Card>
                  </Pressable>
                ))
              ) : (
                <ThemedView style={styles.emptyContainer}>
                  <ThemedText themeColor="textSecondary">Brak zarejestrowanego sprzętu.</ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>

      {/* Equipment Modal */}
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
            <ThemedView style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, color: theme.text, borderColor: theme.backgroundElement }]}
                placeholder="Przebieg (km)"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={totalDistance}
                onChangeText={setTotalDistance}
              />
              <TextInput
                style={[styles.input, { flex: 1, color: theme.text, borderColor: theme.backgroundElement }]}
                placeholder="Interwał (km)"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={serviceInterval}
                onChangeText={setServiceInterval}
              />
            </ThemedView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
  },
  container: {
    paddingTop: Spacing.two,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    gap: Spacing.three,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  segmentedControl: {
    marginBottom: Spacing.one,
  },
  list: {
    gap: Spacing.two,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.four,
  },
  equipmentActions: {
    flexDirection: 'row',
    marginBottom: Spacing.two,
    backgroundColor: 'transparent',
  },
  equipmentCard: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
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
    gap: 2,
    backgroundColor: 'transparent',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalMileage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1DB954',
  },
  serviceSection: {
    marginTop: 4,
    gap: 8,
    backgroundColor: 'transparent',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  resetIcon: {
    padding: 4,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  alertText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
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
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
  },
});

