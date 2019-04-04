import Mock from 'mockjs';

const {Random} = Mock;
const STATUS = ["使用中","退回中","维修中"]
const name = ["iPhoneX","MacBook Pro","MacBook Air"];
const category = ["易耗品","耐用品"];
export const supplies = Mock.mock({
	"list|30":[
     {
        id:() => Random.guid(),
        'key|+1':0,
        "status":`@pick(${STATUS})`,
        "coding":123,
        "name|1":name,
        "category|1":category,
        "image":"图片"
     }
	]
});

export default {
	...supplies
};