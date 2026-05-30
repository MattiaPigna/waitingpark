import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { createParkingSpot, cancelParkingSpot } from '../../services/parkingService';
import { useStore } from '../../store/useStore';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import Button from '../../components/Button';

type Step = 'setup' | 'waiting' | 'matched';
type Timing = 'now' | '5min' | '15min' | '30min';

const timingOptions: { value: Timing; label: string; desc: string }[] = [
  { value: 'now', label: 'Adesso', desc: 'Sto uscendo in questo momento' },
  { value: '5min', label: '5 min', desc: 'Esco tra circa 5 minuti' },
  { value: '15min', label: '15 min', desc: 'Esco tra circa 15 minuti' },
  { value: '30min', label: '30 min', desc: 'Esco tra circa 30 minuti' },
];

const timingMinutes: Record<Timing, number> = { now: 0, '5min': 5, '15min': 15, '30min': 30 };

export default function LeavingScreen({ navigation }: any) {
  const { user, setCurrentSpot } = useStore();
  const [step, setStep] = useState<Step>('setup');
  const [selectedTiming, setSelectedTiming] = useState<Timing>('now');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('Caricamento posizione...');
  const [spotId, setSpotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);
      const geo = await Location.reverseGeocodeAsync(coords);
      if (geo[0]) {
        const { street, streetNumber, city } = geo[0];
        setAddress(`${street ?? ''} ${streetNumber ?? ''}, ${city ?? ''}`.trim());
      }
    })();
  }, []);

  async function handleConfirm() {
    if (!location || !user) return;
    setLoading(true);
    try {
      const scheduledFor =
        selectedTiming !== 'now'
          ? new Date(Date.now() + timingMinutes[selectedTiming] * 60 * 1000)
          : undefined;
      const id = await createParkingSpot(
        user.uid,
        user.name,
        location.latitude,
        location.longitude,
        address,
        scheduledFor
      );
      setSpotId(id);
      setCurrentSpot({ id, userId: user.uid, userName: user.name, latitude: location.latitude, longitude: location.longitude, address, status: 'available', availableAt: scheduledFor ?? new Date(), createdAt: new Date() });
      setStep('waiting');
    } catch (e) {
      Alert.alert('Errore', 'Impossibile pubblicare il posto. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!spotId) { navigation.goBack(); return; }
    Alert.alert('Annulla segnalazione', 'Sei sicuro di voler annullare?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sì, annulla',
        style: 'destructive',
        onPress: async () => {
          await cancelParkingSpot(spotId);
          setCurrentSpot(null);
          navigation.goBack();
        },
      },
    ]);
  }

  if (!location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Recupero posizione GPS...</Text>
      </View>
    );
  }

  if (step === 'waiting') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.waitingContainer}>
          <View style={styles.pulseContainer}>
            <View style={[styles.pulse, { backgroundColor: Colors.leaving + '20' }]} />
            <View style={[styles.pulse, styles.pulse2, { backgroundColor: Colors.leaving + '30' }]} />
            <View style={styles.pulseCore}>
              <Ionicons name="exit-outline" size={36} color={Colors.leaving} />
            </View>
          </View>

          <Text style={styles.waitingTitle}>Segnalazione attiva</Text>
          <Text style={styles.waitingSubtitle}>
            Stiamo cercando qualcuno che ha bisogno del tuo posto...
          </Text>

          <View style={styles.infoCard}>
            <Ionicons name="location" size={18} color={Colors.leaving} />
            <Text style={styles.infoText}>{address}</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="time" size={18} color={Colors.warning} />
            <Text style={styles.infoText}>
              {selectedTiming === 'now' ? 'Disponibile adesso' : `Disponibile tra ${timingMinutes[selectedTiming]} minuti`}
            </Text>
          </View>

          <View style={styles.earningCard}>
            <Ionicons name="wallet" size={20} color={Colors.searching} />
            <Text style={styles.earningText}>Guadagnerai <Text style={styles.earningAmount}>€0,50</Text> quando qualcuno prenota</Text>
          </View>

          <Button
            label="Annulla segnalazione"
            onPress={handleCancel}
            variant="outline"
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Sto uscendo</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.miniMap}
            provider={PROVIDER_GOOGLE}
            region={{ ...location, latitudeDelta: 0.003, longitudeDelta: 0.003 }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={location}>
              <View style={styles.mapMarker}>
                <Ionicons name="exit-outline" size={18} color="#fff" />
              </View>
            </Marker>
          </MapView>
        </View>

        <View style={styles.addressCard}>
          <Ionicons name="location" size={18} color={Colors.leaving} />
          <Text style={styles.addressText}>{address}</Text>
        </View>

        <Text style={styles.sectionTitle}>Quando esci?</Text>
        <View style={styles.timingGrid}>
          {timingOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.timingBtn,
                selectedTiming === opt.value && styles.timingBtnActive,
              ]}
              onPress={() => setSelectedTiming(opt.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.timingLabel,
                  selectedTiming === opt.value && styles.timingLabelActive,
                ]}
              >
                {opt.label}
              </Text>
              <Text
                style={[
                  styles.timingDesc,
                  selectedTiming === opt.value && styles.timingDescActive,
                ]}
              >
                {opt.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.rewardBanner}>
          <Ionicons name="star" size={20} color={Colors.warning} />
          <Text style={styles.rewardText}>
            Cedendo questo posto guadagni{' '}
            <Text style={styles.rewardAmount}>€0,50</Text>
            {'\n'}Dopo 10 cessioni, ottieni{' '}
            <Text style={styles.rewardAmount}>€5 di carburante</Text>
          </Text>
        </View>

        <Button
          label="Segnala il posto"
          onPress={handleConfirm}
          variant="leaving"
          loading={loading}
          style={{ marginTop: Spacing.md, marginBottom: Spacing.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  pageTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  mapContainer: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    height: 180,
    ...Shadow.sm,
  },
  miniMap: { width: '100%', height: '100%' },
  mapMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.leaving,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    ...Shadow.sm,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.leavingLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  addressText: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  timingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timingBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  timingBtnActive: {
    backgroundColor: Colors.leavingLight,
    borderColor: Colors.leaving,
  },
  timingLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  timingLabelActive: { color: Colors.leaving },
  timingDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  timingDescActive: { color: Colors.leaving },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  rewardText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  rewardAmount: { fontWeight: '700', color: Colors.warning },
  waitingContainer: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
  },
  pulseContainer: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  pulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  pulse2: { width: 90, height: 90, borderRadius: 45 },
  pulseCore: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.leavingLight,
    borderWidth: 2,
    borderColor: Colors.leaving,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  waitingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    width: '100%',
    ...Shadow.sm,
  },
  infoText: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  earningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.searchingLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    width: '100%',
  },
  earningText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  earningAmount: { fontWeight: '700', color: Colors.searching },
});
