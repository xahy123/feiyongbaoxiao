import React, { Component } from 'react';
import { Layout, Icon } from 'antd';

const { Header } = Layout;

class MainHeader extends Component {
	state = {
		collapsed: false, // 左侧边栏的收缩控制
		routers: [] // 路由数据
	};
	// 左侧边栏的收缩控制函数
	toggle = () => {
		this.setState({
			collapsed: !this.state.collapsed
		});
	};

	render() {
		return (
			<Header
				style={{ background: 'rgb(250, 250, 250)', borderBottom: '1px solid #e8e8e8', paddingLeft: 20, paddingRight: 20 }}
			>
				<Icon
					className="trigger"
					style={{ paddingRight: 10 }}
					type={!this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
					onClick={() => {
						let result = this.toggle();
						this.props.changeToggle(result);
					}}
				/>
				<span style={{ marginLeft: 10 }}>{this.props.title}</span>
				{this.props.showHelp && (
					<div style={{ float: 'right' }}>
					<Icon type="question-circle-o" onClick={() => this.props.changeHelpVisible()}/>
				</div>
				)}
			</Header>
		);
	}
}

export default MainHeader;
