import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import {
  sendMessage,
  subscribeToMessages,
  confirmMatch,
  completeMatch,
  cancelMatch,
} from '../../services/parkingService';
import { useStore } from '../../store/useStore';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import Avatar from '../../components/Avatar';
import { Message } from '../../types';

const QUICK_MESSAGES = [
  'Arrivo in 2 min ✅',
  'Sono quasi lì 🚗',
  'Aspettami 1 min ⏳',
  'Dove sei esatto? 📍',
  'Grazie mille! 🙏',
];

export default function MatchScreen({ navigation, route }: any) {
  const { matchId } = route.params as { matchId: string };
  const { user, activeMatch, messages, setMessages, addMessage, setActiveMatch } = useStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const match = activeMatch;
  const isLeaving = match?.leavingUser?.uid === user?.uid;
  const otherUser = isLeaving ? match?.searchingUser : match?.leavingUser;
  const spotCoords = match
    ? { latitude: match.spot?.latitude ?? 0, longitude: match.spot?.longitude ?? 0 }
    : null;

  useEffect(() => {
    if (!matchId) return;
    const unsub = subscribeToMessages(matchId, setMessages);
    return unsub;
  }, [matchId]);

  async function handleSend(msg?: string) {
    const textToSend = (msg ?? text).trim();
    if (!textToSend || !user || !matchId) return;
    setSending(true);
    setText('');
    Keyboard.dismiss();
    await sendMessage(matchId, user.uid, user.name, textToSend);
    setSending(false);
    flatListRef.current?.scrollToEnd({ animated: true });
  }

  async function handleConfirmSpot() {
    if (!match) return;
    Alert.alert(
      isLeaving ? 'Conferma cessione' : 'Prenota il posto',
      isLeaving
        ? 'Confermi di cedere il posto? Riceverai €0,50 sul tuo wallet.'
        : `Verranno addebitati €0,50 sulla tua carta. Confermi?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Conferma',
          onPress: async () => {
            await confirmMatch(matchId);
            setActiveMatch({ ...match, status: 'confirmed' });
          },
        },
      ]
    );
  }

  async function handleComplete() {
    if (!match) return;
    Alert.alert(
      'Parcheggio completato!',
      isLeaving
        ? 'Il tuo posto è stato ceduto con successo 🎉'
        : 'Hai preso il posto con successo 🎉',
      [
        {
          text: 'Ottimo!',
          onPress: async () => {
            await completeMatch(matchId, match.spot?.id ?? match.spotId);
            setActiveMatch(null);
            navigation.navigate('Map');
          },
        },
      ]
    );
  }

  async function handleCancel() {
    if (!match) return;
    Alert.alert('Annulla match', 'Sei sicuro? Il match verrà annullato.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sì, annulla',
        style: 'destructive',
        onPress: async () => {
          await cancelMatch(matchId, match.spotId, match.requestId);
          setActiveMatch(null);
          navigation.navigate('Map');
        },
      },
    ]);
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.uid;
    return (
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        {!isMe && (
          <Text style={styles.bubbleSender}>{item.senderName}</Text>
        )}
        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.text}</Text>
        <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
          {new Date(item.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Avatar name={otherUser?.name ?? 'U'} size={38} uri={otherUser?.avatar} />
          <View>
            <Text style={styles.headerName}>{otherUser?.name ?? 'Utente'}</Text>
            <Text style={styles.headerRole}>
              {isLeaving ? '🔍 Cerca parcheggio' : '🚗 Cede il posto'}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, match?.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending]}>
          <Text style={styles.statusText}>
            {match?.status === 'confirmed' ? 'Confermato ✓' : 'In attesa'}
          </Text>
        </View>
      </View>

      {spotCoords && (
        <View style={styles.mapBar}>
          <MapView
            style={styles.miniMap}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            region={{ ...spotCoords, latitudeDelta: 0.003, longitudeDelta: 0.003 }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={spotCoords}>
              <View style={styles.spotMarker}>
                <Ionicons name="car" size={14} color="#fff" />
              </View>
            </Marker>
          </MapView>
          <View style={styles.mapInfo}>
            <Ionicons name="location" size={14} color={Colors.leaving} />
            <Text style={styles.mapAddress} numberOfLines={1}>
              {match?.spot?.address ?? 'Posizione del posto'}
            </Text>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubbles-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyChatText}>Inizia la conversazione!</Text>
            </View>
          }
        />

        <View style={styles.quickMessages}>
          <FlatList
            horizontal
            data={QUICK_MESSAGES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.xs, paddingHorizontal: Spacing.md }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => handleSend(item)}
              >
                <Text style={styles.quickBtnText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Scrivi un messaggio..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!text.trim() || sending}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionBar}>
          {match?.status === 'pending' ? (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelActionBtn]}
                onPress={handleCancel}
              >
                <Ionicons name="close-circle-outline" size={18} color={Colors.leaving} />
                <Text style={[styles.actionBtnText, { color: Colors.leaving }]}>Rifiuta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmActionBtn]}
                onPress={handleConfirmSpot}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>
                  {isLeaving ? 'Cedo il posto' : `Prenoto (€0,50)`}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeActionBtn, { flex: 1 }]}
              onPress={handleComplete}
            >
              <Ionicons name="flag-outline" size={18} color="#fff" />
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>
                Parcheggio completato!
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  headerRole: { fontSize: 11, color: Colors.textSecondary },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusPending: { backgroundColor: Colors.warningLight },
  statusConfirmed: { backgroundColor: Colors.searchingLight },
  statusText: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary },
  mapBar: {
    height: 100,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  miniMap: { flex: 1 },
  mapInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  mapAddress: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  chatList: { padding: Spacing.md, gap: Spacing.sm, flexGrow: 1 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyChatText: { color: Colors.textMuted, fontSize: 14 },
  bubble: {
    maxWidth: '78%',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginVertical: 2,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    ...Shadow.sm,
  },
  bubbleSender: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, marginBottom: 2 },
  bubbleText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: Colors.textMuted, textAlign: 'right', marginTop: 2 },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.6)' },
  quickMessages: { paddingVertical: Spacing.sm },
  quickBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickBtnText: { fontSize: 12, color: Colors.textPrimary, fontWeight: '500' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingTop: Spacing.xs,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  actionBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  cancelActionBtn: {
    backgroundColor: Colors.leavingLight,
    borderWidth: 1.5,
    borderColor: Colors.leaving,
  },
  confirmActionBtn: { backgroundColor: Colors.primary },
  completeActionBtn: { backgroundColor: Colors.searching },
  actionBtnText: { fontSize: 14, fontWeight: '700' },
});
