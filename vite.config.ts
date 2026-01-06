import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allows loading .env variables starting with NEXT_PUBLIC_ (common in Vercel)
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'], 
  build: {
    target: 'esnext',
    outDir: 'dist',
  }
});