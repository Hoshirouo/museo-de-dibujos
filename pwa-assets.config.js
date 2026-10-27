import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: { ...minimal2023Preset, maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#d4dec6' } }, apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#d4dec6' } } },
  images: ['public/favicon.svg'],
});
