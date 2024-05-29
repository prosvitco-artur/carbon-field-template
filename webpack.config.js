const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const { ProvidePlugin } = require('webpack');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    bundle: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: isProduction ? '[name].min.js' : '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2
            }
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },
  externals: [
    '@wordpress/compose',
    '@wordpress/data',
    '@wordpress/element',
    '@wordpress/hooks',
    '@wordpress/i18n',
    'classnames',
    'lodash'
  ].reduce((memo, name) => {
    memo[name] = `cf.vendor['${name}']`;
    return memo;
  }, {
    '@carbon-fields/core': 'cf.core'
  }),
  plugins: [
    new MiniCssExtractPlugin({
      filename: isProduction ? '[name].min.css' : '[name].css'
    }),

    new ProvidePlugin({
      'wp.element': '@wordpress/element'
    }),

    ...(isProduction ? [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', { discardComments: { removeAll: true } }]
        }
      }),
      new TerserPlugin({
        parallel: true,
        minify: TerserPlugin.terser,
      })
    ] : [])
  ],
  stats: {
    modules: false,
    hash: false,
    builtAt: false,
    children: false
  }
};
