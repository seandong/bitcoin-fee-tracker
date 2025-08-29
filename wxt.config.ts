import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'BTC Fee Tracker',
    description: 'Bitcoin transaction fee tracker Chrome extension',
    version: '1.0.0',
    permissions: ['storage', 'notifications', 'alarms'],
    host_permissions: ['https://mempool.space/*'],
    action: {
      default_title: 'BTC Fee Tracker'
    }
  }
});
