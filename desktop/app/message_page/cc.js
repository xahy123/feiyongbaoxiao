import React from "react";
import { remote, ipcRenderer } from "electron";
import {  message,  Row, Input, Tooltip, Table,  Col,  Button, Modal, Form, Select } from 'antd';
import { updateMessageStatus, createMessages} from "../services/message";
import { getRecord, cancal, getMember } from "../services/deal";
import moment from "moment";
const BrowserWindow = remote.BrowserWindow;
let fromWindow = null;
const { TextArea } = Input;
const Option = Select.Option;
const  drApstType = new Map([
	[1,"审核中"],
	[3,"审批通过（待报销）"],
	[2,"已驳回"],
	[0,"已撤回"],
	[4,"已发放"],
	[5,"确认已收"],
])
const FormItem = Form.Item; // form表单
@Form.create()
export default class MessageDeal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data:undefined,
			loading:true,
			isPicturePreviewShow:false,
			list:[],
			visible:false,
			// goods:[],
			num:undefined,
			display:"none",
			otherDisplay:"block",
			// forwarVdisible:false,
			member:[]
		};
	}
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
            title: '总额',
            key: 'reJine',
            dataIndex: 'reJine',
            align: 'center',
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
        }
	];
	async componentDidMount() {
		ipcRenderer.on("get-ipc-data", async (event, data, fromWindowId) => {
            this.setState({data},async () => {
				let res = await getRecord(this.state.data.commands[0].params.reUuid);
				if(!res.statusCode && res.result){
					this.setState({
						loading:false,
						list:res.result
					},async () => {
						if(this.state.list[0].reStat == 0){
							this.setState({
								display:'block',
								otherDisplay:"none"
							})
						}else{
							this.setState({
								display:'none',
								otherDisplay:"block"
							})
						}
					})
				}else{
					message.error("获取数据失败"+res.message)
				}
           
            })
            
			fromWindow = BrowserWindow.fromId(fromWindowId);
		});
		let data = await getMember();
		this.setState({
			member:data.result,
		})
	}
	
	read = async () => {
		let data = await updateMessageStatus(
			this.state.data.messageUuid
		);
		fromWindow.webContents.send("from-ipc-message", {
			orgUuid: this.state.data.orgUuid,
			messageUuid: this.state.data.messageUuid,
			messageStatus: data.result.messageStatus
		});
		message.success("已读");
		setTimeout(() => {
			window.close();
		}, 2000);
	};
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
		let goodsList = this.state.list[index].reItem.map(item => {
			return {
				...item
			}
		})
		
    	return(
			<Table
				style={{margin:0}}
				columns={columns}
				rowKey={record => record.id}
        		dataSource={goodsList}
        		pagination={false}
      		/>
    	)
	}
	render() {
		const { getFieldDecorator } = this.props.form;
		return (
			<div>
				<Row style={{
					position:"absolute",
					top:"50%",
					left:"50%",
					marginTop:"-280px",
					marginLeft:'-200px'
				}}>
					<Row>
						<span style={{fontSize:18,fontWeight:"bolder",color:"#40a9ff"}}>审请人：</span>
						<span style={{fontSize:14}}>{this.state.list.length >0 ? this.state.list[0].piName : "无"}</span>
					</Row>
					<Row style={{marginTop:10}}>
						<span style={{fontSize:18,fontWeight:"bolder",color:"#40a9ff"}}>审请状态：</span>
						<span style={{fontSize:14}}>{this.state.list.length >0 ? drApstType.get(this.state.list[0].reStat) : "无"}</span>
					</Row>
					<Row style={{marginTop:10}}>
						<Table 
							size="middle"
							loading={this.state.loading}
							columns={this.columns} 
							dataSource={this.state.list}
							rowKey={record => record.reUuid}
							pagination={false}
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
					<Row type="flex" justify="center">
						<Button type="primary" style={{marginLeft:12,marginTop:20}} onClick={this.read}>已读</Button>
					</Row>
				</Row>
			</div>
		);
	}
}
