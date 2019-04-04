//引入主控提供的httpRequest方法
const { httpRequest } = remote.require("./util/http-request");
import { remote } from "electron";
// 获取组织信息
import { getUrlProps } from "./main";
function formatArr(arr) {
        let str = "";
        let objs = [];
        arr.forEach(item => {
            let tmp = "{";
            Object.keys(item).forEach(key => {
                key == "params" ? (tmp += `${key}: ${item[key]},`) : (tmp += `${key}: "${item[key]}",`);//判断消息里params不加引号
            });
            tmp += "}";
            objs.push(tmp);
        });
        str = `[${objs.join(",")}]`;
        return str;
    }
export const createMessages = async data => {
	let query = {
		query: `mutation {
              a:createApplicationMessage(input: {
                  applicationMessage: {
                      senderUuid: "${
							remote.getGlobal("sharedObject").userenv.uuid
						}"
                      senderName: "${
							remote.getGlobal("sharedObject").userenv.realName
						}"
                      senderAvatarHash: "${data.applicationHash}"
                      receiverUuid: "${data.receiverUuid}"
                      receiverName: "${data.receiverName}"
                      messageText: "${data.messageText}"
                      messageType: "${data.messageType}"
                      applicationUuid: "${data.applicationUuid}"
                      applicationHash: "${data.applicationHash}"
                      commands: ${formatArr(data.commands)}
                  }
              }) {
                  b:applicationMessage {
                      messageUuid
                  }
              }
          }`
	};
	console.log(query)
	const request = {
		object: "organization",
		service_name: "public_message_service",
		service_path: "",
		organization_uuid: getUrlProps().orgUuid,
		params: query
	};

	return await httpRequest(request);
};


export const updateMessageStatus = async messageUuid => {
	const query = {
		query: `mutation {
            a:updateApplicationMessageByMessageUuid(input: {
                messageUuid: "${messageUuid}"
                applicationMessagePatch: {
                messageStatus: 0
            }
            }) {
                b:applicationMessage {
                    messageStatus
                }
            }
        }`
	};

	let request = {
		object: "organization",
		service_name: "public_message_service",
		params: query,
		organization_uuid: getUrlProps().orgUuid
	};

	return await httpRequest(request).then(res => {
		return {
			statusCode: res.statusCode,
			message: res.message,
			result: res.statusCode === 0 && res.result.a ? res.result.a.b : {}
		};
	});
};


//消息群发
export const createMuchMessages = async (data, person) => {
	let condition = person.map(
		(item, index) => ` a${index}:createApplicationMessage(input: {
        applicationMessage: {
            senderUuid: "${remote.getGlobal("sharedObject").userenv.uuid}"
            senderName: "${remote.getGlobal("sharedObject").userenv.realName}"
            senderAvatarHash: "${data.applicationHash}"
            receiverUuid: "${item.id}"
            receiverName: "${item.name}"
            messageText: "${data.messageText}"
            messageType: "${data.messageType}"
            applicationUuid: "${data.applicationUuid}"
            applicationHash: "${data.applicationHash}"
            commands: ${formatArr(data.commands)}
        }
    }) {
        b:applicationMessage {
            messageUuid
        }
    }`
	);
	let query = {
		query: `mutation {
       ${condition.join(",")}
    }`
    };
    console.log(query)
	const request = {
		object: "organization",
		service_name: "public_message_service",
		service_path: "",
		organization_uuid: getUrlProps().orgUuid,
		params: query
	};

	return await httpRequest(request);
};