import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'copy-index-to-404',
            closeBundle() {
                const dist = path.resolve(__dirname, 'dist')
                const src = path.join(dist, 'index.html')
                const dest = path.join(dist, '404.html')
                if (fs.existsSync(src)) {
                    fs.copyFileSync(src, dest)
                    console.log('✅ 404.html created from index.html')
                }
            }
        }
    ],
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
