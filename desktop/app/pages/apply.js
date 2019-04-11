// 新增课件
import React from 'react';
import {ipcRenderer} from 'electron';
import MainHeader from '../components/main.header';
import * as service from '../services/apply';
import { Button, Form, Select, Input, Upload, message, Row, Col, Icon, Modal, Drawer, Table, Divider } from 'antd';
import { createMessages,createMuchMessages } from '../services/message';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

// import {getAllApprover} from '../services/common';
// import * as service from '../services/party.new_courseware';
import Message from '../services/message';
import moment from 'moment';


@Form.create()
export default class PartyMyContribution extends React.Component {
	state={
		data:[],
		visible: false,
		allApprover:[],
		fileList1:[],
		category:[],
		member:[],
		cc:[],
		courseList:[],//明细
		money:undefined,
		total:undefined,
		isPicturePreviewShow:false,
		isMoneyShow:false
	}

	columns=[
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
					Array.isArray(record.fujian) ? record.fujian.map((item,index) => {
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
					}) : null
					
				);
			}
		},{
			title: '操作',
			key: 'action',
			dataIndex: 'action',
			align:"center",
			render: (text,record,index) => (
				<span>
					<a onClick={() => this.deleteCourse(index) }>删除 </a>
				</span>
			),
		}]
		deleteCourse = (index) => {
			let data = this.state.courseList;
			data.splice(index,1);
			this.setState({
				courseList:data
			})
		}
	/*提交表单*/
	onSubmit = async () => {
		this.props.form.validateFields(["aa"],async (err, values) => {
			if (!err) {
				if(this.state.courseList.length>0){
					let price = [];
					this.state.courseList.map(item => {
						price.push(Number(item.price))
					});
					//报销总额
					const total = price.reduce((prev, cur)=>{
						return prev + cur;
					},0) //10 
					let newCourseList = this.state.courseList.map(item => {
						item.fujian ? item.fujian = JSON.stringify(item.fujian).replace(/\"/g, '\\"') : null
						item.description ? item.description = item.description.replace(/\n/g,'\\n') : null
						return item
					})
					let res = await service.applyReimbursement(values,newCourseList);
					if(!res.statusCode){
						if(res.result.updateExpenseReimburseAskInfo){
							message.success("提交成功");
							this.setState({
								courseList:[],
								fileList1:[],
								total,
								isMoneyShow:true
							})
							
							this.props.form.resetFields();
							var data = {
								receiverUuid: values.aa.approver.key.split("/")[0],
								receiverName: values.aa.approver.label,
								receiverAvatarHash: "",
								messageText: "有费用报销，请审批！",
								messageType: "费用报销",
								applicationUuid: this.props.appInfo.aiUuid,
								applicationHash: this.props.appInfo.veHash,
								commands: [
									{
										title: "审批人查看",
										type: "open-window",
										params: `{
											orgUuid: "${this.props.orgInfo.oiUuid}",
											appUuid: "${this.props.appInfo.aiUuid}",
											reUuid: "${res.result.updateExpenseReimburseAskInfo.uuid}"
										}`,
										urlPath: "message/deal"
									}
								]
							};

							let res2 = await createMessages(data);

							var data2 = {
								receiverAvatarHash: "",
								messageText: "有费用报销，请审批！",
								messageType: "费用报销",
								applicationUuid: this.props.appInfo.aiUuid,
								applicationHash: this.props.appInfo.veHash,
								commands: [
									{
										title: "抄送人查看",
										type: "open-window",
										params: `{
											orgUuid: "${this.props.orgInfo.oiUuid}",
											appUuid: "${this.props.appInfo.aiUuid}",
											reUuid: "${res.result.updateExpenseReimburseAskInfo.uuid}"
										}`,
										urlPath: "message/cc"
									}
								]
							};
							//抄送人
							if (values.aa.cc) {
								if (values.aa.cc.length > 0) {
									let person = values.aa.cc.map(item => {
										return {
											id: item.key.split("/")[0],
											name: item.key.split("/")[1]
										};
									});
									let newRes = await createMuchMessages(
										data2,
										person
									);
									if (res2.statusCode !== 0) {
										return message.error("费用报销通知发送失败!");
									}
								}
							}
						}else{
							message.error("提交失败,同一费用类别下，只能有一次报销明细")
						}
					}else{
						message.error("提交失败"+res.message)
					}
				}else{
					return message.info('请新增报销明细')
				}
			}
		});
	};

	async componentDidMount(){
		let res = await service.getCategory();
		let data = await service.getMember();
		let res2 = await service.getMomeny();
		let cc = await service.getCc();
		this.setState({
			category:res.result,
			member:data.result,
			money:res2.result.calcRepayment,
			cc:cc.result
		})
	}

	getAllApprover = async()=> {
		// const allApprover = await getAllApprover();
		// if(allApprover.statusCode!==0){
		// 	return message.error(allApprover.message);
		// }
		// this.setState({allApprover:allApprover.result});
	}

	formatArr = (arr) => {
	    let str = '';
	    let objs = [];
	    arr.forEach(item => {
	        let tmp = '{';
	        Object.keys(item).forEach(key => {
	            tmp += `${key}: "${item[key]}",`;
	        });
	        tmp += '}';
	        objs.push(tmp);
	    });
	    str = `[${objs.join(',')}]`;
	    return str
	}

	handleSublimt = () => {
		this.props.form.validateFields(["bb"],async (err, values) => {
			if(!err){
				let data = this.state.courseList;
				data.push({
					title:values.bb.title,
					price:values.bb.price,
					description:values.bb.description,
					id:moment().format("YYYY-MM-DD HH:MM:SS"),
					fujian:this.state.fileList1,
					
				});
				
				this.setState({
					courseList:data,
					visible:false,
					fileList1:[]
				},() => {
					this.props.form.resetFields(["bb"]);
				})
			}
		})
	}
	


	

	showDrawer = async () => {
        this.setState({
            visible: true
		});
    }

    onClose = () => {
		this.props.form.resetFields(["bb"]);
        this.setState({
            visible: false,
        });
        
    }

	render() {
		const { getFieldDecorator } = this.props.form;
		const { allApprover,detail } = this.state;
		const span = this.props.contributionId?24:12;
		return (
			<div>
				<MainHeader
                    {...this.state}
                    changeToggle={this.props.change}
                    title={this.props.title}
                    changeHelpVisible={this.changeHelpVisible}
                />
				<Form>
					<Row type="flex" justify="center">
						<Col span={span}>
							<FormItem label="费用名称">
								{getFieldDecorator('aa.title', {
									rules: [
										{
											required: true,
											message: '请输入费用名称!',
											whitespace: true,
										}
									],
								})(<Input placeholder="请输入费用名称"/>)}
							</FormItem>
						</Col>
					</Row>
					
					<Row type="flex" justify="center">
						<Col span={span}>
							<FormItem label="费用报销说明">
								{getFieldDecorator('aa.introduction', {
									rules: [
										{
											required: true,
											message: '请输入费用报销说明!',
											whitespace: true,
										}
									],
								})(<TextArea placeholder="请输入费用报销说明" autosize={{ minRows: 2, maxRows: 6 }} />)}
							</FormItem>
						</Col>
					</Row>

					<Row type="flex" justify="center">
						<Col span={span}>
							<FormItem label="审批人">
								{
									getFieldDecorator('aa.approver', {
										rules: [{
											required: true,
											message: '请选择审批人'
										}],

									})(
										<Select
											placeholder="请选择"
											labelInValue
											style={{ width: '100%' }}
											getPopupContainer={triggerNode => triggerNode.parentNode}
										>
										{
											this.state.member.length>0 ? this.state.member.map(item => {
												return (
													<Option value={item.piUuid+"/"+item.omName} key={item.piUuid}>
														{item.omName}
													</Option>
												)
											}) : null
										}
									</Select>
									)
								}
							</FormItem>
						</Col>
					</Row>

					<Row type="flex" justify="center">
						<Col span={span}>
							<FormItem label="抄送人">
								{
									getFieldDecorator('aa.cc', {
									})(
										<Select
											placeholder="请选择"
											mode="multiple"
											labelInValue
											style={{ width: '100%' }}
											getPopupContainer={triggerNode => triggerNode.parentNode}
										>
										{
											this.state.cc.length>0 ? this.state.cc.map(item => {
												return (
													<Option value={item.piUuid+"/"+item.omName} key={item.piUuid}>
														{item.omName}
													</Option>
												)
											}) : null
										}
									</Select>
									)
								}
							</FormItem>
						</Col>
					</Row>

					<Row type="flex" justify="center">
						<Col span={span}>
							<FormItem label="新增报销明细">
								{getFieldDecorator('aa.add', {
									rules: [
										{
											message: '请选择新增课程!'  
										}
									],
								})(
									<Button type="dashed" 
										onClick={this.showDrawer} 
										style={{ width: '100%' }}>
										<Icon type="plus" />新增报销明细
									</Button>
								)}
							</FormItem>
						</Col>
					</Row>

					<Row type="flex" justify="center">
						<Col span={16}>
						{this.state.courseList&&this.state.courseList.length>0?
							<div className="party-table">
								<Table
									bordered
									size="middle"
									columns={this.columns} 
									dataSource={this.state.courseList}  
									rowKey={(record)=>record.id}
									pagination={{showSizeChanger: true, showQuickJumper: true}}
								/>
							</div>
							:null} 
						
						</Col>
					</Row>
					
					<Row type="flex" justify="center">
						<FormItem style={{ textAlign: 'center' }}>
							<Button onClick={this.onSubmit} type="primary" >
								提交
							</Button>
						</FormItem>
					</Row>
				</Form>
				<Drawer
					width={600}
					title="新增报销明细"
					closable={false}
					onClose={this.onClose}
					visible={this.state.visible}
				>
					<Form>
						<Row type="flex" justify="center">
							<Col span={span}>
								<FormItem label="费用类别">
									{getFieldDecorator('bb.title', {
										rules: [
											{
												required: true,
												message: '请选择费用类别!',
												whitespace: true,
											}
										],
									})(
										<Select>
											{
												this.state.category.length > 0 ? this.state.category.map((item,index) => {
													return (
														<Option key={index} value={item.exName}>{item.exName}</Option>
													)
												}) : null
											}
											
											
										</Select>
									)}
								</FormItem>
							</Col>
						</Row>
						<Row type="flex" justify="center">
							<Col span={span}>
								<FormItem label="说明">
									{
										getFieldDecorator('bb.description',{
											rules: [
												{
													required: true,
													message: '请输入说明!',
													whitespace: true,
												}
											],
										})(
											<TextArea placeholder="如果是商品请填写规格" autosize={{ minRows: 2, maxRows: 6 }} />
										)
									}
								</FormItem>
							</Col>
						</Row>
						<Row type="flex" justify="center">
							<Col span={span}>
								<FormItem label="报销金额">
									{getFieldDecorator('bb.price', {
										rules: [
											{
												required: true,
												pattern:/^[0-9]+(.[0-9]{0,2})?$/,
												message: '请输入报销金额,最多保留两位小数!',
												whitespace: true,
											}
										],
									})(<Input placeholder="请输入报销金额"/>)}
								</FormItem>
							</Col>
						</Row>
						<Row type="flex" justify="center">
							<Col span={span}>
								<FormItem label="费用凭证">
									{getFieldDecorator('bb.fujian', {
										rules: [
											{
												required: true,
												message: "请上传凭证",
											}
										],
									})(
										<Upload
											name="avatar"
											listType="picture-card"
											className="avatar-uploader"
											onPreview={this.handlePreview}
											fileList={this.state.fileList1}
											data={file => ({
													photoWidth: 340, // 通过  handleBeforeUpload 获取 图片的宽高
													photoHeight: 340,
												})
											}
											onRemove={File => {
												this.setState(prevState => {
													return {
														fileList1: prevState.fileList1.filter(
															item => {
																if (
																	item.name !=
																	File.name
																) {
																	return item;
																}
															}
														)
													};
												});
											}}
											onChange={info => {
												// 主控上传图片
												if (
													info &&
													info.file &&
													info.file.path
												) {
													// 获取文件hash
													const fileHashRes = ipcRenderer.sendSync(
														"get-file-hash",
														info.file.path
													);
													// 采用异步方式上传图片
													this.setState(prevState => {
														fileList1: prevState.fileList1.push(
															{
																name: info.file.name,
																uid: info.file.uid,
																status: "done",
																url: `http://127.0.0.1:8080/ipfs/${
																	fileHashRes[
																		fileHashRes.length -
																			1
																	].hash
																}`
															}
														);
													});
													// ipcRenderer.send('upload-file', {
													//   object: 'platform',
													//   filePath: info.file.path,
													// })
												}
											}}
											beforeUpload={file => {
												this.setState({
													fileState: 1
												});
												return false;
											}}
										>
											{this.state.fileList1.length < 5 ? (
												<div>
													<Icon type="plus" />
													<div className="ant-upload-text">
														上传附件
													</div>
												</div>
											) : null}
										</Upload>
									)}
								</FormItem>
							</Col>
						</Row>
						<Row>
							<Col span={2} offset={11}>
								<Button type="primary" onClick={this.handleSublimt}>保存</Button>
							</Col>
						</Row>
					</Form>
				</Drawer>
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
				<Modal
					visible={this.state.isMoneyShow}
					footer={null}
					destroyOnClose
					onCancel={() => {
						this.setState({
							isMoneyShow: false
						});
					}}
				>
					<Row type="flex" justify="center">
						<Col>本次报销总额：</Col>
						<span>{this.state.total}</span>
					</Row>
					<Row type="flex" justify="center">
						<Col>本人欠款总额：</Col>
						<span>{this.state.money}</span>
					</Row>
					<Row type="flex" justify="center">
						<Col>冲抵欠款金额：</Col>
						<span>
							{
								this.state.total > this.state.money ? this.state.money : this.state.total
							}
						</span>
					</Row>
					<Row type="flex" justify="center">
						<Col>本次报销：</Col>
						<span>
							{
								this.state.total > this.state.money ? Number(this.state.total)-Number(this.state.money) : 0
							}
						</span>
					</Row>
				</Modal>
			</div>
		);
	}
}
