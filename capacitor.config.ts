import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vintage.bookshelf',
  appName: 'Vintage Bookshelf',
  webDir: 'dist',
  backgroundColor: '#180d06',
  android: {
    backgroundColor: '#180d06',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#180d06',
    },
    ScreenOrientation: {},
  },
};

export default config;
