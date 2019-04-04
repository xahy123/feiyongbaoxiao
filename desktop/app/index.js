import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';

import MainLayout from './layout/main.js';
import routers from './routers.js';

import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

ReactDOM.render(
	<LocaleProvider locale={zh_CN}>
		<HashRouter>
			<Switch>
				{routers.layout.map((item, index) => {
					return <Route path={item.path} component={require(`./layout/${item.page}`)} key={index} />;
				})}
				<Route path="/" component={MainLayout} />
			</Switch>
		</HashRouter>
	</LocaleProvider>,
	document.getElementById('root')
);
