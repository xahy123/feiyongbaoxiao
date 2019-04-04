const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

function resolve(relatedPath) {
	return path.join(__dirname, relatedPath);
}

const webpackConfigBase = {
	entry: {
		index: resolve('../app/index.js')
	},
	output: {
		path: resolve('../../dist/desktop'),
		filename: '[name].[hash:4].js',
		chunkFilename: 'chunks/[name].[hash:4].js'
	},
	target: 'electron-renderer',
	resolve: {
		extensions: [ '.js', '.json' ],
		alias: {
			components: path.join(__dirname, '/../app/components'),
			style: path.join(__dirname, '/../app/assets/style'),
			images: path.join(__dirname, '/../app/assets/images')
		}
	},
	resolveLoader: {
		moduleExtensions: [ '-loader' ]
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				include: [ path.resolve(__dirname, '../app') ],
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [ 'env', 'react', 'stage-0' ],
							plugins: [
								'add-module-exports',
								'transform-object-assign',
								'transform-decorators-legacy',
								[
                                    "import",
                                    [
                                        {
                                            libraryName: "antd",
                                            style: "css"
                                        }
                                    ]
                                ],
								[
									'transform-runtime',
									{
										helpers: false,
										polyfill: false,
										regenerator: true,
										moduleName: 'babel-runtime'
									}
								]
							]
						}
					}
				]
			},
			{
				test: /\.css/,
				loader: ExtractTextPlugin.extract({
					fallback: 'style',
					use: [ { loader: 'css', options: { sourceMap: true } } ]
				})
			},
			{
				test: /\.less$/,
				loader: ExtractTextPlugin.extract({
					fallback: 'style',
					use: [
						{ loader: 'css', options: { sourceMap: true } },
						{ loader: 'less', options: { sourceMap: true } }
					]
				})
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				loader: 'url',
				options: {
					limit: 8192,
					name: 'img/[name].[hash:4].[ext]'
				}
			},
			{
				test: /\.(woff|woff2|eot|ttf|svg|gif)$/,
				loader: 'url',
				options: {
					limit: 8192,
					name: 'font/[name].[hash:4].[ext]'
				}
			}
		]
	},
	plugins: [
		// 提取css
		new ExtractTextPlugin('style.[hash:4].css'),

		// 将打包后的资源注入到html文件内
		new HtmlWebpackPlugin({
			template: resolve('../app/index.html')
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'common', // 入口文件名
			filename: 'common.bundle.js', // 打包后的文件名
			minChunks: function(module, count) {
				return (
					module.resource &&
					/\.js$/.test(module.resource) &&
					module.resource.indexOf(resolve('../node_modules')) === 0
				);
			}
		}),
		new webpack.optimize.CommonsChunkPlugin({
			async: 'async-common',
			minChunks: 3
		})
	]
};

module.exports = webpackConfigBase;
