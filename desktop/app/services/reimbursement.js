//引入主控提供的httpRequest方法
import { remote } from 'electron';
const { httpRequest } = remote.require('./util/http-request');
import moment from 'moment';
// 获取组织信息
import { getUrlProps } from './main';
const piUuid = remote.getGlobal("sharedObject").userenv.uuid;
const name = remote.getGlobal("sharedObject").userenv.realName;


// 我的申请
export const getMyApply = async (condition) => {
  let query = {
    query: `{
		a:allExpenseReimburseAsks(orderBy:RE_CREA_DESC 
			condition:{piUuid:"${piUuid}"}
			filter:{
					
				${
					condition.reName ? `reName:{like:"%${condition.reName}%"}` : ""
				}
				${
					condition.time ? `reCrea:{greaterThanOrEqualTo:"${condition.time[0]}",lessThanOrEqualTo:"${condition.time[1]}"}` : ""
				}
				${
					condition.num === 1 ? `reStat:{in:[1,2,0,3,4,5]}` : condition.reStat ? `reStat:{in:[${condition.reStat}]}` : `reStat:{in:[1,2,0,3,4,5]}`
				}
			}
		){
			nodes{
				reName            #费用名称
				reItem            #费用项明细
				reStat            #费用状态
				reJine            #费用总额
				reCrea            #创建时间
				reDesc
				reUuid
			}
		}
  	}`
  };
	console.log(query)
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
  	    result: res.statusCode === 0 && res.result.a ? res.result.a.nodes: res.result
  	  };
  	});
};

// 撤销
export const cancal = async (value,num) => {
	let query = {
	    query: `mutation{
			updateExpenseReimburseAskMessageInfo(input:{
				ireUuid:"${value}"    #报销UUID
				ipcPaid:"${piUuid}"    #审核人UUID
				ipcPeap:"${name}"    #审核人
				ipcProd:${num}     #1:创建 2：修改 3 同意 4 驳回 5 转审 6 撤销 7 确认已收 8 确认已还
				ipiUuid:"${piUuid}"    #操作人UUID
				ipiName:"${name}"    #操作人
			}){
				uuid
			}
		}`
    };
	console.log(query)
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