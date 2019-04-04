//引入主控提供的httpRequest方法
import { remote } from 'electron';
import url from 'url';

const { httpRequest } = remote.require('./util/http-request');

const organizationUuid = 'fe17ea11-d337-4485-b070-50fb12969f0c';//3ad968b9-53f7-4ca0-aa4a-683954789184
const appUuid = '2e0cfc59-3f1c-4905-905a-d0e233627c0b';

export const getUrlProps = (search) => {
	if (typeof location == 'undefined') {
		return {
			orgUuid: organizationUuid,
			appUuid: appUuid
		};
	}
	let searchProps = {};
	if (search) {
		searchProps = url.parse(search, true).query;
	}
	return {
		orgUuid: organizationUuid,
		appUuid: appUuid,
		...url.parse(location.href, true).query,
		...searchProps
	};
};

//根据应用id获取应用相关名称与图标
export const getApplicationByAppUuid = async () => {
	let query = {
		query: `{
			a:organizationApplicationByAiUuid(aiUuid: "${getUrlProps().appUuid}") {
				aiUuid
				aiName
				aiIcon
				veUuid
				veName
				veHash
				isIner
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
			result: res.statusCode === 0 ? res.result.a : res.result
		};
	});
};

//根据组织id获取组织名称
export const getOrganizationByOrgUuid = async () => {
	let query = {
		query: `{
			a:organizationInformationByOiUuid(oiUuid: "${getUrlProps().orgUuid}") {
				oiUuid
				oiOrna
				oiOrlo
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
			result: res.statusCode === 0 ? res.result.a : res.result
		};
	});
};
