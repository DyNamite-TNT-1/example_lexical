const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

var HappyPack = require("happypack");
var happyThreadPool = HappyPack.ThreadPool({ size: 3 });
// module.exports = smp.wrap({
module.exports = {
  entry: "./src/index.tsx",
  target: "web",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "release"),
    filename: "[name].[contenthash].js",
    publicPath: "/",
    clean: true,
  },
  cache: true, // disable on production
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    alias: {
      lexical: path.resolve(__dirname, "src/packages/lexical/src/index.ts"),
      "@lexical/clipboard": path.resolve(
        __dirname,
        "src/packages/lexical-clipboard/src/index.ts"
      ),
      "@lexical/code": path.resolve(
        __dirname,
        "src/packages/lexical-code/src/index.ts"
      ),
      "@lexical/devtools-core": path.resolve(
        __dirname,
        "src/packages/lexical-devtools-core/src/index.ts"
      ),
      "@lexical/dragon": path.resolve(
        __dirname,
        "src/packages/lexical-dragon/src/index.ts"
      ),
      "@lexical/eslint-plugin": path.resolve(
        __dirname,
        "src/packages/lexical-eslint-plugin/src/index.ts"
      ),
      "@lexical/file": path.resolve(
        __dirname,
        "src/packages/lexical-file/src/index.ts"
      ),
      "@lexical/hashtag": path.resolve(
        __dirname,
        "src/packages/lexical-hashtag/src/index.ts"
      ),
      "@lexical/headless": path.resolve(
        __dirname,
        "src/packages/lexical-headless/src/index.ts"
      ),
      "@lexical/history": path.resolve(
        __dirname,
        "src/packages/lexical-history/src/index.ts"
      ),
      "@lexical/html": path.resolve(
        __dirname,
        "src/packages/lexical-html/src/index.ts"
      ),
      "@lexical/link": path.resolve(
        __dirname,
        "src/packages/lexical-link/src/index.ts"
      ),
      "@lexical/list": path.resolve(
        __dirname,
        "src/packages/lexical-list/src/index.ts"
      ),
      "@lexical/mark": path.resolve(
        __dirname,
        "src/packages/lexical-mark/src/index.ts"
      ),
      "@lexical/markdown": path.resolve(
        __dirname,
        "src/packages/lexical-markdown/src/index.ts"
      ),
      "@lexical/offset": path.resolve(
        __dirname,
        "src/packages/lexical-offset/src/index.ts"
      ),
      "@lexical/overflow": path.resolve(
        __dirname,
        "src/packages/lexical-overflow/src/index.ts"
      ),
      "@lexical/plain-text": path.resolve(
        __dirname,
        "src/packages/lexical-plain-text/src/index.ts"
      ),
      "@lexical/react/LexicalAutoEmbedPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalAutoEmbedPlugin.tsx"
      ),
      "@lexical/react/LexicalAutoFocusPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalAutoFocusPlugin.ts"
      ),
      "@lexical/react/LexicalAutoLinkPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalAutoLinkPlugin.ts"
      ),
      "@lexical/react/LexicalBlockWithAlignableContents": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalBlockWithAlignableContents.tsx"
      ),
      "@lexical/react/LexicalCharacterLimitPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalCharacterLimitPlugin.tsx"
      ),
      "@lexical/react/LexicalCheckListPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalCheckListPlugin.tsx"
      ),
      "@lexical/react/LexicalClearEditorPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalClearEditorPlugin.ts"
      ),
      "@lexical/react/LexicalClickableLinkPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalClickableLinkPlugin.tsx"
      ),
      "@lexical/react/LexicalCollaborationContext": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalCollaborationContext.ts"
      ),
      "@lexical/react/LexicalCollaborationPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalCollaborationPlugin.tsx"
      ),
      "@lexical/react/LexicalComposer": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalComposer.tsx"
      ),
      "@lexical/react/LexicalComposerContext": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalComposerContext.ts"
      ),
      "@lexical/react/LexicalContentEditable": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalContentEditable.tsx"
      ),
      "@lexical/react/LexicalContextMenuPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalContextMenuPlugin.tsx"
      ),
      "@lexical/react/LexicalDecoratorBlockNode": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalDecoratorBlockNode.ts"
      ),
      "@lexical/react/LexicalDraggableBlockPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalDraggableBlockPlugin.tsx"
      ),
      "@lexical/react/LexicalEditorRefPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalEditorRefPlugin.tsx"
      ),
      "@lexical/react/LexicalErrorBoundary": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalErrorBoundary.tsx"
      ),
      "@lexical/react/LexicalHashtagPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalHashtagPlugin.ts"
      ),
      "@lexical/react/LexicalHistoryPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalHistoryPlugin.ts"
      ),
      "@lexical/react/LexicalHorizontalRuleNode": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalHorizontalRuleNode.tsx"
      ),
      "@lexical/react/LexicalHorizontalRulePlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalHorizontalRulePlugin.ts"
      ),
      "@lexical/react/LexicalLinkPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalLinkPlugin.ts"
      ),
      "@lexical/react/LexicalListPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalListPlugin.ts"
      ),
      "@lexical/react/LexicalMarkdownShortcutPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalMarkdownShortcutPlugin.tsx"
      ),
      "@lexical/react/LexicalNestedComposer": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalNestedComposer.tsx"
      ),
      "@lexical/react/LexicalNodeEventPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalNodeEventPlugin.ts"
      ),
      "@lexical/react/LexicalNodeMenuPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalNodeMenuPlugin.tsx"
      ),
      "@lexical/react/LexicalOnChangePlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalOnChangePlugin.ts"
      ),
      "@lexical/react/LexicalPlainTextPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalPlainTextPlugin.tsx"
      ),
      "@lexical/react/LexicalRichTextPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalRichTextPlugin.tsx"
      ),
      "@lexical/react/LexicalTabIndentationPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalTabIndentationPlugin.tsx"
      ),
      "@lexical/react/LexicalTableOfContents": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalTableOfContents.tsx"
      ),
      "@lexical/react/LexicalTableOfContentsPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalTableOfContentsPlugin.tsx"
      ),
      "@lexical/react/LexicalTablePlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalTablePlugin.ts"
      ),
      "@lexical/react/LexicalTreeView": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalTreeView.tsx"
      ),
      "@lexical/react/LexicalTypeaheadMenuPlugin": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/LexicalTypeaheadMenuPlugin.tsx"
      ),
      "@lexical/react/useLexicalEditable": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/useLexicalEditable.ts"
      ),
      "@lexical/react/useLexicalIsTextContentEmpty": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/useLexicalIsTextContentEmpty.ts"
      ),
      "@lexical/react/useLexicalNodeSelection": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/useLexicalNodeSelection.ts"
      ),
      "@lexical/react/useLexicalSubscription": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/useLexicalSubscription.tsx"
      ),
      "@lexical/react/useLexicalTextEntity": path.resolve(
        __dirname,
        "src/packages/lexical-react/src/useLexicalTextEntity.ts"
      ),
      "@lexical/rich-text": path.resolve(
        __dirname,
        "src/packages/lexical-rich-text/src/index.ts"
      ),
      "@lexical/selection": path.resolve(
        __dirname,
        "src/packages/lexical-selection/src/index.ts"
      ),
      "@lexical/table": path.resolve(
        __dirname,
        "src/packages/lexical-table/src/index.ts"
      ),
      "@lexical/text": path.resolve(
        __dirname,
        "src/packages/lexical-text/src/index.ts"
      ),
      "@lexical/utils": path.resolve(
        __dirname,
        "src/packages/lexical-utils/src/index.ts"
      ),
      "@lexical/yjs": path.resolve(
        __dirname,
        "src/packages/lexical-yjs/src/index.ts"
      ),
      "shared/canUseDOM": path.resolve(
        __dirname,
        "src/packages/shared/src/canUseDOM.ts"
      ),
      "shared/caretFromPoint": path.resolve(
        __dirname,
        "src/packages/shared/src/caretFromPoint.ts"
      ),
      "shared/environment": path.resolve(
        __dirname,
        "src/packages/shared/src/environment.ts"
      ),
      "shared/invariant": path.resolve(
        __dirname,
        "src/packages/shared/src/invariant.ts"
      ),
      "shared/normalizeClassNames": path.resolve(
        __dirname,
        "src/packages/shared/src/normalizeClassNames.ts"
      ),
      "shared/react-test-utils": path.resolve(
        __dirname,
        "src/packages/shared/src/react-test-utils.ts"
      ),
      "shared/reactPatches": path.resolve(
        __dirname,
        "src/packages/shared/src/reactPatches.ts"
      ),
      "shared/simpleDiffWithCursor": path.resolve(
        __dirname,
        "src/packages/shared/src/simpleDiffWithCursor.ts"
      ),
      "shared/useLayoutEffect": path.resolve(
        __dirname,
        "src/packages/shared/src/useLayoutEffect.ts"
      ),
      "shared/warnOnlyOnce": path.resolve(
        __dirname,
        "src/packages/shared/src/warnOnlyOnce.ts"
      ),
      "lexical/src": path.resolve(__dirname, "src/packages/lexical/src"),
      "lexical/src/__tests__/utils": path.resolve(
        __dirname,
        "src/packages/lexical/src/__tests__/utils/index.tsx"
      ),
      "@lexical/clipboard/src": path.resolve(
        __dirname,
        "src/packages/lexical-clipboard/src"
      ),
      "@lexical/code/src": path.resolve(
        __dirname,
        "src/packages/lexical-code/src"
      ),
      "@lexical/devtools-core/src": path.resolve(
        __dirname,
        "src/packages/lexical-devtools-core/src"
      ),
      "@lexical/dragon/src": path.resolve(
        __dirname,
        "src/packages/lexical-dragon/src"
      ),
      "@lexical/eslint-plugin/src": path.resolve(
        __dirname,
        "src/packages/lexical-eslint-plugin/src"
      ),
      "@lexical/file/src": path.resolve(
        __dirname,
        "src/packages/lexical-file/src"
      ),
      "@lexical/hashtag/src": path.resolve(
        __dirname,
        "src/packages/lexical-hashtag/src"
      ),
      "@lexical/headless/src": path.resolve(
        __dirname,
        "src/packages/lexical-headless/src"
      ),
      "@lexical/history/src": path.resolve(
        __dirname,
        "src/packages/lexical-history/src"
      ),
      "@lexical/html/src": path.resolve(
        __dirname,
        "src/packages/lexical-html/src"
      ),
      "@lexical/link/src": path.resolve(
        __dirname,
        "src/packages/lexical-link/src"
      ),
      "@lexical/list/src": path.resolve(
        __dirname,
        "src/packages/lexical-list/src"
      ),
      "@lexical/mark/src": path.resolve(
        __dirname,
        "src/packages/lexical-mark/src"
      ),
      "@lexical/markdown/src": path.resolve(
        __dirname,
        "src/packages/lexical-markdown/src"
      ),
      "@lexical/offset/src": path.resolve(
        __dirname,
        "src/packages/lexical-offset/src"
      ),
      "@lexical/overflow/src": path.resolve(
        __dirname,
        "src/packages/lexical-overflow/src"
      ),
      "@lexical/plain-text/src": path.resolve(
        __dirname,
        "src/packages/lexical-plain-text/src"
      ),
      "@lexical/react/src": path.resolve(
        __dirname,
        "src/packages/lexical-react/src"
      ),
      "@lexical/rich-text/src": path.resolve(
        __dirname,
        "src/packages/lexical-rich-text/src"
      ),
      "@lexical/selection/src": path.resolve(
        __dirname,
        "src/packages/lexical-selection/src"
      ),
      "@lexical/selection/src/__tests__/utils": path.resolve(
        __dirname,
        "src/packages/lexical-selection/src/__tests__/utils/index.ts"
      ),
      "@lexical/table/src": path.resolve(
        __dirname,
        "src/packages/lexical-table/src"
      ),
      "@lexical/text/src": path.resolve(
        __dirname,
        "src/packages/lexical-text/src"
      ),
      "@lexical/utils/src": path.resolve(
        __dirname,
        "src/packages/lexical-utils/src"
      ),
      "@lexical/yjs/src": path.resolve(
        __dirname,
        "src/packages/lexical-yjs/src"
      ),
      "shared/src": path.resolve(__dirname, "src/packages/shared/src"),
      "@base": path.resolve(__dirname, "src/base"),
    },
    fallback: {
      buffer: require.resolve("buffer/"),
      util: require.resolve("util/"),
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify/browser"),
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url"),
      assert: require.resolve("assert"),
      zlib: require.resolve("browserify-zlib"),
    },
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
        options: {
          sources: {
            list: [
              {
                tag: "link",
                attribute: "href",
                type: "src",
              },
            ],
          },
        },
      },
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
        options: {
          // disable type checker - we will use it in fork plugin
          // transpileOnly: true,
          happyPackMode: true,
        },
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: "asset/resource",
        // use: {
        //   loader: 'file-loader',
        // },
        // options: {
        //   name: '[name].[ext]?[hash]',
        // },
      },
      {
        test: /\.css?$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              name: "[name].[ext]",
              // outputPath: 'assets/fonts'
            },
          },
        ],
      },
    ],
  },
  ignoreWarnings: [/Failed to parse source map/],
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
    }),
    new webpack.EnvironmentPlugin({
      LEXICAL_VERSION: "0.17.1",
    }),

    new webpack.DefinePlugin({
      __DEV__: false,
    }),

    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.ProgressPlugin(),
    new HappyPack({
      id: "js",
      threadPool: happyThreadPool,
      loaders: ["babel-loader"],
    }),
    new HappyPack({
      id: "styles",
      threadPool: happyThreadPool,
      loaders: ["style-loader", "css-loader", "postcss-loader"],
    }),
    new HappyPack({
      id: "typescript",
      threadPool: happyThreadPool,
      loaders: ["ts-loader"],
    }),
  ],
  devServer: {
    // hot: 'only', // not auto reload
    historyApiFallback: true,
  },
  performance: {
    hints: false,
  },
  stats: {
    colors: true,
  },
  devtool: "eval-cheap-module-source-map",
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
    splitChunks: false,
  },
  // });
};
