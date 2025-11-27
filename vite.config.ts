import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    // https: true,
    port: 5173,
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@mocks': path.resolve(__dirname, 'src/mocks'),
    },
  },
});
