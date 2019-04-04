import React, { Component } from 'react';
import { Layout, Drawer, Icon } from 'antd';
import AppSwitch from '../pages/app.switch';

const { Header } = Layout;

const { BrowserWindow } = require('electron').remote;

export default class AppHeader extends Component {
	state = { drawerVisible: false };

	// 窗口最小化
	minimize = () => {
		let win = BrowserWindow.getFocusedWindow();
		win.minimize();
	};

	// 窗口最大化
	maximize = () => {
		let win = BrowserWindow.getFocusedWindow();
		if (win.isMaximized()) {
			win.unmaximize();
		} else {
			win.maximize();
		}
	};

	// 窗口关闭
	close = () => {
		let win = BrowserWindow.getFocusedWindow();
		win.destroy();
	};

	showDrawer = async () => {
		this.setState({ drawerVisible: !this.state.drawerVisible });
	};

	onDrawerClose = () => {
		this.setState({ drawerVisible: false });
	};

	render() {
		return (
			<div>
				<Header
					className="app-header"
					style={{ position: 'fixed', zIndex: 1, width: '100%', paddingLeft: 30 }}
					onDoubleClick={this.maximize}
				>
					<div className="app-header-org-name">
						{this.props.orgInfo.org_name ? this.props.orgInfo.org_name : '元数科技'}
					</div>
					<div className="app-header-win-ctrl">
						<Icon
							type="appstore-o"
							title="切换应用"
							style={{ paddingTop: 5, paddingRight: 30 }}
							onClick={() => {
								this.showDrawer();
							}}
						/>
						<Icon type="minus" onClick={this.minimize} style={{ paddingRight: 10 }} />
						<Icon type="plus" onClick={this.maximize} style={{ paddingRight: 10 }} />
						<Icon type="close" onClick={this.close} style={{ paddingRight: 10 }} />
					</div>
				</Header>
				<Drawer
					className="workspace"
					width={500}
					placement="right"
					closable={false}
					onClose={this.onDrawerClose}
					visible={this.state.drawerVisible}
				>
					<AppSwitch {...this.props} {...this.state}/>
				</Drawer>
			</div>
		);
	}
}