import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useStore } from '../../store/useStore';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import Avatar from '../../components/Avatar';

type MenuItem = {
  icon: string;
  label: string;
  value?: string;
  color?: string;
  onPress: () => void;
};

export default function ProfileScreen({ navigation }: any) {
  const { user, setUser } = useStore();

  async function handleLogout() {
    Alert.alert('Esci', 'Sei sicuro di voler uscire?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Esci',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          setUser(null);
        },
      },
    ]);
  }

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Nome',
          value: user?.name,
          onPress: () => Alert.alert('Modifica nome', 'Funzione in arrivo!'),
        },
        {
          icon: 'mail-outline',
          label: 'Email',
          value: user?.email,
          onPress: () => {},
        },
        {
          icon: 'call-outline',
          label: 'Telefono',
          value: user?.phone ?? 'Non impostato',
          onPress: () => Alert.alert('Modifica telefono', 'Funzione in arrivo!'),
        },
      ],
    },
    {
      title: 'Pagamenti',
      items: [
        {
          icon: 'card-outline',
          label: 'Carte collegate',
          value: 'Aggiungi carta',
          onPress: () => Alert.alert('Carte', 'Collegamento Stripe in arrivo! Potrai aggiungere carte Visa/Mastercard.'),
        },
        {
          icon: 'cash-outline',
          label: 'IBAN per prelievi',
          value: 'Non impostato',
          onPress: () => Alert.alert('IBAN', 'Funzione in arrivo!'),
        },
      ],
    },
    {
      title: 'Notifiche',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Notifiche push',
          value: 'Abilitate',
          onPress: () => Alert.alert('Notifiche', 'Gestisci le notifiche nelle impostazioni del telefono.'),
        },
        {
          icon: 'location-outline',
          label: 'Accesso GPS',
          value: 'Sempre attivo',
          onPress: () => Alert.alert('GPS', 'Gestisci il GPS nelle impostazioni del telefono.'),
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: 'shield-checkmark-outline',
          label: 'Privacy Policy',
          onPress: () => Alert.alert('Privacy', 'Disponibile al lancio ufficiale.'),
        },
        {
          icon: 'document-text-outline',
          label: 'Termini di Servizio',
          onPress: () => Alert.alert('Termini', 'Disponibili al lancio ufficiale.'),
        },
        {
          icon: 'star-outline',
          label: 'Valuta l\'app',
          onPress: () => Alert.alert('Grazie!', 'Valutaci su App Store o Google Play 🙏'),
        },
        {
          icon: 'log-out-outline',
          label: 'Esci',
          color: Colors.leaving,
          onPress: handleLogout,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Profilo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Avatar name={user?.name ?? 'U'} size={80} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.levelBadge}>
              <Ionicons name="star" size={12} color={Colors.warning} />
              <Text style={styles.levelText}>
                {(user?.totalParkingsGiven ?? 0) >= 50
                  ? 'Esperto'
                  : (user?.totalParkingsGiven ?? 0) >= 20
                  ? 'Avanzato'
                  : 'Principiante'}
              </Text>
            </View>
          </View>
        </View>

        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIcon, item.color ? { backgroundColor: item.color + '15' } : {}]}>
                      <Ionicons
                        name={item.icon as any}
                        size={18}
                        color={item.color ?? Colors.textSecondary}
                      />
                    </View>
                    <Text style={[styles.menuLabel, item.color ? { color: item.color } : {}]}>
                      {item.label}
                    </Text>
                    {item.value && (
                      <Text style={styles.menuValue} numberOfLines={1}>
                        {item.value}
                      </Text>
                    )}
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.version}>WaitingPark v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
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
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  profileInfo: { flex: 1, gap: Spacing.xs },
  profileName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  profileEmail: { fontSize: 13, color: Colors.textSecondary },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  levelText: { fontSize: 11, fontWeight: '700', color: Colors.warning },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  menuValue: { fontSize: 13, color: Colors.textMuted, maxWidth: 140 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 16 + 34 + 12 },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
