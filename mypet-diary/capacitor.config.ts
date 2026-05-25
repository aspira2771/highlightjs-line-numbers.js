import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mypet.diary',
  appName: '마이펫 다이어리',
  webDir: 'dist',
  backgroundColor: '#F3F2EE',
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#1A1A1A',
    },
  },
};

export default config;
