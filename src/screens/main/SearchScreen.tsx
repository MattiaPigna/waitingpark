import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createParkingRequest, cancelRequest } from '../../services/parkingService';
import { useStore } from '../../store/useStore';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import Button from '../../components/Button';

type Step = 'setup' | 'searching';
type SearchMode = 'now' | 'scheduled';
type Radius_ = 0.3 | 0.5 | 1.0 | 2.0;

const radiusOptions: { value: Radius_; label: string }[] = [
  { value: 0.3, label: '300m' },
  { value: 0.5, label: '500m' },
  { value: 1.0, label: '1 km' },
  { value: 2.0, label: '2 km' },
];

export default function SearchScreen({ navigation }: any) {
  const { user, setCurrentRequest } = useStore();
  const mapRef = useRef<MapView>(null);
  const [step, setStep] = useState<Step>('setup');
  const [mode, setMode] = useState<SearchMode>('now');
  const [selectedRadius, setSelectedRadius] = useState<Radius_>(0.5);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchCenter, setSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [scheduledTime, setScheduledTime] = useState(new Date(Date.now() + 3600000));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    (async () => {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);
      setSearchCenter(coords);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      const geo = await Location.reverseGeocodeAsync(coords);
      if (geo[0]) {
        const { city, district } = geo[0];
        setAddress(district ?? city ?? 'La mia posizione');
      }
    })();
  }, []);

  async function handleStartSearch() {
    if (!searchCenter || !user) return;
    setLoading(true);
    try {
      const scheduledFor = mode === 'scheduled' ? scheduledTime : undefined;
      const id = await createParkingRequest(
        user.uid,
        user.name,
        searchCenter.latitude,
        searchCenter.longitude,
        selectedRadius,
        scheduledFor
      );
      setRequestId(id);
      setCurrentRequest({
        id,
        userId: user.uid,
        userName: user.name,
        latitude: searchCenter.latitude,
        longitude: searchCenter.longitude,
        radiusKm: selectedRadius,
        searchTime: mode,
        scheduledFor,
        status: 'active',
        createdAt: new Date(),
      });
      setStep('searching');
    } catch {
      Alert.alert('Errore', 'Impossibile avviare la ricerca. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSearch() {
    Alert.alert('Annulla ricerca', 'Sei sicuro di voler smettere di cercare?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sì, annulla',
        style: 'destructive',
        onPress: async () => {
          if (requestId) await cancelRequest(requestId);
          setCurrentRequest(null);
          navigation.goBack();
        },
      },
    ]);
  }

  if (!location || !searchCenter) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Recupero posizione GPS...</Text>
      </View>
    );
  }

  if (step === 'searching') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.searchingContainer}>
          <View style={styles.pulseContainer}>
            <View style={[styles.pulseRing, styles.ring3]} />
            <View style={[styles.pulseRing, styles.ring2]} />
            <View style={[styles.pulseRing, styles.ring1]} />
            <View style={styles.pulseCore}>
              <Ionicons name="search" size={30} color={Colors.searching} />
            </View>
          </View>

          <Text style={styles.searchingTitle}>Ricerca attiva</Text>
          <Text style={styles.searchingSubtitle}>
            Ti notificheremo appena si libera un posto{'\n'}nel raggio di {selectedRadius < 1 ? `${selectedRadius * 1000}m` : `${selectedRadius} km`} da {address}
          </Text>

          {mode === 'scheduled' && (
            <View style={styles.infoCard}>
              <Ionicons name="calendar" size={18} color={Colors.warning} />
              <Text style={styles.infoText}>
                Ricerca programmata per le{' '}
                {scheduledTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Ionicons name="location" size={18} color={Colors.searching} />
            <Text style={styles.infoText}>Zona: {address} — {selectedRadius < 1 ? `${selectedRadius * 1000}m` : `${selectedRadius} km`}</Text>
          </View>

          <View style={styles.costCard}>
            <Ionicons name="card" size={20} color={Colors.primary} />
            <Text style={styles.costText}>
              La prenotazione costerà solo{' '}
              <Text style={styles.costAmount}>€0,50</Text>
              {'\n'}che verranno scalati dalla tua carta
            </Text>
          </View>

          <Button
            label="Annulla ricerca"
            onPress={handleCancelSearch}
            variant="outline"
            style={{ marginTop: Spacing.xl, width: '100%' }}
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
          <Text style={styles.pageTitle}>Cerco parcheggio</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.sectionTitle}>Zona di ricerca</Text>
        <Text style={styles.sectionSubtitle}>Tocca e trascina sulla mappa per selezionare un'altra zona</Text>

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.miniMap}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            onRegionChangeComplete={(reg) =>
              setSearchCenter({ latitude: reg.latitude, longitude: reg.longitude })
            }
          >
            {searchCenter && (
              <>
                <Circle
                  center={searchCenter}
                  radius={selectedRadius * 1000}
                  fillColor="rgba(16,185,129,0.12)"
                  strokeColor={Colors.searching}
                  strokeWidth={2}
                />
                <Marker coordinate={searchCenter}>
                  <View style={styles.centerMarker}>
                    <Ionicons name="search" size={16} color="#fff" />
                  </View>
                </Marker>
              </>
            )}
          </MapView>
          <View style={styles.crosshair} pointerEvents="none">
            <Ionicons name="add-circle" size={28} color={Colors.searching} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Raggio di ricerca</Text>
        <View style={styles.radiusRow}>
          {radiusOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.radiusBtn,
                selectedRadius === opt.value && styles.radiusBtnActive,
              ]}
              onPress={() => setSelectedRadius(opt.value)}
            >
              <Text
                style={[
                  styles.radiusLabel,
                  selectedRadius === opt.value && styles.radiusLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quando ti serve?</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'now' && styles.modeBtnActive]}
            onPress={() => setMode('now')}
          >
            <Ionicons name="flash" size={18} color={mode === 'now' ? Colors.searching : Colors.textMuted} />
            <Text style={[styles.modeBtnText, mode === 'now' && styles.modeBtnTextActive]}>
              Adesso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'scheduled' && styles.modeBtnActive]}
            onPress={() => setMode('scheduled')}
          >
            <Ionicons name="calendar" size={18} color={mode === 'scheduled' ? Colors.searching : Colors.textMuted} />
            <Text style={[styles.modeBtnText, mode === 'scheduled' && styles.modeBtnTextActive]}>
              Programmata
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'scheduled' && (
          <TouchableOpacity
            style={styles.timePickerBtn}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={18} color={Colors.primary} />
            <Text style={styles.timePickerText}>
              {scheduledTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} — {scheduledTime.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}

        {showTimePicker && (
          <DateTimePicker
            value={scheduledTime}
            mode="datetime"
            minimumDate={new Date()}
            onChange={(_, date) => {
              setShowTimePicker(false);
              if (date) setScheduledTime(date);
            }}
          />
        )}

        <View style={styles.costBanner}>
          <Ionicons name="card-outline" size={18} color={Colors.primary} />
          <Text style={styles.costBannerText}>
            Prenotando un posto verranno scalati{' '}
            <Text style={{ fontWeight: '700', color: Colors.primary }}>€0,50</Text>
            {' '}dalla tua carta
          </Text>
        </View>

        <Button
          label={mode === 'now' ? 'Cerca parcheggio ora' : 'Programma ricerca'}
          onPress={handleStartSearch}
          variant="searching"
          loading={loading}
          style={{ marginTop: Spacing.sm, marginBottom: Spacing.xl }}
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
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  sectionSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: -Spacing.xs },
  mapContainer: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    height: 200,
    ...Shadow.sm,
  },
  miniMap: { width: '100%', height: '100%' },
  crosshair: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.searching,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    ...Shadow.sm,
  },
  radiusRow: { flexDirection: 'row', gap: Spacing.sm },
  radiusBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  radiusBtnActive: { backgroundColor: Colors.searchingLight, borderColor: Colors.searching },
  radiusLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  radiusLabelActive: { color: Colors.searching },
  modeRow: { flexDirection: 'row', gap: Spacing.sm },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modeBtnActive: { backgroundColor: Colors.searchingLight, borderColor: Colors.searching },
  modeBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  modeBtnTextActive: { color: Colors.searching },
  timePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  timePickerText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.primary },
  costBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#EEF2FF',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  costBannerText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  searchingContainer: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
  },
  pulseContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: Colors.searching,
  },
  ring3: { width: 140, height: 140, opacity: 0.08 },
  ring2: { width: 100, height: 100, opacity: 0.15 },
  ring1: { width: 70, height: 70, opacity: 0.22 },
  pulseCore: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.searchingLight,
    borderWidth: 2,
    borderColor: Colors.searching,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchingTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  searchingSubtitle: {
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
  costCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#EEF2FF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    width: '100%',
  },
  costText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  costAmount: { fontWeight: '700', color: Colors.primary },
});
