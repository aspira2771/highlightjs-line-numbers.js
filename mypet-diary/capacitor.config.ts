import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mypet.diary',
  appName: '마이펫 다이어리',
  webDir: 'dist',
  backgroundColor: '#FFFFFF',
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#3182F6',
    },
  },
};

export default config;
