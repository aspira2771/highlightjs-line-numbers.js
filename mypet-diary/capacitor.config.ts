import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mypet.diary',
  appName: '마이펫 다이어리',
  webDir: 'dist',
  backgroundColor: '#FFF8F0',
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#FFB088',
    },
  },
};

export default config;
