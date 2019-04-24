//引入主控提供的httpRequest方法
import { remote } from 'electron';
const { httpRequest } = remote.require('./util/http-request');

// 获取组织信息
import { getUrlProps } from './main';
const piUuid = remote.getGlobal("sharedObject").userenv.uuid;
const piName = remote.getGlobal("sharedObject").userenv.realName;

//获取审批人
export const getMember = async () => {
	let query = {
		query: `{
			a:allOrganizationMembers(
				condition:{omIfme:true  omAust:ALPA}
				filter: {piUuid: {notIn: "${piUuid}"}}
			){
				nodes{
					piUuid
					omName
				}
			}
		}`
	};
	const request = {
		object: "organization",
		service_name: "adm_data_service",
		params: query,
		organization_uuid: getUrlProps().orgUuid
	};

	return await httpRequest(request).then(res => {
		return {
			statusCode: res.statusCode,
			message: res.message,
			result: res.statusCode === 0 && res.result.a ? res.result.a.nodes : res.result
		};
	});
};

//获取抄送人
export const getCc = async () => {
	let query = {
		query: `{
			a:allOrganizationMembers(orderBy:OM_NAME_ASC 
				condition:{omAust:ALPA}
			){
				nodes{
					piUuid
					omName
				}
			}
		  }`
	};
	const request = {
		object: "organization",
		service_name: "adm_data_service",
		params: query,
		organization_uuid: getUrlProps().orgUuid
	};

	return await httpRequest(request).then(res => {
		return {
			statusCode: res.statusCode,
			message: res.message,
			result: res.statusCode === 0 && res.result.a ? res.result.a.nodes : res.result
		};
	});
};

// 查类别
export const getCategory = async () => {
	let query = {
		query: `{
            a:allExpenseCategories(orderBy:EX_CREA_DESC
                condition:{
                    exEnab:true
                }
            ){
				nodes{
					exCode     #费用类别编码
					exName     #费用类别名称
					piUuid     #类别创建人UUID
					piName     #类别创建人
					exCrea     #创建时间
					exEnab     #是否启用
					exDesc     #类别描述 
				}
			}
		}`
	};
	const request = {
		object: "organization",
		service_name: "adm_data_service",
		params: query,
		organization_uuid: getUrlProps().orgUuid
	};

	return await httpRequest(request).then(res => {
		return {
			statusCode: res.statusCode,
			message: res.message,
			result: res.statusCode === 0 && res.result.a ? res.result.a.nodes : res.result
		};
	});
};


function formatArr(arr) {
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
// 申请报销
export const applyReimbursement = async (values,courseList) => {
	let query = {
		query: `mutation{
			updateExpenseReimburseAskInfo(input:{
				ireName:"${values.aa.title}"   #费用名称  
				${
					values.aa.introduction ? `ireDesc:"${values.aa.introduction.replace(/\n/g,'\\n')}"` : ""
				}
				ireItem:${formatArr(courseList)}  #费用项明细
				ipmUshr:"${values.aa.approver.key.split("/")[0]}"   #审批人UUID
				ipmPshr:"${values.aa.approver.key.split("/")[1]}"   #审批人
				#ipmCsrr:""   #抄送人
				ipiUuid:"${piUuid}"   #操作人UUID
				ipiName:"${piName}"   #操作人
				reProd:1     #费用状态（0 撤销 1 审批中 2 驳回 3 审批通过（待报销） 4 已发放 5 确认已收（已报销）
			}){
			  	uuid
			}
		}`
	};
	const request = {
		object: "organization",
		service_name: "adm_data_service",
		params: query,
		organization_uuid: getUrlProps().orgUuid
	};

	return await httpRequest(request).then(res => {
		return {
			statusCode: res.statusCode,
			message: res.message,
			result: res.statusCode === 0 && res.result ? res.result : res.result
		};
	});
};

// 查欠钱
export const getMomeny = async (values,courseList) => {
	let query = {
		query: `{
			calcRepayment(ipiUuid:"${piUuid}")
		  }`
	};
	const request = {
		object: "organization",
		service_name: "adm_data_service",
		params: query,
		organization_uuid: getUrlProps().orgUuid
	};

	return await httpRequest(request).then(res => {
		return {
			statusCode: res.statusCode,
			message: res.message,
			result: res.statusCode === 0 && res.result ? res.result : res.result
		};
	});
};