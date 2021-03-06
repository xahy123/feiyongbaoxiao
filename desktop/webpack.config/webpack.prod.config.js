const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const webpackConfigBase = require('./webpack.base.config');
const Copy = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// 清理 dist 文件夹
const CleanWebpackPlugin = require('clean-webpack-plugin');

const webpackConfigProd = {
	plugins: [
		// 定义环境变量为开发环境
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
			IS_DEVELOPMETN: false
		}),
		new CleanWebpackPlugin([ 'desktop' ], {
			root: path.resolve(__dirname, '../../dist/'),
			verbose: true,
			dry: false
		}),
		// 提取css
		// 根据入口文件，提取重复引用的公共代码类库，打包到单独文件中
		// new webpack.optimize.OccurenceOrderPlugin(),
		/* 压缩优化代码开始*/
		new webpack.optimize.UglifyJsPlugin({ minimize: true }),
		// 分析代码
		//new BundleAnalyzerPlugin({ analyzerPort: 3011 }),
		new Copy([
			// { from: '../desktop/app/assets/images', to: './images' }
		])
	]
};

module.exports = merge(webpackConfigBase, webpackConfigProd);
