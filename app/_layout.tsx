import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Constants from 'expo-constants';

let notifee: any = null;
if (Constants.appOwnership !== 'expo') {
  try {
    notifee = require('@notifee/react-native').default;
  } catch (e) {
    console.log('Notifee import error:', e);
  }
}

if (notifee) {
  notifee.registerForegroundService((notification: any) => {
    return new Promise(() => {
      // Servis durdurulana kadar arka planda çalışmasını sağlayan açık bir Promise
    });
  });
}

import { theme } from '@/constants/theme';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // We can add custom fonts later, for now we will use system fonts matching the minimal aesthetic
  });

  const loadSessions = useSessionStore(state => state.loadInitialData);
  const loadSettings = useSettingsStore(state => state.loadInitialData);

  useEffect(() => {
    loadSessions();
    loadSettings();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const CustomDarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.accent,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.textPrimary,
    border: 'transparent',
    notification: theme.colors.danger,
  },
};

function RootLayoutNav() {
  return (
    <ThemeProvider value={CustomDarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
