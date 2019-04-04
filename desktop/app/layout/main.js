import React, { Component } from 'react';
import url from 'url';
import { Redirect, Route, Link, Switch } from 'react-router-dom';
import { Layout, Menu, Icon, Avatar, message } from 'antd';
import { ipcRenderer, remote } from 'electron';
const { httpRequest } = remote.require('./util/http-request');

const { SubMenu } = Menu;
const { Sider, Content } = Layout;

// 导入应用全局样式
import '../assets/style/app.css';

// 导入应用路由数据
import routers from '../routers';

//导入service
import { getApplicationByAppUuid, getOrganizationByOrgUuid } from '../services/main';

// 获取菜单
const menus = routers.menu.subMenu ? routers.menu.subMenu : [];

export default class MainLayout extends Component {
	state = {
		orgInfo: {},
		appInfo: {},
		selectedKeys: [],
		collapsed: false, // 左侧边栏的收缩控制
		routers: [] // 路由数据
	};

	// 左侧边栏的收缩控制函数
	toggle = () => {
		this.setState({ collapsed: !this.state.collapsed });
	};

	// 获取所有path及page
	getAllPathAndComponent = (arr) => {
		let pathAndComponent = [];

		arr.map((item) => {
			// 获取一级path、page及title
			let outObj = {};
			item.path ? (outObj.path = item.path) : '';
			item.page ? (outObj.page = item.page) : '';
			item.title ? (outObj.title = item.title) : '';
			outObj.path ? pathAndComponent.push(outObj) : '';
			item.subMenu
				? item.subMenu.map((subitem) => {
						//获取二级path、page及title
						let middleObj = {};
						subitem.path ? (middleObj.path = subitem.path) : '';
						subitem.page ? (middleObj.page = subitem.page) : '';
						subitem.title ? (middleObj.title = subitem.title) : '';
						middleObj.path ? pathAndComponent.push(middleObj) : '';
						subitem.subMenu
							? subitem.subMenu.map((subsubitem) => {
									//获取三级path、page及title
									let innerObj = {};
									subsubitem.path ? (innerObj.path = subsubitem.path) : '';
									subsubitem.page ? (innerObj.page = subsubitem.page) : '';
									subsubitem.title ? (innerObj.title = subsubitem.title) : '';
									innerObj.path ? pathAndComponent.push(innerObj) : '';
								})
							: '';
					})
				: '';
		});
		return pathAndComponent;
	};

	// 从子页面跳转路由时动态更新菜单选择
	changeMenuSelected = (title) => {
		this.setState({ selectedKeys: [ `1-${title}`, `2-${title}`, `3-${title}` ] });
	};

	// 组件加载前获取路由数据
	async componentWillMount() {
		this.setState({ routers: this.getAllPathAndComponent(menus) });
		this.changeMenuSelected('应用信息');
	}

	async componentDidMount() {
		const appInfo = await getApplicationByAppUuid();
		if (appInfo.statusCode !== 0) {
			return message.error(appInfo.message);
		}
		const orgInfo = await getOrganizationByOrgUuid();
		if (orgInfo.statusCode !== 0) {
			return message.error(orgInfo.message);
		}
		this.setState(
			{
				appInfo: {
					...appInfo.result,
				},
				orgInfo: {
					...orgInfo.result,
				}
			}
		);
		document.title = orgInfo.result.oiOrna;
	}

	render() {
		return (
			<Layout>
				<Layout>
					<Sider
						className="left-menu"
						style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 2 }}
						theme="light"
						trigger={null}
						collapsible
						collapsed={this.state.collapsed}
					>
						<div
							style={{
								float: 'left',
								width: this.state.collapsed ? 79 : 199,
								height: 64,
								backgroundColor: '#fafafa'
							}}
						>
							<div className="app-name">
								{this.state.appInfo.aiIcon && this.state.appInfo.aiIcon.hash ? (
									<Avatar
										shape="square"
										src={`http://127.0.0.1:8080/ipfs/${this.state.appInfo.aiIcon.hash}`}
									/>
								) : (
									<Avatar shape="square" size={32} icon="radar-chart"/>
								)}
								<h1 className="app-name-h1">{this.state.appInfo.aiName ? this.state.appInfo.aiName : routers.menu.title}</h1>
							</div>
						</div>
						<Menu
							mode="inline"
							selectedKeys={this.state.selectedKeys}
							onSelect={({ item, key, selectedKeys }) => {
								this.setState({
									selectedKeys: selectedKeys
								});
							}}
						>
							{menus.map((menu, index) => {
								// 判断一级菜单下是否有子菜单
								if (menu.subMenu && menu.subMenu.length) {
									return (
										<SubMenu
											key={`1-${menu.title}`}
											title={
												<span>
													<Icon type={menu.icon ? menu.icon : 'bars'} />
													<span>{menu.title}</span>
												</span>
											}
										>
											{menu.subMenu.map((submenu, index) => {
												// 判断二级菜单下是否有子菜单
												if (submenu.subMenu && submenu.subMenu.length) {
													return (
														<SubMenu
															key={`2-${submenu.title}`}
															title={
																<span>
																	<span>{submenu.title}</span>
																</span>
															}
														>
															{submenu.subMenu.map((subsubmenu, index) => {
																return (
																	<Menu.Item key={`3-${subsubmenu.title}`}>
																		<Link to={`${subsubmenu.path}`} replace>
																			<span>{subsubmenu.title}</span>
																		</Link>
																	</Menu.Item>
																);
															})}
														</SubMenu>
													);
												} else {
													return (
														<Menu.Item key={`2-${submenu.title}`}>
															<Link to={`${submenu.path}`} replace>
																<span>{submenu.title}</span>
															</Link>
														</Menu.Item>
													);
												}
											})}
										</SubMenu>
									);
								} else {
									return (
										<Menu.Item key={`1-${menu.title}`}>
											<Link to={`${menu.path}`} replace>
												<Icon type={menu.icon ? menu.icon : 'bars'} />
												<span>{menu.title}</span>
											</Link>
										</Menu.Item>
									);
								}
							})}
						</Menu>
					</Sider>
					<Content
						className="workspace"
						style={{
							overflow: 'auto',
							position: 'fixed',
							paddingLeft: 5,
							left: this.state.collapsed ? 80 : 200,
							top: 2,
							right: 0,
							bottom: 0
						}}
					>
						<Switch>
							{/*左侧边栏的路由*/}
							{this.state.routers.map((item, index) => {
								if (item.page) {
									const Component = require(`../pages/${item.page}`);
									return (
										<Route
											key={index}
											path={item.path}
											render={() => (
												<Component
													change={(value) => {
														this.toggle(value);
													}}
													{...this.props}
													{...this.state}
													title={item.title}
													currentPath={item.path}
													changeMenuSelected={this.changeMenuSelected}
												/>
											)}
										/>
									);
								}
							})}
							{/* 默认展示路由 */}
							<Route path="/" render={() => <Redirect to={this.state.routers[0].path} />} />
						</Switch>
					</Content>
				</Layout>
			</Layout>
		);
	}
}
