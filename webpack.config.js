const path = require('path');

module.exports = {
  // Your existing configuration
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Your middleware setup code here
      // Example:
      // middlewares.unshift(/* your custom middleware */);
      return middlewares;
    },
    // Remove or replace `onBeforeSetupMiddleware` and `onAfterSetupMiddleware`
  },
};
