// Server API

var API_SERVER_BASE_PATH = 'http://rapapi.org/mockjsdata/16758';

// var jsPromise = Promise.resolve($.ajax('/whatever.json'));
// 上面代码将jQuery生成的deferred对象，转为一个新的Promise对象。

var ajaxAsync = function(type, method, url, data, cb) {
	url = /(http[s]?:\/\/)[^\s]*/.test(url) ? url : API_SERVER_BASE_PATH + url;

	if (type === 'json') {
		return new Promise(function(resolve, reject) {
			$.ajax({
				type: method,
				url: url,
				data: data,
				dataType: type,
				xhrFields: {
					withCredentials: true
				}, // 设置跨域访问
				crossDomain: true,
				success: function(data) {
					resolve(data);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					reject(new Error('Fail at ' + url + ' with ' + '[' + XMLHttpRequest.status + ']' + textStatus));
				}
			});
		});
	} else if (type === 'jsonp') {
		return new Promise(function(resolve, reject) {
			$.ajax({
				type: method,
				url: url,
				data: data,
				dataType: type,
				jsonp: cb,
				success: function(data) {
					resolve(data);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					reject(new Error('Fail at ' + url + ' with ' + textStatus));
				}
			});
		});
	} else {
		throw Error('Not support ajax dataType: ' + type);
	}
};
// 测试
// var Api = {
//     
//     testApi: function() {
//         var url = 'http://gc.ditu.aliyun.com/geocoding?a=深圳市';
//         return ajaxAsync('GET', url);
//     }
// };

var Api = {
	get: function(url) {
		return ajaxAsync('json', 'GET', url);
	},

	post: function(url, data) {
		return ajaxAsync('json', 'POST', url, data);
	},

	getJsonp: function(url, cb) {
		return ajaxAsync('jsonp', 'GET', url, null, cb || 'callback');
	},

	postJsonp: function(url, data, cb) {
		return ajaxAsync('jsonp', 'POST', url, data, cb || 'callback');
	},
	
	all: function(requests) {
		var args = Array.prototype.slice.call(arguments);
		var promises = args.map(function(params) {
			ajaxAsync.apply(null, params)
		});

		return Promise.all(promises);
	}
};


//If support node/ES6 module
if (typeof module === 'object' && module.exports) {
	module.exports = Api;
}
//if using require.js
else if (typeof define === 'function' && define.amd) {
	define(function() { return Api; });
}