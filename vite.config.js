import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    // Pin the dev-server host so HMR matches APP_URL (avoids the IPv6 [::1]
    // mismatch that silently breaks hot-reload when you open the app at localhost).
    server: {
        host: 'localhost',
        hmr: { host: 'localhost' },
    },
});
