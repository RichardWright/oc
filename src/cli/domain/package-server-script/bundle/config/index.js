/*jshint camelcase:false */
'use strict';

const webpack = require('webpack');
const path = require('path');
const externalDependenciesHandlers = require('./external-dependencies-handlers');
const BabiliPlugin = require('babili-webpack-plugin');

module.exports = function webpackConfigGenerator(params){
  return {
    devtool: '#source-map',
    entry: params.dataPath,
    target: 'node',
    output: {
      path: path.join(params.dataPath, '../build'),
      filename: params.fileName,
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
      devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
    },
    externals: externalDependenciesHandlers(params.dependencies),
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader:  'infinite-loop-loader'
            },
            {
              loader:  'babel-loader',
              options: {
                cacheDirectory: true,
                sourceMaps: true,
                sourceRoot: path.join(params.dataPath, '..'),
                'presets': [
                  [require.resolve('babel-preset-env'), {
                    'modules': false,
                    'targets': {
                      'node': 4
                    }
                  }]
                ]
              }
            }
          ],
        }
      ]
    },
    plugins: [
      new BabiliPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ],
    resolveLoader: {
      modules: ['node_modules', path.resolve(__dirname, '../../../../../../node_modules')]
    }
  };
};
