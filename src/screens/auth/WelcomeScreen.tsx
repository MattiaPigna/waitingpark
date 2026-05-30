import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '../../theme';

const { width } = Dimensions.get('window');

const features = [
  { icon: 'location', color: Colors.leaving, text: 'Segnala che stai uscendo e aiuta chi cerca' },
  { icon: 'notifications', color: Colors.warning, text: 'Ricevi notifiche in tempo reale per zona' },
  { icon: 'wallet', color: Colors.searching, text: 'Guadagna €0,50 ogni volta che cedi il posto' },
  { icon: 'car-sport', color: Colors.primary, text: 'Accumula 10 cessioni e vinci €5 di carburante' },
];

export default function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Ionicons name="car-sport" size={52} color="#fff" />
        </View>
        <Text style={styles.appName}>WaitingPark</Text>
        <Text style={styles.tagline}>Il parcheggio che ti aspettava</Text>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: f.color + '20' }]}>
              <Ionicons name={f.icon as any} size={20} color={f.color} />
            </View>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.primaryBtnText}>Inizia — è gratis</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryBtnText}>Ho già un account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.lg,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    ...Shadow.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: Radius.lg,
    ...Shadow.md,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
