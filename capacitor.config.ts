import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.babylone.app',
  appName: 'BABYLONE',
  webDir: 'dist',
  server: {
    // En dev, décommenter et mettre l'URL de ton backend (ex: http://192.168.1.x:3000)
    // pour que le mobile charge l'app depuis le PC et pointe vers ton API.
    // androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
