import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Bitcoin Fee Tracker',
    short_name: 'BTC Fee Tracker',
    description: 'Real-time Bitcoin network fee monitor with customizable alerts. Track transaction costs and optimize your BTC transfers.',
    version: '1.0.0',
    version_name: '1.0.0',
    author: 'Your Name',
    permissions: ['storage', 'notifications', 'alarms', 'tabs'],
    host_permissions: ['https://mempool.space/*'],
    action: {
      default_title: 'Bitcoin Fee Tracker - Monitor BTC transaction fees'
    },
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '128': 'icon/128.png'
    }
  }
});
