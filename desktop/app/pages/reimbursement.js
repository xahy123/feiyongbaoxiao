//我的申请
import React, { Component } from 'react';
import { Table, Form, Row, Col, Modal , Select, Input, Button, DatePicker, Tooltip, message} from 'antd';
import MainHeader from '../components/main.header';
// 获取组织uuid
import { getUrlProps } from '../services/main';
import moment from 'moment'
const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;
import * as service from '../services/reimbursement';
const  drApstType = new Map([
	[1,"审核中"],
	[3,"审批通过（待报销）"],
	[2,"已驳回"],
	[0,"已撤回"],
	[4,"已发放"],
	[5,"确认已收"],
])
//收货的
const  receipt = new Map([
	[true,"已收"],
	[false,"未收"],
])
// const TypeList = new Map([1："sds"])
// TypeList.get()
@Form.create() //为了使用 this.props.form 所需要的
export default class onDuty extends Component {
	state = { 
		data:[],                      // 所有数据
		isClose:false,
		loading:true,
		record:[],
		goodsList:[],
		isPicturePreviewShow:false,
		newGoodsList:[]
	};
	columns = [
		{
            title: '费用名称',
            dataIndex: 'reName',
            key: 'reName',
            align: 'center',
        },{
            title: '费用报销说明',
            dataIndex: 'reDesc',
            key: 'reDesc',
			align: 'center',
			render:text => {
				if(text){
					if(text.length>7){
						return (
							<Tooltip title={text}>
								<span>{text.substring(0,7)}……</span>
							</Tooltip>
						)
					}else{
						return <span>{text}</span>
					}
				}else{
					return <span>未填写</span>
				}
			}
        },{
            title: '总额（元）',
            key: 'reJine',
            dataIndex: 'reJine',
            align: 'center',
            // render:(text,record) => {
            // 	return <span>{drApstType.get(text)}</span>
            // }
        }, {
            title: '创建时间',
            dataIndex: 'reCrea',
            key: 'reCrea',
			align: 'center',
			render: text => moment(text).format("YYYY-MM-DD")
        },{
            title: '状态',
            key: 'reStat',
            dataIndex: 'reStat',
            align: 'center',
            render:text => drApstType.get(text)
        }, {
        	title:'操作',
        	key:'action',
        	align:'center',
        	render:(text,record) => {
				if(record.reStat == 1){
					return (
						<span>
							<a href="javascript:;" style={{paddingLeft:8}} onClick={() => this.withdraw(record.reUuid)}>撤回</a>
						</span>
					)
				}else if(record.reStat == 4){
					return (
						<span>
							<a href="javascript:;" style={{paddingLeft:8}} onClick={() => this.confirm(record.reUuid)}>确认收款</a>
						</span>
					)
				}else{
					return (
						<span>无</span>
					)
				}
			}
        }
	];
	//撤回
	withdraw = async (id) => {
		let data = await service.cancal(id,6);
		if(!data.statusCode && data.result) {
			message.success("操作成功")
			let condition = {
				num:1
			};
			this.getInit(condition)
		}else{
			message.error("操作失败"+data.message)
		}
	}
	confirm = async (id) => {
		let data = await service.cancal(id,8);
		if(!data.statusCode && data.result) {
			message.success("操作成功")
			let condition = {
				num:1
			};
			this.getInit(condition)
		}else{
			message.error("操作失败"+data.message)
		}
	}
	async componentDidMount() {
		let condition = {
			num:1
		};
		this.getInit(condition)
	}
	getInit = async (condition) => {
		let res = await service.getMyApply(condition);
		this.setState({
			data:res.result,
			loading:false
		})
	}
	expandedRowRender = (record,index) => {
		const columns=[
			{
				title: '费用类别',
				dataIndex: 'title',
				key: 'title',
				align:"center"
			}, {
				title: '说明',
				dataIndex: 'description',
				key: 'description',
				align:"center",
				render:text => {
					if(text.length>7){
						return (
							<Tooltip title={text}>
								<span>{text.substring(0,7)}……</span>
							</Tooltip>
						)
					}else{
						return <span>{text}</span>
					}
				}
			}, {
				title: '报销金额（元）',
				dataIndex: 'price',
				key: 'price',
				align:"center",
			}, {
				title: '费用凭证',
				key: 'fujian',
				dataIndex: 'fujian',
				align:"center",
				render:(text,record) => {
					return (
						JSON.parse(record.fujian).map((item,index) => {
							return (
								<a
									key={index}
									onClick={() => {
										this.setState({
											isPicturePreviewShow: true,
											previewImgUrl:item.url
										});
									}}
									style={{ marginRight: 5 }}
								>
									附件{index+1}
								</a>
							)
						})
						
					);
				}
			}]
		let goodsList = this.state.data[index].reItem.map(item => {
			return {
				...item
			}
		})
		
    	return(
			<Table
				columns={columns}
				style={{margin:0}}
				rowKey={record => record.id}
        		dataSource={goodsList}
        		pagination={false}
      		/>
    	)
	}
	//查询
	handleFilter = () => {
		this.props.form.validateFields(["bb"],(err, values) => {
			if(!err){
				this.setState({
					loading:true
				},async () => {
					let condition = {
						reStat:values.bb.status,
						reName:values.bb.name,
						num:2,
						time:values.bb.time && values.bb.time.length
									? [
											values.bb.time[0].format(
												"YYYY-MM-DDT00:00:00"
											),
											values.bb.time[1].format(
												"YYYY-MM-DDT23:59:59"
											)
									  ]
									: undefined
					};
					this.getInit(condition)
				})
			}
		})
	}
	//重置
	handleReset = async () => {
		this.props.form.resetFields();
		this.setState({
			loading:true
		},() => {
			let condition = {
				num:1
			};
			this.getInit(condition)
		})
	}
	render() {
		const { getFieldDecorator } = this.props.form;
		return (
			<div style={{marginBottom:50}}>
				<MainHeader changeToggle={this.props.change} title={this.props.title} />
				<Form className="ant-advanced-search-form">
					<Row gutter={24}>
						<Col span={8} offset={1}>
							<FormItem label="费用名称">
								{
                            		getFieldDecorator('bb.name',{
                            		})(
                            			<Input placeholder="请输入"/>
                            		)
								}
                        	</FormItem>
						</Col>
						<Col span={8}>
							<FormItem label="状态">
								{
									getFieldDecorator('bb.status',{
									})(
										<Select>
											<Option value='3'>审批通过（待报销）</Option>
											<Option value='0'>已撤回</Option>
											<Option value='4'>已发放</Option>
											<Option value='5'>确认已收</Option>
											<Option value='1'>审核中</Option>
											<Option value='2'>已驳回</Option>
										</Select>
									)
								}
							</FormItem>
						</Col>
					</Row>
					<Row gutter={24}>
						<Col span={8} offset={1}>
							<FormItem label="创建时间">
								{
									getFieldDecorator('bb.time',{
									})(
										<RangePicker/>
									)
								}
							</FormItem>
						</Col>
						<Col span={7} >
							<FormItem>
								<Button type="primary" type="primary" onClick={this.handleFilter}>查询</Button>
								<Button style={{marginLeft : 8 }} onClick={this.handleReset}>
									重置
								</Button>
							</FormItem>
						</Col>
					</Row>	
				</Form>
				<Row>
					<Table 
						size="middle"
						loading={this.state.loading}
						columns={this.columns} 
						dataSource={this.state.data}
						rowKey={record => record.reUuid}
						pagination={{ showSizeChanger: true, showQuickJumper: true }}
						expandedRowRender={this.expandedRowRender}
					/>
				</Row>
				<Modal
					visible={this.state.isPicturePreviewShow}
					footer={null}
					destroyOnClose
					onCancel={() => {
						this.setState({
							isPicturePreviewShow: false
						});
					}}
				>
					<img
						src={this.state.previewImgUrl}
						alt={this.state.previewImgUrl}
						style={{ width: "100%", height: "auto" }}
					/>
				</Modal>
			</div>
		);
	}
}
