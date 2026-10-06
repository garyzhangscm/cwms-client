/**
 * For more configuration, please refer to https://angular.io/guide/build#proxying-to-a-backend-server
 *
 * 更多配置描述请参考 https://angular.cn/guide/build#proxying-to-a-backend-server
 *
 * Note: The proxy is only valid for real requests, Mock does not actually generate requests, so the priority of Mock will be higher than the proxy
 */
module.exports = {
  '/api/user-password-reset-test/**': {
    target: process.env.MES_USER_PASSWORD_RESET_TARGET || 'http://127.0.0.1:1',
    changeOrigin: true,
    pathRewrite: { '^/api/user-password-reset-test': '' }
  },
  '/api/workorder-completion-test/**': {
    target: process.env.MES_WORKORDER_COMPLETE_TARGET || 'http://127.0.0.1:1',
    changeOrigin: true,
    pathRewrite: { '^/api/workorder-completion-test': '' }
  },
  '/api/workorder-deletion-test/**': {
    target: process.env.MES_WORKORDER_DELETE_TARGET || 'http://127.0.0.1:1',
    changeOrigin: true,
    pathRewrite: { '^/api/workorder-deletion-test': '' }
  },
  '/api/inventory-handoff/**': {
    target: process.env.MES_INVENTORY_HANDOFF_TARGET || 'http://10.0.10.159:18791',
    changeOrigin: true,
    pathRewrite: {'^/api': ''}
  },
  '/api/integration-settings/**': {
    target: process.env.MES_ITEM_SETTINGS_TARGET || 'http://10.0.10.101:18790',
    changeOrigin: true,
    pathRewrite: {'^/api': ''}
  },
  '/api/**': {
    target: process.env.COLTON_API_TARGET || 'http://10.0.10.159:31252',
    changeOrigin: true
  },
  /**
   * The following means that all requests are directed to the backend `https://localhost:9000/`
   */
  // '/api': {
  //   target: 'https://localhost:9000/',
  //   secure: false, // Ignore invalid SSL certificates
  //   changeOrigin: true
  // }
  
};
