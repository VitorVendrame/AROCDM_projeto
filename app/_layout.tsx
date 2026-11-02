import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import ErrorBoundary from '../src/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hide splash after brief delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      setReady(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return React.createElement(
    ErrorBoundary,
    null,
    React.createElement(StatusBar, { style: 'light' }),
    React.createElement(Stack, {
      screenOptions: {
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0A' },
        animation: 'fade',
      },
    }),
  );
}
