// var mainLayout = require('../../layout/main');
var tmpl = require('./template/home.html');
var Api = require('../../../common/api');
var utils = require('../../../common/utils');

module.exports = {
	template: tmpl,

	// components: {
	// 	MainLayout: mainLayout
	// },

	data: function() {
		return {
			draggables: null,
			imgSrc: '',
			gameId: '',
		}
	},

	created: function() {
		$.getScript('../assets/js/lrz.all.bundle.js');
	},

	mounted: function() {
		this.initButtons();
		this.loadDraggables();
	},

	methods: {
		initButtons: function() {
			const containerH = $('#container').height();
			const margin = 10;
			const markMap = { A: 1, B: 2, C: 3 };

			$('.draggable').each((idx, ele) => {
				// adjust position
				let x = $(ele).width() * idx + margin * (idx + 1);
				let y = containerH - $(ele).height() - margin;
				$(ele).css({ 'left': x + 'px', 'top': y + 'px' });

				// add icon
				let type = ele.dataset.tag;
				$(ele).css({ 'background': `url(../assets/img/mark${markMap[type]}.png) no-repeat center`, 'background-size': 'contain' });

				// animation
				$(ele).addClass('animated slideInLeft');
				$(ele).on('animationend', () => {
					$(ele).removeClass('animated slideInLeft');
				});
			});
			$('.trash').addClass('animated slideInRight');
		},

		loadDraggables: function() {
			if (this.draggables) {
				this.draggables.off('pointerDown', this.bindPointerDown);
				this.draggables.off('pointerMove', this.bindPointerMove);
				this.draggables.off('pointerUp', this.bindPointerUp);
			}

			this.draggables = $('.draggable').draggabilly({ containment: true });
			this.draggables.on('pointerDown', this.bindPointerDown);
			this.draggables.on('pointerMove', this.bindPointerMove);
			this.draggables.on('pointerUp', this.bindPointerUp);
		},

		bindPointerDown: function(event, pointer) {
			const tag = event.target.dataset.tag.split('-');
			const type = tag[0], id = tag[1];

			if (!id) {
				let copy = $(event.target).clone();
				copy.removeClass('is-pointer-down');
				copy.appendTo('#container');

				event.target.dataset.tag = [type, utils.uuid()].join('-');

				// refresh
				this.loadDraggables();
			}
		},

		bindPointerMove: function(event, pointer) {
			if (this.pointerInTrashArea(pointer)) {
				$(event.target).addClass('is-delete');
			} else {
				$(event.target).removeClass('is-delete');
			}
		},

		bindPointerUp: function(event, pointer) {
			$(event.target).addClass('is-pointer-up');

			if (this.pointerInTrashArea(pointer)) {
				$(event.target).addClass('animated zoomOut');
				$(event.target).on('animationend', () => {
					// move to trash
					event.target.remove();
				});
			}

			this.showGuideTips();
			// this.updateGameData();
		},

		pointerInTrashArea: function(pointer) {
			const trash = $('.trash');
			const x = trash.position().left, y = trash.position().top;
			const w = trash.width(), h = trash.height();
			const x0 = pointer.pageX, y0 = pointer.pageY;

			return utils.rectContainsPoint({ x, y, w, h }, { x0, y0 });
		},

		showGuideTips: function() {
			let hasGuide = JSON.parse(localStorage.getItem('hasGuide') || false);
			if (!hasGuide) {
				setTimeout(() => {
					notie.alert({ text: '记得分享给小伙伴们哦！' });
				}, 5000);

				localStorage.setItem('hasGuide', 'true');
			}
		},

		start: function(event) {
			$('#file-input').trigger('click');
		},

		getInputImage: function(event) {
			let file = event.target.files[0];

			/*let fr = new FileReader();
			fr.readAsDataURL(file);

			fr.onprogress = (evt) => {
				$('#start-button').text(`${evt.loaded / evt.total * 100} %`);
			};

			fr.onload = (evt) => {
				let result = evt.target.result;
				this.imgSrc = result;
				this.uploadImage(file.name, { base64: result });

				$('#start-button').remove();
			};*/

			$('#start-button').text('载入中...');

			lrz(file, { width: 750 }).then((rst) => {
				let result = rst.base64;
				this.imgSrc = result;
				this.uploadImage(file.name, { base64: result });

				$('#start-button').remove();
			});
		},

		uploadImage: function(fileName, fileData) {
			/*if (utils.isWeixin())*/ {
				let GameData = AV.Object.extend('GameData');

				let gameData = new GameData();
				gameData.set('openId', '');
				gameData.set('image', new AV.File(fileName, fileData));	// upload the image

				gameData.save().then((data) => {
					console.log(`image [${fileName}] uploaded`);
					this.gameId = data.id;

					// wechat share
					// $('#share-img').attr('src', data.get('image').get('url'));
					// history.replaceState({}, '', this.getShareUrl());

					this.addWxShare(() => {
						this.updateGameData();
						notie.alert({ text: '分享成功！' });
					});
				}, (error) => {
					console.error(JSON.stringify(error));
				});
			}
		},

		getGameData: function() {
			const ox = $('#play-img').position().left;
			const oy = $('#play-img').position().top;
			const ratioW = $('#play-img').get(0).naturalWidth / $('#play-img').width();
			const ratioH = $('#play-img').get(0).naturalHeight / $('#play-img').height();

			let mapData = [];
			$('.draggable').each((idx, ele) => {
				let tag = ele.dataset.tag.split('-');
				let type = tag[0], id = tag[1];

				if (!!id) {
					ele = $(ele);
					let x = (ele.position().left - ox) * ratioW | 0, y = (ele.position().top - oy) * ratioH | 0;
					let w = ele.width(), h = ele.height();
					mapData.push({ type, id, x, y, w, h });
				}
			});

			return mapData;
		},

		updateGameData: function() {
			let gameData = AV.Object.createWithoutData('GameData', this.gameId);
			gameData.set('mapData', this.getGameData());

			gameData.save().then((data) => {
				console.log('game data updated');
			}, (error) => {
				console.error(JSON.stringify(error));
			});
		},

		getShareUrl: function() {
			let search = location.search + (location.search ? '&' : '?' + `gameId=${this.gameId}`);
			let hash = '#/play';
			return location.origin + location.pathname + search + hash;
		},

		addWxShare: function(successCb, cancelCb) {
			let query = new AV.Query('WXSignature');
			query.get('58fc628dda2f60005dc229f2').then((data) => {
				let ticket = data.get('ticket');
				let timestamp = data.get('timestamp');

				const shaObj = new jsSHA("SHA-1", "TEXT");
				shaObj.update('jsapi_ticket=' + ticket + '&noncestr=' + '1234567890' + '&timestamp=' + timestamp + '&url=' + location.href.split('#')[0]);
				let signature = shaObj.getHash("HEX");

				const wxConfig = {
					// debug: true,
					appId: 'wx349d3ab053fb111f',
					timestamp: timestamp,
					nonceStr: '1234567890',
					signature: signature,
					jsApiList: ['checkJsApi', 'showMenuItems', 'onMenuShareAppMessage', 'onMenuShareTimeline'],
				};

				let shareParam = {
					title: '萌脸找茬', // 分享标题
					desc: '快来挑战萌脸找茬吧！', // 分享描述
					link: this.getShareUrl(), // 分享链接
					imgUrl: '', // 分享图标
				};

				wx.config(wxConfig);
				wx.ready(() => {
					wx.showMenuItems({
						menuList: ['menuItem:share:appMessage', 'menuItem:share:timeline']
					});

					shareParam = Object.assign(shareParam, {
						success: () => {
							successCb && successCb.apply(null);
						},
						cancel: () => {
							cancelCb && cancelCb.apply(null);
						}
					});

					wx.onMenuShareAppMessage(shareParam); // 发送给朋友
					wx.onMenuShareTimeline(shareParam); // 分享到朋友圈
				});

				wx.error((error) => {
					alert('wx error: ' + JSON.stringify(error));
				});
			}, (error) => {
				console.error(JSON.stringify(error));
			});
		},

	}
};