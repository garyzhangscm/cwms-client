/**
 * For more configuration, please refer to https://angular.io/guide/build#proxying-to-a-backend-server
 *
 * 更多配置描述请参考 https://angular.cn/guide/build#proxying-to-a-backend-server
 *
 * Note: The proxy is only valid for real requests, Mock does not actually generate requests, so the priority of Mock will be higher than the proxy
 */
module.exports = {
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
