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
    splitChunks: false
  }
});
export default webpackConfig;
