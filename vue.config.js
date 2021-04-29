const path = require('path');
module.exports = {
    publicPath: "/", 
    pluginOptions: {
      'style-resources-loader': {
        preProcessor: 'sass',
        patterns: []
      }
    }
}
