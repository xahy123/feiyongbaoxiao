import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";

// 导入应用路由数据
import routers from "../routers";

//导入service
import {
	getApplicationByAppUuid,
	getOrganizationByOrgUuid
} from "../services/main";

export default class MainLayout extends Component {
	async componentDidMount() {
		const orgInfo = await getOrganizationByOrgUuid();
		if (orgInfo.statusCode !== 0) {
			return message.error(orgInfo.message);
		}
		document.title = orgInfo.result.oiOrna;
	}

	render() {
		return (
			<Switch>
				{routers.message &&
					routers.message.map(item => {
						const { path, page } = item;
						const Component = require(`../message_page/${page}`);
						return (
							<Route
								key={page}
								path={path}
								render={() => <Component />}
							/>
						);
					})}
			</Switch>
		);
	}
}
