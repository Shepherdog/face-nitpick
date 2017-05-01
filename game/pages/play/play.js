// var mainLayout = require('../../layout/main');
var tmpl = require('./template/play.html');
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
			gameData: null,
			imgSrc: '',
			markIds: [],
			remainTime: 30,	// seconds
			countDownTimer: 0,
			timeStr: '00:00',
			score: 0,
		}
	},

	created: function() {
		// Api.post('/api/game')
		// Promise.resolve(JSON.parse('{"img":"http://news.xinhuanet.com/fashion/2015-02/12/127483653_14236217073281n.jpg","map":[{"type":"A","id":"297445a986673045","x":371,"y":252,"w":80,"h":80},{"type":"B","id":"59b6c55a97fba179","x":268,"y":221,"w":80,"h":80},{"type":"C","id":"4ddd5c46b1b4d450","x":608,"y":524,"w":80,"h":80}]}'))
		// .then((data) => {
		// 	this.loadGame(data);
		// });

		let gameId = utils.getQueryString('gameId')// || '58fccd0b1b69e600589b9898';
		if (!gameId) {
			console.error('gameId cannot be empty');
			return;
		}

		let query = new AV.Query('GameData');
		query.get(gameId).then((data) => {
			this.imgSrc = data.get('image').get('url');
			this.gameData = data.get('mapData');
		}, (error) => {
			console.error(JSON.stringify(error));
		});
	},

	mounted: function() {
		$('.hud').addClass('animated slideInDown');
	},

	methods: {
		loadGame: function() {
			this.markIds = [];

			const markMap = { A: 1, B: 2, C: 3 };
			const ox = $('#play-img').position().left;
			const oy = $('#play-img').position().top;
			const ratioW = $('#play-img').get(0).naturalWidth / $('#play-img').width();
			const ratioH = $('#play-img').get(0).naturalHeight / $('#play-img').height();

			$('.draggable').each((idx, ele) => {
				ele.remove();
			});

			this.gameData.forEach((item) => {
				let draggable = $('<div class="draggable"></div>');
				draggable.appendTo('#container');
				draggable.addClass('no-border');

				// set position
				let x = item.x / ratioW + ox, y = item.y / ratioH + oy;
				let w = item.w, h = item.h;
				let r = utils.rectShrink({ x, y, w, h }, w / 2, h / 2);
				draggable.css({ 'left': r.x + 'px', 'top': r.y + 'px' });
				draggable.width(r.w);
				draggable.height(r.h);

				// add sticker
				draggable.css({ 'background': `url(../assets/img/mark${markMap[item.type]}.png) no-repeat center`, 'background-size': 'contain' });
				draggable.get(0).dataset.tag = [item.type, item.id].join('-');

				this.markIds.push(item.id);
			});

			this.draggables = $('.draggable').draggabilly();
			this.draggables.on('staticClick', this.bindClick);
			this.draggables.draggabilly('disable');

			this.initGame();
		},

		initGame: function() {
			this.remainTime = 30;
			this.score = 0;

			this.countDownTimer = setInterval(() => {
				this.remainTime--;
				this.timeStr = utils.formatDate(new Date(this.remainTime * 1000), 'mm:ss');

				$('.remainTime').css('color', (this.remainTime < 10) ? '#f00' : '#000');

				if (this.remainTime == 0) {
					clearInterval(this.countDownTimer);

					notie.confirm({
						text: `时间用完了!<br>你的得分是 ${this.score}`,
						submitText: '再试一把',
						cancelText: '不玩了',
						submitCallback: () => {
							this.loadGame();
						},
						cancelCallback: () => {
							// history.back();
							wx.closeWindow();
						},
					});
				}
			}, 1000);
		},

		bindClick: function(event, pointer) {
			$(event.target).removeClass('no-border');
			$(event.target).addClass('is-delete');

			const scoreMap = { A: 30, B: 20, C: 10 };
			const tag = event.target.dataset.tag.split('-');
			const type = tag[0], id = tag[1];
			// console.log(`click ${type}-${id}`);

			let idx = this.markIds.indexOf(id);
			if (idx >= 0) {
				this.score += scoreMap[type];
				this.markIds.splice(idx, 1);

				if (this.markIds.length == 0) {
					clearInterval(this.countDownTimer);

					notie.force({
						type: 3,
						text: 'BINGO！你获得了满分！',
						buttonText: '赞一个',
						callback: () => {
							notie.alert({ text: '记得分享给小伙伴们哦！' });
						}
					});
				}
			}
		},

	}
};