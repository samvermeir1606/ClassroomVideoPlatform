import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Using relative base path so it deploys seamlessly on GitHub Pages at any subpath
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
