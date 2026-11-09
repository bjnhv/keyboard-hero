import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Keyboard Hero | Blind Touch-Typing Tutor',
    short_name: 'Keyboard Hero',
    description:
      'Offline-first blind touch-typing tutor with muscle memory progression and gamified arcade challenges',
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#090d16',
    orientation: 'any',
    categories: ['education', 'games', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
