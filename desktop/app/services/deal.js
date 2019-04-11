//引入主控提供的httpRequest方法
import { remote } from 'electron';
const { httpRequest } = remote.require('./util/http-request');

// 获取组织信息
import { getUrlProps } from '../services/main';
const piUuid = remote.getGlobal("sharedObject").userenv.uuid;
const piName = remote.getGlobal("sharedObject").userenv.realName;


export const getRecord = async (id) => {
	let query = {
		query: `
		{
			a:allExpenseReimburseAsks(orderBy:RE_CREA_DESC condition:{reUuid:"${id}"}){
				nodes{
					reName            #费用名称
					reItem            #费用项明细
					reStat            #费用状态
					reJine            #费用总额
					reCrea            #创建时间
					reDesc
					reUuid
					piUuid
          			piName
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

export const cancal = async (id,name,uuid,num) => {
	let query = {
	    query: `mutation{
			updateExpenseReimburseAskMessageInfo(input:{
				ireUuid:"${id}"    #报销UUID
				ipcPaid:"${piUuid}"    #审核人UUID
				ipcPeap:"${piName}"    #审核人
				ipcProd:${num}     #1:创建 2：修改 3 同意 4 驳回 5 转审 6 撤销 7 确认已收 8 确认已还
				ipiUuid:"${piUuid}"    #操作人UUID
				ipiName:"${piName}"    #操作人
			}){
				uuid
			}
		}`
    };
  	const request = {
  		object: 'organization',
  		service_name: 'adm_data_service',
  		params: query,
  		organization_uuid: getUrlProps().orgUuid
  	};
  	return await httpRequest(request).then((res) => {
  		return {
	  		  statusCode: res.statusCode,
	  		  message: res.message,
	  		  result: res.statusCode === 0 && res.result ? res.result : res.result
  		};
  	});
};