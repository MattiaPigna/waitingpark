import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../theme';
import { useStore } from '../store/useStore';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import LeavingScreen from '../screens/main/LeavingScreen';
import SearchScreen from '../screens/main/SearchScreen';
import MatchScreen from '../screens/main/MatchScreen';
import WalletScreen from '../screens/main/WalletScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ChatsScreen from '../screens/main/ChatsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Map" component={HomeScreen} />
      <Stack.Screen name="Leaving" component={LeavingScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen
        name="Match"
        component={MatchScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          backgroundColor: Colors.surface,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, string> = {
            HomeTab: focused ? 'map' : 'map-outline',
            Chats: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Wallet: focused ? 'wallet' : 'wallet-outline',
          };
          return (
            <Ionicons
              name={icons[route.name] as any}
              size={24}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Mappa' }} />
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ title: 'Chat' }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: 'Portafoglio' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const user = useStore((s) => s.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
