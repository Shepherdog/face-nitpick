// Utilities

var utils = {
	/**
	 * 日期格式化
	 * 
	 * @param {Date} date 指定日期
	 * @param {String} format
	 * @returns {String}
	 * @summary 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
	 * 			年(y)可以用 1-4个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
	 * @example (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02
	 *          08:09:04.423 (new Date()).Format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
	 */
	formatDate: function(date, format) {
		var o = {
			'M+': date.getMonth() + 1, //month
			'd+': date.getDate(), //day
			'h+': date.getHours(), //hour
			'm+': date.getMinutes(), //minute
			's+': date.getSeconds(), //second
			'q+': Math.floor((date.getMonth() + 3) / 3), //quarter
			'S': date.getMilliseconds() //millisecond
		};
		if (/(y+)/.test(format)) {
			format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
		}
		for ( var k in o) {
			if (new RegExp('(' + k + ')').test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
			}
		}
		return format;
	},

	// 查询字符串
	getQueryString: function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg); // 获取url中"?"符后的字符串并正则匹配
		var context = "";
		if (r != null) {
			context = r[2];
		}
		reg = null;
		r = null;
		return (context == null || context == "" || context == "undefined") ? "" : context;
	},

	// 判断微信内置浏览器
	isWeixin: function() {
		var ua = navigator.userAgent.toLowerCase();
		return (ua.match(/MicroMessenger/i) == 'micromessenger');
	},

	uuid: function() {
		return 'xxxxxxxxyxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	},

	rectContainsPoint: function(rect, point) {
		return (point.x0 >= rect.x && point.x0 <= (rect.x + rect.w) 
			&& point.y0 >= rect.y && point.y0 <= (rect.y + rect.h));
	},

	rectShrink: function(rect, dx, dy) {
		return {x: rect.x + dx / 2, y: rect.y + dy / 2, w: rect.w - dx, h: rect.h - dy};
	}
};


//If support node/ES6 module
if (typeof module === 'object' && module.exports) {
	module.exports = utils;
}
//if using require.js
else if (typeof define === 'function' && define.amd) {
	define(function() { return utils; });
}