export default {
	//应用布局路由
	layout: [ {
		path:"/message",
		page:"message"
	}],
	//应用左侧菜单路由
	menu: {
		title: '办公用品',
		icon: '',
		defautPath: '/',
		defautPage: '',
		subMenu: [
			{
				title: '费用报销申请',
				path: '/apply',
				icon: '',
				page: 'apply'
			},
			{
				title: '我的报销',
				path: '/reimbursement',
				icon: '',
				page: 'reimbursement'
			},
		]
	},
	message:[
		{
			path:"/message/deal",
			page:"deal"
		},{
			path:"/message/cc",
			page:"cc"
		}
	]
};
