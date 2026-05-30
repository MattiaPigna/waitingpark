import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { useStore } from '../../store/useStore';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import Button from '../../components/Button';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setUser = useStore((s) => s.setUser);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Attenzione', 'Compila tutti i campi');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Attenzione', 'La password deve avere almeno 6 caratteri');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const userData = {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        walletBalance: 0,
        totalParkingsGiven: 0,
        totalParkingsTaken: 0,
        fuelCredits: 0,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), userData);
      setUser(userData as any);
    } catch (e: any) {
      Alert.alert('Errore', e.message ?? 'Registrazione non riuscita');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.title}>Crea account</Text>
          <Text style={styles.subtitle}>Unisciti alla community WaitingPark</Text>

          <View style={styles.form}>
            {[
              {
                label: 'Nome completo',
                icon: 'person-outline',
                value: name,
                setter: setName,
                placeholder: 'Mario Rossi',
                type: 'default' as const,
              },
              {
                label: 'Email',
                icon: 'mail-outline',
                value: email,
                setter: setEmail,
                placeholder: 'mario@email.com',
                type: 'email-address' as const,
              },
            ].map((field) => (
              <View key={field.label} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name={field.icon as any} size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType={field.type}
                    autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                  />
                </View>
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimo 6 caratteri"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.terms}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.searching} />
              <Text style={styles.termsText}>
                Registrandoti accetti i nostri{' '}
                <Text style={styles.termsLink}>Termini di Servizio</Text>
                {' '}e la{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <Button label="Registrati" onPress={handleRegister} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hai già un account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}> Accedi</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingTop: Spacing.sm },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  form: { gap: Spacing.md },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  input: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.searchingLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  termsText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  termsLink: { color: Colors.primary, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.xl,
  },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
});
