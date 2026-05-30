import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import Avatar from '../../components/Avatar';

const mockChats = [
  {
    id: 'match_1',
    otherUser: { name: 'Luca Bianchi', avatar: undefined },
    lastMessage: 'Arrivo in 2 min ✅',
    time: new Date(Date.now() - 3600000 * 1),
    unread: 2,
    status: 'confirmed',
    address: 'Via Roma 14, Milano',
  },
  {
    id: 'match_2',
    otherUser: { name: 'Sara Verdi', avatar: undefined },
    lastMessage: 'Grazie mille! 🙏',
    time: new Date(Date.now() - 3600000 * 25),
    unread: 0,
    status: 'completed',
    address: 'Piazza Garibaldi, Milano',
  },
];

function formatTime(date: Date) {
  const now = new Date();
  const diffH = (now.getTime() - date.getTime()) / 3600000;
  if (diffH < 1) return 'Poco fa';
  if (diffH < 24) return `${Math.floor(diffH)}h fa`;
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

export default function ChatsScreen({ navigation }: any) {
  const { activeMatch } = useStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Conversazioni</Text>
      </View>

      {activeMatch && (
        <TouchableOpacity
          style={styles.activeMatchBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('HomeTab', { screen: 'Match', params: { matchId: activeMatch.id } })}
        >
          <View style={styles.activeDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.activeBannerTitle}>Match attivo in corso</Text>
            <Text style={styles.activeBannerSub}>Tocca per aprire la chat</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.searching} />
        </TouchableOpacity>
      )}

      <FlatList
        data={mockChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={60} color={Colors.border} />
            <Text style={styles.emptyTitle}>Nessuna conversazione</Text>
            <Text style={styles.emptySubtitle}>
              Le tue chat appariranno qui quando trovi o cedi un parcheggio
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('HomeTab', {
                screen: 'Match',
                params: { matchId: item.id },
              })
            }
          >
            <View style={styles.avatarWrapper}>
              <Avatar name={item.otherUser.name} size={50} uri={item.otherUser.avatar} />
              {item.status === 'confirmed' && (
                <View style={styles.onlineIndicator} />
              )}
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatTop}>
                <Text style={styles.chatName}>{item.otherUser.name}</Text>
                <Text style={styles.chatTime}>{formatTime(item.time)}</Text>
              </View>
              <View style={styles.chatBottom}>
                <Text style={styles.chatAddress} numberOfLines={1}>
                  <Ionicons name="location-outline" size={11} /> {item.address}
                </Text>
              </View>
              <Text style={styles.chatLastMsg} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  pageTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  activeMatchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.searchingLight,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.searching,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.searching,
  },
  activeBannerTitle: { fontSize: 13, fontWeight: '700', color: Colors.searching },
  activeBannerSub: { fontSize: 11, color: Colors.textSecondary },
  list: { padding: Spacing.lg, paddingTop: 0 },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  avatarWrapper: { position: 'relative' },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.searching,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  chatInfo: { flex: 1, gap: 3 },
  chatTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chatName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  chatTime: { fontSize: 11, color: Colors.textMuted },
  chatBottom: {},
  chatAddress: { fontSize: 11, color: Colors.textMuted },
  chatLastMsg: { fontSize: 13, color: Colors.textSecondary },
  unreadBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
