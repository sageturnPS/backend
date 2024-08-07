import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Bind to all network interfaces
    port: 5173, // Specify the port
    watch: {
      usePolling: true,
      interval: 500,
    },
  },
})
