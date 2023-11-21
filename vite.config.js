import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from "fs"
// https://vitejs.dev/config/
export default defineConfig({
  // server: {
  //   https: {
  //     key: fs.readFileSync('./ssl/192.168.57.249-key.pem'),
  //     cert: fs.readFileSync('./ssl/192.168.57.249.pem'),
  //   },
  // },
  plugins: [react()],
  jsx: 'react',
})


