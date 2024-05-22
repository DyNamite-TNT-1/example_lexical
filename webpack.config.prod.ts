import path from 'path';
import webpack, { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const webpackConfig = (env: any): Configuration => ({
  entry: './src/index.tsx',
  target: 'web',
  mode: 'production',
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  // devtool: 'inline-source-map',
  devtool: false,
  // devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'js/[name].bundle.[chunkhash].js',
    chunkFilename: 'js/[name].bundle.[chunkhash].js',
    publicPath: '/',
    clean: true
  },
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
      '@account': path.resolve(__dirname, 'src/account'),
      process: 'process/browser'
    },
    fallback: {
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      zlib: require.resolve('browserify-zlib'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify')
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
        loader: 'ts-loader'
      },
      // {
      //   enforce: 'pre',
      //   test: /\.js$/,
      //   loader: 'source-map-loader',
      // },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
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
            loader: 'file-loader',
            options: {
              name: 'assets/fonts/[name].[hash:8].[ext]'
            }
          }
        ]
      }
    ]
  },
  ignoreWarnings: [/Failed to parse source map/],
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html')
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    })
    // new webpack.ProvidePlugin({
    //   $: 'jquery',
    //   jQuery: 'jquery',
    // }),
    // new BundleAnalyzerPlugin()
  ],
  stats: {
    colors: true
  },
  optimization: {
    minimize: true,
    runtimeChunk: {
      name: 'manifest'
    },
    splitChunks: {
      chunks: 'all',
      // minSize: 200000,
      minSize: 150000,
      maxSize: 250000,
      minChunks: 1,
      maxAsyncRequests: 15,
      maxInitialRequests: 15,
      automaticNameDelimiter: '~',
      name: false,
      cacheGroups: {
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          enforce: true
        },
        bootstrapVendor: {
          test: /[\\/]node_modules[\\/]react-bootstrap[\\/]/,
          enforce: true
        },
        reactWorldFlag: {
          test: /[\\/]node_modules[\\/]react-world-flags[\\/]/
          // enforce: true,
        },
        toastUi: {
          test: /[\\/]node_modules[\\/]@toast-ui[\\/]/,
          enforce: true
        },
        jquery: {
          test: /[\\/]node_modules[\\/]jquery[\\/]/,
          enforce: true
        },
        jqueryui: {
          test: /[\\/]node_modules[\\/]jqueryui[\\/]/,
          enforce: true
        },
        apexcharts: {
          test: /[\\/]node_modules[\\/]apexcharts[\\/]/,
          enforce: true
        },
        reactFeather: {
          test: /[\\/]node_modules[\\/]react-feather[\\/]/,
          enforce: true
        },
        dateFns: {
          test: /[\\/]node_modules[\\/]date-fns[\\/]/,
          enforce: true
        },
        fullcalendar: {
          test: /[\\/]node_modules[\\/]@fullcalendar[\\/]/,
          enforce: true
        },
        vendor: {
          test: /[\\/]node_modules[\\/]!(react-bootstrap|react-world-flags|react|react-dom|@toast-ui|date-fns|grapesjs|jqueryui|jquery|apexcharts|react-feather|date-fns|@fullcalendar)[\\/]/
          // enforce: true,
        },
        baseModule: {
          test: /[\\/]src[\\/]base[\\/]/
          // enforce: true,
        },
        auth: {
          test: /[\\/]src[\\/]auth[\\/]/,
          enforce: true
        },
        demoModule: {
          test: /[\\/]src[\\/]demo-page[\\/]/
          // enforce: true,
        }
      }
    }
  }
});
export default webpackConfig;
