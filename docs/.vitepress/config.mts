import { defineConfig } from 'vitepress';
export default defineConfig({
  title: 'Roborock MQTT Bridge',
  description: 'Reliable MQTT integration for Roborock vacuum accounts.',
  base: '/roborock/',
  cleanUrls: true,
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: '/roborock/favicon.svg', type: 'image/svg+xml' }]],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Configuration', link: '/configuration' },
      { text: 'MQTT', link: '/mqtt' },
      { text: 'Enum values', link: '/enum-values' },
      { text: 'Authentication', link: '/authentication' },
      { text: 'Deployment', link: '/deployment' },
    ],
    sidebar: [
      { text: 'Overview', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Configuration', link: '/configuration' },
      { text: 'MQTT Contract', link: '/mqtt' },
      { text: 'Enum values', link: '/enum-values' },
      { text: 'Authentication', link: '/authentication' },
      { text: 'Deployment', link: '/deployment' },
      { text: 'Troubleshooting', link: '/troubleshooting' },
    ],
    editLink: {
      pattern: 'https://github.com/open-mqtt-bridges/roborock/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/open-mqtt-bridges/roborock' }],
  },
});
