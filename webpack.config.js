const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const share = mf.share;

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, 'tsconfig.json'),
  [/* mapped paths to share */]);

module.exports = {
  output: {
    uniqueName: "demo",
    publicPath: "auto",
    scriptType: "text/javascript"
  },
  optimization: {
    runtimeChunk: false
  },   
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    }
  },
  experiments: {
    outputModule: true
  },
 /*plugins: [
    // new ModuleFederationPlugin({
    //     name: "home",
    //     filename: "remoteEntry.js",
    //     exposes: {
    //         './HomeModule': './/src/app/home/home.module.ts',
    //     },        

    //     shared: share({
    //       "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
    //       "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
    //       "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
    //       "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    //       "@angular/forms": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
    //       ...sharedMappings.getDescriptors()
    //     })
        
    // }),
    // sharedMappings.getPlugin()
  ] */

    // plugins: [
    //   new ModuleFederationPlugin({
    //     name: "qosUniverse",
    //     filename: "remoteEntry.js",
    //     exposes: {
    //       './QosUniverseModule': './src/app/QOSUNIVERSE/qosuniverse.module.ts'
    //     },
    //     shared: shareAll({
    //       singleton: true,
    //       strictVersion: true,
    //       requiredVersion: 'auto'
    //     }),
    //   }),
    //   sharedMappings.getPlugin()
    // ],
};
