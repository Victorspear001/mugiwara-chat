import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allows loading .env variables starting with NEXT_PUBLIC_ (common in Vercel)
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'], 
  server: {
    host: true, // Expose to local network
  },
  build: {
    target: 'es2020', // Improved compatibility for mobile devices
    outDir: 'dist',
    sourcemap: false,
  }
});