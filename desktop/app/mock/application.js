import Mock from 'mockjs';

const {Random} = Mock;
const STATUS = ["审批中","已驳回","待领取","已领取"]

export const application = Mock.mock({
	"list|30":[
     {
     	 id:() => Random.guid(),
     	 "people":'王大锤',
     	 'key|+1':0,
     	 "time": () => Random.datetime(),
         "list|1-10":["iPhoneX  ","MacBook Pro  "],
     	 "status":`@pick(${STATUS})`,
         "reason":'我要申请'
     }
	]
});

export default {
	...application
};