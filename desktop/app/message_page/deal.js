import React from "react";
import { remote, ipcRenderer } from "electron";
import {  message,  Row, Input, Table,  Col,  Button, Modal, Form, Select } from 'antd';
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
            dataIndex: 'aoTime',
            key: 'aoTime',
            align: 'center',
            render:text => moment(text).format("YYYY-MM-DD")
        },{
            title: '费用报销说明',
            dataIndex: 'reDesc',
            key: 'reDesc',
            align: 'center'
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
		console.log(data)
		this.setState({
			member:data.result,
		})
	}
	//同意
	agree = async () => {
		console.log(this.state.data)
		this.setState({
			visible:true,
			num:3
		})
	}
	handleOk = () => {
		this.props.form.validateFields(["aa"],async (err, values) => {
			if(!err){
				console.log(values)
				if(this.state.num==3){
					//同意
					let id = this.state.list[0].reUuid;
					let name = this.state.data.receiverName;
					let uuid = this.state.data.receiverUuid;
					let res = await cancal(id,name,uuid,3);
					console.log(res)
					if(!res.statusCode && res.result){
						message.success("操作成功")
						let data = await updateMessageStatus(
							this.state.data.messageUuid
						);
						fromWindow.webContents.send("from-ipc-message", {
							orgUuid: this.state.data.orgUuid,
							messageUuid: this.state.data.messageUuid,
							messageStatus: data.result.messageStatus
						});
						setTimeout(() => {
							window.close();
						}, 2000);
					}else{
						message.error("操作失败")
					}
				}
				if(this.state.num==4){
					//驳回
					let id = this.state.list[0].reUuid;
					let name = this.state.data.receiverName;
					let uuid = this.state.data.receiverUuid;
					let res = await cancal(id,name,uuid,4);
					if(!res.statusCode && res.result){
						message.success("操作成功")
						let data = await updateMessageStatus(
							this.state.data.messageUuid
						);
						fromWindow.webContents.send("from-ipc-message", {
							orgUuid: this.state.data.orgUuid,
							messageUuid: this.state.data.messageUuid,
							messageStatus: data.result.messageStatus
						});
						setTimeout(() => {
							window.close();
						}, 2000);
					}
				}
				
			}
		})
	}
	// //转发
	forward = () => {
		this.setState({
			forwarVdisible:true
		})
	}
	forwarHandleOk = () => {
		this.props.form.validateFields(["bb"], async (err, values) => {
			if(!err){
				let id = this.state.list[0].reUuid;
				let name = this.state.data.receiverName;
				let uuid = this.state.data.receiverUuid;
				let res = await cancal(id,name,uuid,5);
				console.log(res);
				if(!res.statusCode && res.result){
					var data = {
						receiverUuid: values.bb.approver.split("/")[0],
						receiverName: values.bb.approver.split("/")[1],
						receiverAvatarHash: "",
						messageText: "有费用报销，请审批！",
						messageType: "费用报销",
						applicationUuid: this.state.data.applicationUuid,
						applicationHash: this.state.data.applicationHash,
						commands: [
							{
								title: "审批人查看",
								type: "open-window",
								params: `{
									orgUuid: "${this.state.data.orgUuid}",
									appUuid: "${this.state.data.appUuid}",
									reUuid: "${this.state.list[0].reUuid}"
								}`,
								urlPath: "message/deal"
							}
						]
					};
					let res1 = await createMessages(data);
					if (res1.statusCode !== 0) {
						return message.error("转发消息发送失败!");
					} else {
						let data = await updateMessageStatus(
							this.state.data.messageUuid
						);
						fromWindow.webContents.send("from-ipc-message", {
							orgUuid: this.state.data.orgUuid,
							messageUuid: this.state.data.messageUuid,
							messageStatus: data.result.messageStatus
						});
						message.success("转发成功");
						setTimeout(() => {
							window.close();
						}, 2000);
					}
				}
				
			}
		})
	}
	// //驳回
	reject = async () => {
		this.setState({
			visible:true,
			num:4
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
		console.log(index)
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
				align:"center"
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
		console.log("原始数据",this.state.list)
		let goodsList = this.state.list[index].reItem.map(item => {
			return {
				...item
			}
		})
		
    	return(
			<Table
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
					marginTop:"-88px",
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
						<Button type="primary" style={{marginLeft:12,marginTop:20,display:`${this.state.otherDisplay}`}} onClick={this.agree}>同意</Button>
						<Button type="primary" style={{marginLeft:12,marginTop:20,display:`${this.state.otherDisplay}`}} onClick={this.forward}>转发</Button>
						<Button type="primary" style={{marginLeft:12,marginTop:20,display:`${this.state.otherDisplay}`}} onClick={this.reject}>驳回</Button>
						<Button type="primary" style={{marginLeft:12,marginTop:20,display:`${this.state.display}`}} onClick={this.read}>已读</Button>
					</Row>
					<Modal
						title="备注"
						visible={this.state.visible}
						onOk={this.handleOk}
						onCancel={() => {
							this.setState({
								visible:false
							})
						}}
					>
						<Form>
							<FormItem label="备注">
							{
								getFieldDecorator('aa.description',{
									rules:[
										{
											required:true,
											message:'备注不能为空'
										}
									]
								})(
									<TextArea />
								)
							}
							</FormItem>
						</Form>
					</Modal>
					<Modal
						title="转发"
						visible={this.state.forwarVdisible}
						onOk={this.forwarHandleOk}
						onCancel={() => {
							this.setState({
								forwarVdisible:false
							})
						}}
					>
						<Form>
							<FormItem label="备注">
							{
								getFieldDecorator('bb.description',{
									rules:[
										{
											required:true,
											message:'备注不能为空'
										}
									]
								})(
									<TextArea />
								)
							}
							</FormItem>
							<FormItem label="审批人">
							{
								getFieldDecorator('bb.approver',{
									rules:[
										{
											required:true,
											message:'审批人不能为空'
										}
									]
								})(
									<Select>
										{
											this.state.member.length >0 ? this.state.member.map((val,key) => {
												return(
													<Option key={key} value={val.piUuid+"/"+val.omName}>{val.omName}</Option>
												)
											}) : null
										}
									</Select>
								)
							}
							</FormItem>
						</Form>
					</Modal>
				</Row>
			</div>
		);
	}
}
