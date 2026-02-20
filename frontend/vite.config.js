import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,  // Puerto diferente al de Agon (5173)
        proxy: {
            '/api': {
                target: 'http://localhost:8001',  // Backend Ilinyx en dev
                changeOrigin: true,
            },
        },
    },
})
