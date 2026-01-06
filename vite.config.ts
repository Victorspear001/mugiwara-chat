import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CRITICAL: This allows Vite to expose Vercel's NEXT_PUBLIC_ variables to your app
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'], 
  build: {
    target: 'esnext'
  }
});