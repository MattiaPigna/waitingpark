import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useStore } from '../../store/useStore';
import { subscribeToNearbySpots } from '../../services/parkingService';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import Avatar from '../../components/Avatar';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const { user, nearbySpots, setNearbySpots } = useStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Posizione necessaria',
          'WaitingPark ha bisogno della tua posizione per trovare parcheggi vicino a te.',
          [{ text: 'OK' }]
        );
        return;
      }
      setLocationGranted(true);
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);

      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  useEffect(() => {
    if (!location) return;
    const unsub = subscribeToNearbySpots(
      location.latitude,
      location.longitude,
      0.02,
      setNearbySpots
    );
    return unsub;
  }, [location]);

  function centerOnUser() {
    if (!location) return;
    mapRef.current?.animateToRegion({
      ...location,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation={locationGranted}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: 41.9028,
          longitude: 12.4964,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {location && (
          <Circle
            center={location}
            radius={500}
            fillColor="rgba(79,70,229,0.08)"
            strokeColor="rgba(79,70,229,0.3)"
            strokeWidth={1.5}
          />
        )}

        {nearbySpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            onPress={() =>
              Alert.alert(
                'Posto disponibile',
                `${spot.userName} sta per liberare un posto in ${spot.address}`,
                [
                  { text: 'Ignora', style: 'cancel' },
                  {
                    text: 'Vai alla ricerca',
                    onPress: () => navigation.navigate('Search'),
                  },
                ]
              )
            }
          >
            <View style={styles.marker}>
              <Ionicons name="car" size={16} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Ciao, {user?.name?.split(' ')[0]} 👋</Text>
              <Text style={styles.spotsCount}>
                {nearbySpots.length > 0
                  ? `${nearbySpots.length} posto${nearbySpots.length > 1 ? 'i' : ''} disponibil${nearbySpots.length > 1 ? 'i' : 'e'} vicino a te`
                  : 'Nessun posto disponibile ora'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <Avatar name={user?.name ?? 'U'} size={44} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fab} pointerEvents="box-none">
          <TouchableOpacity style={styles.locateBtn} onPress={centerOnUser} activeOpacity={0.8}>
            <Ionicons name="locate" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.handle} />
          <Text style={styles.bottomTitle}>Cosa vuoi fare?</Text>

          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Leaving')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.leavingLight }]}>
              <Ionicons name="exit-outline" size={26} color={Colors.leaving} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Sto uscendo dal parcheggio</Text>
              <Text style={styles.actionSubtitle}>Cedi il tuo posto e guadagna €0,50</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Search')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.searchingLight }]}>
              <Ionicons name="search" size={26} color={Colors.searching} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Cerco parcheggio</Text>
              <Text style={styles.actionSubtitle}>Ricevi notifica quando si libera un posto</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {nearbySpots.length > 0 && (
            <View style={styles.nearbyBadge}>
              <Ionicons name="radio" size={14} color={Colors.searching} />
              <Text style={styles.nearbyBadgeText}>
                {nearbySpots.length} posto{nearbySpots.length > 1 ? 'i' : ''} si sta liberando vicino a te
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.md,
  },
  greeting: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  spotsCount: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  avatarBtn: { padding: 2 },
  fab: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  locateBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  bottomSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadow.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  bottomTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  actionSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  nearbyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.searchingLight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  nearbyBadgeText: { fontSize: 13, color: Colors.searching, fontWeight: '600' },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    ...Shadow.sm,
  },
});
