export const queryParse = (query) => {
    let obj = {};
    
	const reg = /[?&][^?&]+=[^?&]+/g;
    const arr = query.match(reg);
    
	if (arr) {
		arr.forEach((item) => {
			let tempArr = item.substring(1).split('=');
			let key = decodeURIComponent(tempArr[0]);
			let val = decodeURIComponent(tempArr[1]);
			obj[key] = val;
		});
    }
    
	return obj;
};
