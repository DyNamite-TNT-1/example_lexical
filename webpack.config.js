const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
// const smp = new SpeedMeasurePlugin();
var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: 3 });
// module.exports = smp.wrap({
module.exports = {
  entry: './src/index.tsx',
  target: 'web',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].[contenthash].js',
    publicPath: '/',
    clean: true
  },
  cache: true, // disable on production
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    alias: {
      '@base': path.resolve(__dirname, 'src/base'),
      '@demo-page': path.resolve(__dirname, 'src/demo-page'),
      '@security': path.resolve(__dirname, 'src/security'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@profile': path.resolve(__dirname, 'src/profile'),
      '@auth': path.resolve(__dirname, 'src/auth'),
      '@sessions': path.resolve(__dirname, 'src/sessions'),
      '@account': path.resolve(__dirname, 'src/account')
      // process: 'process/browser'
    },
    fallback: {
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      assert: require.resolve('assert'),
      zlib: require.resolve('browserify-zlib')
    }
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
        options: {
          sources: {
            list: [
              {
                tag: 'link',
                attribute: 'href',
                type: 'src'
              }
            ]
          }
        }
      },
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        options: {
          // disable type checker - we will use it in fork plugin
          // transpileOnly: true,
          happyPackMode: true
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource'
        // use: {
        //   loader: 'file-loader',
        // },
        // options: {
        //   name: '[name].[ext]?[hash]',
        // },
      },
      {
        test: /\.css?$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[ext]'
              // outputPath: 'assets/fonts'
            }
          }
        ]
      }
    ]
  },
  ignoreWarnings: [/Failed to parse source map/],
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html')
    }),
    // new webpack.DefinePlugin({
    //   'process.env.NODE_ENV': JSON.stringify('development'),
    // }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),
    // new webpack.ProvidePlugin({
    //   $: 'jquery',
    //   jQuery: 'jquery'
    // }),
    new webpack.ProgressPlugin(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true
        },
        memoryLimit: 3072
      }
    }),
    new HappyPack({
      id: 'js',
      threadPool: happyThreadPool,
      loaders: ['babel-loader']
    }),
    new HappyPack({
      id: 'styles',
      threadPool: happyThreadPool,
      loaders: ['style-loader', 'css-loader','postcss-loader']
    }),
    new HappyPack({
      id: 'typescript',
      threadPool: happyThreadPool,
      loaders: ['ts-loader']
    })
  ],
  devServer: {
    // hot: 'only', // not auto reload
    historyApiFallback: true
  },
  performance: {
    hints: false
  },
  stats: {
    colors: true
  },
  devtool: 'eval-cheap-module-source-map',
  optimization: {
    // minimize: true,
    // minimizer: [
    //   new UglifyJSPlugin({
    //     uglifyOptions: {
    //       compress: {
    //         drop_console: true
    //       }
    //     }
    //   })
    // ],
    runtimeChunk: true,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false
  }
  // });
};
