import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Colors, Spacing, Radius, Shadow } from '../../theme';

const mockTransactions = [
  { id: '1', type: 'credit', amount: 0.5, description: 'Posto ceduto — Via Roma', date: new Date(Date.now() - 3600000 * 2) },
  { id: '2', type: 'debit', amount: -0.5, description: 'Posto prenotato — Piazza Garibaldi', date: new Date(Date.now() - 3600000 * 26) },
  { id: '3', type: 'credit', amount: 0.5, description: 'Posto ceduto — Via Napoli', date: new Date(Date.now() - 3600000 * 50) },
  { id: '4', type: 'fuel_reward', amount: 5, description: '🎉 Premio carburante sbloccato!', date: new Date(Date.now() - 3600000 * 100) },
];

function formatDate(date: Date) {
  const now = new Date();
  const diffH = Math.floor((now.getTime() - date.getTime()) / 3600000);
  if (diffH < 1) return 'Poco fa';
  if (diffH < 24) return `${diffH}h fa`;
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

export default function WalletScreen({ navigation }: any) {
  const { user } = useStore();

  const parkingsGiven = user?.totalParkingsGiven ?? 0;
  const progressToNext = parkingsGiven % 10;
  const progressPct = (progressToNext / 10) * 100;
  const remaining = 10 - progressToNext;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>Portafoglio</Text>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('HomeTab', { screen: 'Profile' })}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo disponibile</Text>
          <Text style={styles.balanceAmount}>€{(user?.walletBalance ?? 0).toFixed(2)}</Text>
          <View style={styles.balanceActions}>
            <TouchableOpacity
              style={styles.balanceAction}
              onPress={() => Alert.alert('Prelievo', 'Funzione in arrivo! Potrai prelevare il tuo saldo direttamente sul conto.')}
            >
              <Ionicons name="arrow-down-circle-outline" size={18} color="#fff" />
              <Text style={styles.balanceActionText}>Preleva</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.balanceAction}
              onPress={() => Alert.alert('Carte', 'Gestione carte di pagamento — funzione in arrivo!')}
            >
              <Ionicons name="card-outline" size={18} color="#fff" />
              <Text style={styles.balanceActionText}>Carte</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="exit-outline" size={24} color={Colors.leaving} />
            <Text style={styles.statValue}>{user?.totalParkingsGiven ?? 0}</Text>
            <Text style={styles.statLabel}>Ceduti</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="enter-outline" size={24} color={Colors.searching} />
            <Text style={styles.statValue}>{user?.totalParkingsTaken ?? 0}</Text>
            <Text style={styles.statLabel}>Presi</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>€{user?.fuelCredits ?? 0}</Text>
            <Text style={styles.statLabel}>Carburante</Text>
          </View>
        </View>

        <View style={styles.rewardCard}>
          <View style={styles.rewardHeader}>
            <Ionicons name="trophy" size={22} color={Colors.warning} />
            <Text style={styles.rewardTitle}>Prossimo premio carburante</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <View style={styles.rewardFooter}>
            <Text style={styles.progressLabel}>
              {progressToNext}/10 cessioni
            </Text>
            <Text style={styles.progressRemaining}>
              {remaining > 0 ? `Mancano ${remaining} per €5` : '🎉 Premio sbloccato!'}
            </Text>
          </View>

          <View style={styles.milestones}>
            {[...Array(10)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.milestone,
                  i < progressToNext && styles.milestoneDone,
                ]}
              >
                {i < progressToNext ? (
                  <Ionicons name="checkmark" size={10} color="#fff" />
                ) : (
                  <Text style={styles.milestoneNum}>{i + 1}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transazioni recenti</Text>
          {mockTransactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View
                style={[
                  styles.txIcon,
                  tx.type === 'credit' || tx.type === 'fuel_reward'
                    ? styles.txIconCredit
                    : styles.txIconDebit,
                ]}
              >
                <Ionicons
                  name={
                    tx.type === 'fuel_reward'
                      ? 'flame'
                      : tx.type === 'credit'
                      ? 'arrow-down'
                      : 'arrow-up'
                  }
                  size={16}
                  color={
                    tx.type === 'fuel_reward'
                      ? Colors.warning
                      : tx.type === 'credit'
                      ? Colors.searching
                      : Colors.leaving
                  }
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txDesc}>{tx.description}</Text>
                <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  tx.amount > 0 ? styles.txAmountCredit : styles.txAmountDebit,
                ]}
              >
                {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  pageTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.lg,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
  balanceAmount: { color: '#fff', fontSize: 48, fontWeight: '800', letterSpacing: -1 },
  balanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  balanceAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  balanceActionText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  separator: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  rewardCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  rewardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rewardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  progressBar: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.warning,
    borderRadius: Radius.full,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -Spacing.sm,
  },
  progressLabel: { fontSize: 12, color: Colors.textSecondary },
  progressRemaining: { fontSize: 12, fontWeight: '600', color: Colors.warning },
  milestones: { flexDirection: 'row', gap: 4 },
  milestone: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneDone: { backgroundColor: Colors.warning },
  milestoneNum: { fontSize: 8, color: Colors.textMuted, fontWeight: '700' },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconCredit: { backgroundColor: Colors.searchingLight },
  txIconDebit: { backgroundColor: Colors.leavingLight },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  txDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '700' },
  txAmountCredit: { color: Colors.searching },
  txAmountDebit: { color: Colors.leaving },
});
