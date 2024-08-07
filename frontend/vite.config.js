import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '0.0.0.0', // Bind to all network interfaces
        port: 5173, // Specify the port
    },
});
