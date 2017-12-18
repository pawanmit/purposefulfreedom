/**
 * jQuery Image Gallery
 * Copyright (c) 2012 Allan Ma (http://codecanyon.net/user/webtako)
 * Version: 1.6 (02/10/2012)
 */
;(function($) {
	var INTERVAL_DELAY = 100;
	var DEFAULT_DELAY = 5000;
	var TOOLTIP_DELAY = 800;
	var DURATION = 800;
	var SCROLL_SPEED = 600;
	var ANIMATE_SPEED = 400;
	var LIMIT = 250;
	var STRIPE_SIZE = 50;
	var SWIPE_MIN = 50;
	var TOP = "top";
	var BOTTOM = "bottom";
	var PREV = 0;
	var NEXT = 1;
	var UPDATE_CONTENT_BUTTONS = "update_content_btns";
	var UPDATE_CONTENT_INFO = "update_content_info";
	var UPDATE_INDEX = 		"update_index";
	var UPDATE_THUMB_BUTTONS = "update_thumb_btns";	
	var UPDATE_THUMB_INFO = "update_thumb_info";
	var ADJUST_THUMBS = "adjust_thumbs";
	var START = "start_timer";
	var RESET = "reset_timer";
	var PAUSE = "pause_timer";
	
	var ei = 0;
	var EFFECTS = {
		"vert.tl":ei++,
		"vert.tr":ei++,
		"vert.bl":ei++,
		"vert.br":ei++,
		"fade.left":ei++,			
		"fade.right":ei++,	
		"alt.left":ei++,
		"alt.right":ei++,
		"blinds.left":ei++,
		"blinds.right":ei++,
		"vert.random.fade":ei++,
		"horz.tl":ei++,
		"horz.tr":ei++,
		"horz.bl":ei++,
		"horz.br":ei++,
		"fade.top":ei++,
		"fade.bottom":ei++,
		"alt.top":ei++,
		"alt.bottom":ei++,
		"blinds.top":ei++,
		"blinds.bottom":ei++,
		"horz.random.fade":ei++,
		"random":ei++,
		"fade":ei++,
		"h.slide":ei++,
		"v.slide":ei++,
		"none":ei++
	}
	
	//Vertical Stripes
	function VertStripes(gallery) {
		this._$stripes;
		this._arr;
		this._total;
		this._intervalId = null;
		this._gallery = gallery;
		this._areaWidth = gallery._screenWidth;
		this._areaHeight = gallery._screenHeight;
		this._size = gallery._vertSize;
		this._delay = gallery._vertDelay;
		//initialize
		this._total = Math.ceil(this._areaWidth/this._size);
		if (this._total > LIMIT) {
			this._size = Math.ceil(this._areaWidth/LIMIT);
			this._total = Math.ceil(this._areaWidth/this._size);
		}
		var divs = "";
		for (var i = 0; i < this._total; i++) {
			divs += "<div class='vpiece' id='" + i + "' style='left:" + (i * this._size) + "px; height:" + this._areaHeight + "px'></div>";
		}					
		this._gallery.addToScreen(divs);
		
		this._$stripes = this._gallery._$obj.find("div.vpiece");
		this._arr = this._$stripes.toArray();
	}

	//clear animation
	VertStripes.prototype.clear = function() {
		clearInterval(this._intervalId);
		this._$stripes.stop(true).css({"z-index":2, opacity:0});
	}

	//display content
	VertStripes.prototype.displayContent = function($img, effect) {
		this.setPieces($img, effect);
		if (effect == EFFECTS["vert.random.fade"]) {
			this.animateRandom($img);
		}
		else {
			this.animate($img, effect);
		}
	}			
	
	//set image stripes
	VertStripes.prototype.setPieces = function($img, effect) {
		switch (effect) {
			case EFFECTS["vert.tl"]:
			case EFFECTS["vert.tr"]:
				this.setVertPieces($img, -this._areaHeight, 1, this._size, false);
				break;
			case EFFECTS["vert.bl"]:
			case EFFECTS["vert.br"]:
				this.setVertPieces($img, this._areaHeight, 1, this._size, false);
				break;
			case EFFECTS["alt.left"]:
			case EFFECTS["alt.right"]:
				this.setVertPieces($img, 0, 1, this._size, true);
				break;
			case EFFECTS["blinds.left"]:
			case EFFECTS["blinds.right"]:
				this.setVertPieces($img, 0, 1, 0, false);
				break;
			default:
				this.setVertPieces($img, 0, 0, this._size, false);
		}
	}
	
	//set vertical stripes
	VertStripes.prototype.setVertPieces = function($img, topPos, opacity, width, alt) {
		var imgSrc = $img.attr("src");
		var tOffset = 0;
		var lOffset = 0;
		if (this._gallery._autoCenter) {
			tOffset = (this._areaHeight - $img.height())/2;
			lOffset = (this._areaWidth - $img.width())/2;
		}
		for (var i = 0; i < this._total; i++) {		
			var xPos =  ((-i * this._size) + lOffset);
			if (alt) {
				topPos = (i % 2) == 0 ? -this._areaHeight: this._areaHeight;
			}
			this._$stripes.eq(i).css({"background":" url('"+ imgSrc +"') " + xPos + "px " + tOffset + "px no-repeat",
									"backgroundPositionX":xPos + "px", "backgroundPositionY":tOffset + "px",
									opacity:opacity, top:topPos, width:width, "z-index":3});
		}
	}
	
	//animate stripes			
	VertStripes.prototype.animate = function($img, effect) {
		var that = this;
		var start, end, incr, limit;
		switch (effect) {
			case EFFECTS["vert.tl"]:   case EFFECTS["vert.bl"]: 
			case EFFECTS["fade.left"]: case EFFECTS["blinds.left"]: 
			case EFFECTS["alt.left"]:
				start = 0;
				end = this._total - 1;
				incr = 1;
				break;
			default:
				start = this._total - 1;
				end = 0;
				incr = -1;
		}
		
		this._intervalId = setInterval(
			function() {
				that._$stripes.eq(start).animate({top:0, opacity:1, width:that._size}, that._gallery._duration, that._gallery._easing,
					function() {
						if ($(this).attr("id") == end) {
							that._gallery.showContent($img);
						}
					}
				);
				if (start == end) {
					clearInterval(that._intervalId);
				}
				start += incr;
			}, this._delay);
	}
	
	//animate random fade 
	VertStripes.prototype.animateRandom = function($img) {
		var that = this;
		shuffleArray(this._arr);
		var i = 0;
		var count = 0;
		this._intervalId = setInterval(
			function() {
				$(that._arr[i++]).animate({opacity:1}, that._gallery._duration, that._gallery._easing,
						function() {
							if (++count == that._total) {
								that._gallery.showContent($img);
							}
						});
				if (i == that._total) {
					clearInterval(that._intervalId);
				}
			}, this._delay);
	}
		
	//Horizontal Stripes
	function HorzStripes(gallery) {
		this._$stripes;
		this._arr;
		this._total;
		this._intervalId = null;
		this._gallery = gallery;
		this._areaWidth = gallery._screenWidth;
		this._areaHeight = gallery._screenHeight;
		this._size = gallery._horzSize;
		this._delay = gallery._horzDelay;
		//initialize
		this._total = Math.ceil(this._areaHeight/this._size);
		if (this._total > LIMIT) {
			this._size = Math.ceil(this._areaHeight/LIMIT);
			this._total = Math.ceil(this._areaHeight/this._size);
		}
		var divs = "";
		for (var i = 0; i < this._total; i++) {
			divs += "<div class='hpiece' id='" + i + "' style='top:" + (i * this._size) + "px; width:" + this._areaWidth + "px'><!-- --></div>";
		}				
		this._gallery.addToScreen(divs);
		
		this._$stripes = this._gallery._$obj.find("div.hpiece");
		this._arr = this._$stripes.toArray();
	}

	//clear animation
	HorzStripes.prototype.clear = function() {
		clearInterval(this._intervalId);
		this._$stripes.stop(true).css({"z-index":2, opacity:0});
	}

	//display content
	HorzStripes.prototype.displayContent = function($img, effect) {
		this.setPieces($img, effect);
		if (effect == EFFECTS["horz.random.fade"]) {
			this.animateRandom($img);
		}
		else {
			this.animate($img, effect);
		}
	}			
	
	//set image stripes
	HorzStripes.prototype.setPieces = function($img, effect) {
		switch (effect) {
			case EFFECTS["horz.tr"]:
			case EFFECTS["horz.br"]:
				this.setHorzPieces($img, this._areaWidth, 1, this._size, false);
				break;
			case EFFECTS["horz.tl"]:
			case EFFECTS["horz.bl"]:
				this.setHorzPieces($img, -this._areaWidth, 1, this._size, false);
				break;
			case EFFECTS["alt.top"]:
			case EFFECTS["alt.bottom"]:
				this.setHorzPieces($img, 0, 1, this._size, true);
				break;
			case EFFECTS["blinds.top"]:
			case EFFECTS["blinds.bottom"]:
				this.setHorzPieces($img, 0, 1, 0, false);
				break;
			default:
				this.setHorzPieces($img, 0, 0, this._size, false);
		}
	}
	
	//set horizontal stripes
	HorzStripes.prototype.setHorzPieces = function($img, leftPos, opacity, height, alt) {
		var imgSrc = $img.attr("src");
		var tOffset = 0;
		var lOffset = 0;
		if (this._gallery._autoCenter) {
			tOffset = (this._areaHeight - $img.height())/2;
			lOffset = (this._areaWidth - $img.width())/2;
		}
		for (var i = 0; i < this._total; i++) {			
			var yPos = ((-i * this._size) + tOffset);
			if (alt) {
				leftPos = (i % 2) == 0 ? -this._areaWidth: this._areaWidth;
			}
			this._$stripes.eq(i).css({"background":" url('"+ imgSrc +"') " + lOffset + "px " + yPos  + "px no-repeat",
									"backgroundPositionX":lOffset  + "px", "backgroundPositionY":yPos + "px",
									opacity:opacity, left:leftPos, height:height, "z-index":3});  
		}
	}
	
	//animate stripes			
	HorzStripes.prototype.animate = function($img, effect) {
		var that = this;
		var start, end, incr;
		switch (effect) {
			case EFFECTS["horz.tl"]:  case EFFECTS["horz.tr"]: 
			case EFFECTS["fade.top"]: case EFFECTS["blinds.top"]: 
			case EFFECTS["alt.top"]:
				start = 0;
				end = this._total - 1;
				incr = 1;
				break;
			default:
				start = this._total - 1;
				end = 0;
				incr = -1;
		}
		
		this._intervalId = setInterval(
			function() {
				that._$stripes.eq(start).animate({left:0, opacity:1, height:that._size}, that._gallery._duration, that._gallery._easing,
					function() {
						if ($(this).attr("id") == end) {
							that._gallery.showContent($img);
						}
					}
				);
				if (start == end) {
					clearInterval(that._intervalId);
				}
				start += incr;
			}, this._delay);
	}
	
	//animate random fade 
	HorzStripes.prototype.animateRandom = function($img) {
		var that = this;
		shuffleArray(this._arr);
		var i = 0;
		var count = 0;
		this._intervalId = setInterval(
			function() {
				$(that._arr[i++]).animate({opacity:1}, that._gallery._duration, that._gallery._easing,
						function() {
							if (++count == that._total) {
								that._gallery.showContent($img);
							}
						});
				if (i == that._total) {
					clearInterval(that._intervalId);
				}
			}, this._delay);
	}

	//Gallery Class
	function Gallery($obj, opts) {
		//set options
		this._numDisplay = 		getPosNumber(opts.num_display,5);
		this._screenWidth = 	getPosNumber(opts.screen_width,720);
		this._screenHeight = 	getPosNumber(opts.screen_height,360);
		this._thumbWidth = 		getPosNumber(opts.thumb_width,125);
		this._thumbHeight = 	getPosNumber(opts.thumb_height,70);
		this._contImgNav = 		opts.cont_imgnav;
		this._contThumbNav = 	opts.cont_thumbnav;
		this._displayImgBtns = 	opts.display_imgnav;
		this._displayPlayBtn =	opts.display_play;
		this._displayImgNum = 	opts.display_imgnum;
		this._displayTimer =	opts.display_timer;
		this._displayThumbBtns = opts.display_thumbnav;
		this._displayThumbInfo = opts.display_thumbnum;
		this._displayArrow = 	opts.display_arrow;
		this._displayTooltip = 	opts.display_tooltip;
		this._displayIndex = 	opts.display_indexes;
		this._mouseoverPause =	 window.Touch ? false : opts.mouseover_pause;
		this._mouseoverText = 	 window.Touch ? false : opts.mouseover_text;
		this._mouseoverInfo =	 window.Touch ? false : opts.mouseover_info;
		this._mouseoverButtons = window.Touch ? false : opts.mouseover_buttons;
		this._mouseoverCaption = window.Touch ? false : opts.mouseover_caption;
		this._textAlign = 		opts.text_align.toLowerCase();
		this._captionAlign = 	opts.caption_align.toLowerCase();
		this._globalEffect = 	opts.transition.toLowerCase();
		this._globalDelay = 	getPosNumber(opts.delay, DEFAULT_DELAY);
		this._duration = 		getPosNumber(opts.transition_speed, DURATION);
		this._scrollSpeed = 	getPosNumber(opts.scroll_speed, SCROLL_SPEED);
		this._moveBy1 = 		opts.move_one;
		this._shuffle = 		opts.shuffle;
		this._easing = 			opts.easing;
		this._autoCenter =		opts.auto_center;
		this._playOnce =		opts.rotate_once;
		this._padding = 		getNonNegNumber(opts.padding,0);
		this._thumbMargin = 	getNonNegNumber(opts.thumb_margin,0);
		this._autoStart = 		opts.auto_rotate;
		this._vertSize = 		getPosNumber(opts.vert_size, STRIPE_SIZE);
		this._horzSize = 		getPosNumber(opts.horz_size, STRIPE_SIZE);
		this._vertDelay = 		getPosNumber(opts.vstripe_delay, INTERVAL_DELAY);
		this._horzDelay = 		getPosNumber(opts.hstripe_delay, INTERVAL_DELAY);
		this._mousewheelScroll = opts.mousewheel_scroll;
		this._thumbsAlign = 	opts.thumbnails_align.toLowerCase();
		
		this._numItems;
		this._unitSize;
		this._prevSlots;
		this._nextSlots;
		this._maxSlots;
		this._currIndex;
		this._prevIndex;
		this._pos;
		this._vStripes;
		this._hStripes;
		this._rotate;
		this._delay;
		this._textOffset;
		this._selectStyle;
		this._timerId;
		this._dir;
		this._hStripeEffect;
		this._vStripeEffect;
		this._slideCoord;
		this._thumbCoord;
		this._useFilter;
		
		this._$gallery;   			
		this._$screen;
		this._$preloader;
		this._$mainLink;
		this._$strip;
		this._$playBtn;
		this._$prevBtn;
		this._$nextBtn;
		this._$textBox;
		this._$infoPanel;
		this._$thumbPanel;
		this._$thumbList;
		this._$thumbs;
		this._$thumbBoxes;
		this._$cpanel;
		this._$listBackButton;
		this._$listFwdButton;
		this._$thumbInfo;
		this._$tooltip;
		this._$indexes;
		this._$timer;
		this._$innerText;
		this._$sPanel;
		this._$innerInfo;
		this._$obj = $obj;
	
		this.init();
	}

	Gallery.prototype.init = function() {
		this._$gallery = 	this._$obj.find(".wt-gallery");   			
		this._$screen = 	this._$gallery.find(">.main-screen");
		this._$thumbPanel = this._$gallery.find(".thumbnails");
		this._$thumbList =	this._$thumbPanel.find(">ul");
		this._$thumbs	=	this._$thumbList.find(">li");
		this._numItems = this._$thumbs.size();
		if (this._shuffle) {
			this.shuffleItems();
		}
		this._$thumbBoxes = this._$thumbs.find(">div:first");
			
		this._timerId = null;
		this._currIndex = 0;
		this._prevIndex = -1;
		this._pos = 0;
		this._useFilter = (jQuery.browser.msie && parseInt(jQuery.browser.version) > 6 && parseInt(jQuery.browser.version) < 9);
		
		if (this._numItems <= this._numDisplay) {
			this._displayThumbBtns = this._displayIndex = false;
			this._numDisplay = this._numItems;
		}				
		if (this._displayIndex) {
			this._moveBy1 = false;
		}
		this._hStripeEffect = this._vStripeEffect = false;
		this.checkEffect(EFFECTS[this._globalEffect]);
		
		//init components
		this.initScreen();
		this.initCPanel();
		this.initItems();
		
		//config gallery 
		var areaWidth =  this._$screen.outerWidth() > this._$cpanel.outerWidth() ? this._$screen.outerWidth() : this._$cpanel.outerWidth();
		var areaHeight = this._$screen.outerHeight() + this._$cpanel.outerHeight();
		this._$gallery.css({width:areaWidth, height:areaHeight, padding:this._padding});
		
		$(document).bind("keyup", {elem:this}, this.onKeyPress);
		
		this._rotate = false;
		if (this._autoStart) {
			this._rotate = true;
			this._$gallery.bind(START, {elem:this}, this.startTimer).bind(PAUSE, {elem:this}, this.pauseTimer).bind(RESET, {elem:this}, this.resetTimer);
			if (this._mouseoverPause) {
				this._$gallery.bind("mouseenter", {elem:this}, this.galleryOver).bind("mouseleave", {elem:this}, this.galleryOut);
			}
		}
		else if (this._displayPlayBtn) {
			this._$gallery.bind(START, {elem:this}, this.startTimer).bind(PAUSE, {elem:this}, this.pauseTimer).bind(RESET, {elem:this}, this.resetTimer);
		}
		
		//init effect components
		if (this._vStripeEffect) {
			this._vStripes =  new VertStripes(this);
		}
		if (this._hStripeEffect) {
			this._hStripes =  new HorzStripes(this);
		}
		
		if (window.Touch) {
			this._slideCoord = {start:-1, end:-1};
			this._thumbCoord = {start:-1, end:-1};
			if (this._globalEffect == "v.slide") {
				this._$screen.bind("touchstart", {elem:this}, this.touchVStart).bind("touchmove", {elem:this}, this.touchVMove);
			}
			else {
				this._$screen.bind("touchstart", {elem:this}, this.touchStart).bind("touchmove", {elem:this}, this.touchMove);
			}
			this._$screen.bind("touchend", {elem:this}, this.touchEnd);
			this._$thumbPanel.bind("touchstart", {elem:this}, this.thumbsTouchStart).bind("touchmove", {elem:this}, this.thumbsTouchMove).bind("touchend", {elem:this}, this.thumbsTouchEnd);;
		}
		else if (this._mousewheelScroll) {
			this._$screen.bind("mousewheel", {elem:this}, this.scrollContent).bind("DOMMouseScroll", {elem:this}, this.scrollContent);
			this._$thumbPanel.bind("mousewheel", {elem:this}, this.scrollThumbs).bind("DOMMouseScroll", {elem:this}, this.scrollThumbs);
		}
		
		//init loading
		if (!msieCheck(6)) {
			this.loadImg(0);
		}
		
		//display image
		this.loadContent(this._currIndex);
		this.updateCPanel();
	}
	
	//mousewheel scroll content
	Gallery.prototype.scrollContent = function(e) {
		var that = e.data.elem;
		if (!that._$strip.is(":animated")) {
			var delta = (typeof e.originalEvent.wheelDelta == "undefined") ?  -e.originalEvent.detail : e.originalEvent.wheelDelta;
			delta > 0 ? that.prevImg() : that.nextImg();
		}
		return false;
	}
	
	//mousewheel scroll thumbs
	Gallery.prototype.scrollThumbs = function(e) {
		var that = e.data.elem;
		if (!that._$thumbList.is(":animated")) {
			var delta = (typeof e.originalEvent.wheelDelta == "undefined") ?  -e.originalEvent.detail : e.originalEvent.wheelDelta;
			delta > 0 ? that.prevThumbs() : that.nextThumbs();
		}
		return false;
	}
	
	Gallery.prototype.touchStart = function(e) {
		e.data.elem._slideCoord.start = e.originalEvent.touches[0].pageX;
	}
	
	Gallery.prototype.touchMove = function(e) {
		e.preventDefault();
		e.data.elem._slideCoord.end = e.originalEvent.touches[0].pageX;
	}
	
	Gallery.prototype.touchVStart = function(e) {
		e.data.elem._slideCoord.start = e.originalEvent.touches[0].pageY;
	}
	
	Gallery.prototype.touchVMove = function(e) {
		e.preventDefault();
		e.data.elem._slideCoord.end = e.originalEvent.touches[0].pageY;
	}
	
	Gallery.prototype.touchEnd = function (e) {
		var that = e.data.elem;
		if (that._slideCoord.end >= 0) {
			if (Math.abs(that._slideCoord.start - that._slideCoord.end) > SWIPE_MIN) {
				if (that._slideCoord.end < that._slideCoord.start) {
					that.nextImg();
				}
				else {
					that.prevImg();								
				}
			}
		}
		that._slideCoord.start = that._slideCoord.end = -1;
	}
	
	Gallery.prototype.thumbsTouchStart = function(e) {
		var that = e.data.elem;
		that._thumbCoord.start = e.originalEvent.touches[0].pageX;
	}
	
	Gallery.prototype.thumbsTouchMove = function(e) {
		e.preventDefault();
		e.data.elem._thumbCoord.end = e.originalEvent.touches[0].pageX;
	}
	
	Gallery.prototype.thumbsTouchEnd = function(e) {
		var that = e.data.elem;
		if (that._thumbCoord.end >= 0) {
			if (Math.abs(that._thumbCoord.start - that._thumbCoord.end) > SWIPE_MIN) {
				if (that._thumbCoord.end < that._thumbCoord.start) {
					that.nextThumbs();
				}
				else {
					that.prevThumbs();								
				}
			}
		}
		that._thumbCoord.start = that._thumbCoord.end = -1;
	}
	
	//add to screen
	Gallery.prototype.addToScreen = function(content) {
		this._$mainLink.append(content);
	}
	
	//config main screen
	Gallery.prototype.initScreen = function() {
		var content = "<div class='prev-btn'></div>\
						<div class='play-btn'></div>\
						<div class='next-btn'></div>\
						<div class='desc'></div>\
						<div class='info'>\
							<div class='s-panel'>\
								<div class='s-prev'></div>\
								<div class='s-info'></div>\
								<div class='s-play'></div>\
								<div class='s-next'></div>\
							</div>\
							<div class='inner-info'></div>\
							<div class='timer'></div>\
						</div>\
						<div class='preloader'></div>";
						
		this._$screen.append(content);
		this._$textBox = 	this._$screen.find(">.desc");
		this._$preloader = 	this._$screen.find(">.preloader");
		this._$infoPanel = 	this._$screen.find(">.info");
		this._$sPanel = this._$infoPanel.find(">.s-panel");
		
		this._$screen.css({width:this._screenWidth, height:this._screenHeight});
		this._textOffset = (msieCheck(6) && this._screenHeight % 2 != 0) ? -1 : 0;
		
		this._$strip = $("<div class='strip'></div>");
		if (this._globalEffect == "h.slide") {
			this._$screen.append(this._$strip);
			this._$strip.css({width:2*this._screenWidth, height:this._screenHeight});
			this._$thumbs.removeAttr("effect");
		}
		else if (this._globalEffect == "v.slide"){
			this._$screen.append(this._$strip);
			this._$strip.css({width:this._screenWidth, height:2*this._screenHeight});
			this._$thumbs.removeAttr("effect");
		}
		else {
			this._$screen.append("<a href='#'></a>");
			this._$mainLink =	this._$screen.find(">a:first");
		}
		
		//config components
		this.initTextBox();
		if (this._mouseoverButtons) {
			this.initMouseoverButtons();
		}
		else {
			this.initSmallButtons();
		}
		this.initInfoPanel();
		
		if (this._useFilter) {
			this._$textBox.addClass("ie-rgba");
			this._$infoPanel.addClass("ie-rgba");
		}
	}
	
	Gallery.prototype.initSmallButtons = function() {
		this._$screen.find(">.prev-btn, >.next-btn, >.play-btn").hide();
		this._$prevBtn = this._$sPanel.find(">.s-prev");
		this._$nextBtn = this._$sPanel.find(">.s-next");
		this._$playBtn = this._$sPanel.find(">.s-play");
		
		if (this._displayPlayBtn) {
			this._$playBtn.toggleClass("pause", this._autoStart).mousedown(preventDefault).bind("click", {elem:this}, this.togglePlay);
		}
		else {
			this._$playBtn.hide();
		}
		
		if (this._displayImgBtns) {
			this._$prevBtn.mousedown(preventDefault).bind("click", {elem:this}, this.prevImg);
			this._$nextBtn.mousedown(preventDefault).bind("click", {elem:this}, this.nextImg);
			if (!this._contImgNav) {
				this._$gallery.bind(UPDATE_CONTENT_BUTTONS, {elem:this}, this.updateImgBtns);
			}
		}
		else {
			this._$prevBtn.hide();
			this._$nextBtn.hide();
		}
	}
	
	Gallery.prototype.initMouseoverButtons = function() {
		this._$sPanel.find(">.s-prev, >.s-next, >.s-play").hide();
		this._$prevBtn = 	this._$screen.find(">.prev-btn");
		this._$nextBtn = 	this._$screen.find(">.next-btn");
		this._$playBtn =	this._$screen.find(">.play-btn");
		
		if (this._displayPlayBtn) {
			this._$playBtn.toggleClass("pause", this._autoStart).bind("click", {elem:this}, this.togglePlay);			
			var that = this;
			this._$screen.hover(function() { that._$playBtn.stop(true,true).fadeIn(ANIMATE_SPEED); }, function() { that._$playBtn.stop(true,true).fadeOut(ANIMATE_SPEED); });
		}
		else {
			this._$playBtn.hide();
		}
		
		if (this._displayImgBtns) {
			var prevBtnPos = 0;
			var nextBtnPos = this._screenWidth - this._$nextBtn.width();
			
			this._$prevBtn.data({offset:-this._$prevBtn.width(), pos:prevBtnPos})
						  .css({left:this._$prevBtn.data("offset"), visibility:"visible"})
						  .mousedown(preventDefault).bind("click", {elem:this}, this.prevImg);
			this._$nextBtn.data({offset:this._screenWidth, pos:nextBtnPos})
						  .css({left:this._$nextBtn.data("offset"), visibility:"visible"})
						  .mousedown(preventDefault).bind("click", {elem:this}, this.nextImg);
			this._$screen.bind("mouseenter", {elem:this}, this.displayDButtons).bind("mouseleave", {elem:this}, this.hideDButtons);
			
			if (!this._contImgNav) {
				this._$gallery.bind(UPDATE_CONTENT_BUTTONS, {elem:this}, this.updateImgBtns);
			}
		}
		else {
			this._$prevBtn.hide();
			this._$nextBtn.hide();
		}
	}
	
	//display d-buttons
	Gallery.prototype.displayDButtons = function(e) {
		var that = e.data.elem;
		that._$prevBtn.stop().animate({left:that._$prevBtn.data("pos")}, ANIMATE_SPEED);
		that._$nextBtn.stop().animate({left:that._$nextBtn.data("pos")}, ANIMATE_SPEED);
	}

	//hide d-buttons
	Gallery.prototype.hideDButtons = function(e) {
		var that = e.data.elem;		
		that._$prevBtn.stop().animate({left:that._$prevBtn.data("offset")}, ANIMATE_SPEED);
		that._$nextBtn.stop().animate({left:that._$nextBtn.data("offset")}, ANIMATE_SPEED);
	}
	
	//update d-buttons
	Gallery.prototype.updateImgBtns = function(e) {
		var that = e.data.elem;
		that._$prevBtn.toggleClass("off", that._currIndex == 0);
		that._$nextBtn.toggleClass("off", that._currIndex == that._numItems - 1);
	}
	
	//config text box
	Gallery.prototype.initTextBox = function() {
		var align, offset;
		if (this._textAlign == BOTTOM) {
			align = BOTTOM;
			offset = this._textOffset;
		}
		else {
			align = TOP;
			offset = 0;
		}
		
		this._$textBox.data("align", align).append("<div class='inner-text'></div>");
		this._$innerText = this._$textBox.find("div.inner-text");
		
		if (this._mouseoverText) {
			this._$textBox.css(align, -this._$textBox.height() + offset);
			this._$screen.data("hover", false).bind("mouseenter", {elem:this}, this.displayText).bind("mouseleave", {elem:this}, this.hideText);
		}
		else {
			this._$textBox.css(align, offset);
		}				
	}
	
	//update text box
	Gallery.prototype.updateText = function() {
		var text = this._$thumbs.eq(this._currIndex).find("div.data>div:first").html();
		var height = this._$thumbs.eq(this._currIndex).data("textHeight");
		if (this._mouseoverText && !this._$screen.data("hover")) {			
			this._$textBox.stop(true).css(this._$textBox.data("align"), -height).height(height);
			this._$innerText.html(text);
		}
		else {
			this._$innerText.html("");
			var that = this;
			this._$textBox.stop(true).animate({height:height}, ANIMATE_SPEED, 
										function () { 
											that._$innerText.css("opacity",0).html(text).animate({opacity:1}, ANIMATE_SPEED);
										});  	
		}
	}
	
	//display text
	Gallery.prototype.displayText = function(e) {
		var that = e.data.elem;
		that._$screen.data("hover", true);
		that._$textBox.stop(true, true).animate(that._$textBox.data("align") == TOP ? {top:0} : {bottom:that._textOffset}, ANIMATE_SPEED);
	}
	
	//hide text
	Gallery.prototype.hideText = function(e) {
		var that = e.data.elem;
		that._$screen.data("hover", false);
		that._$textBox.stop(true, true).animate(that._$textBox.data("align") == TOP ? {top:-that._$textBox.height()} : {bottom:-that._$textBox.height() + that._textOffset}, ANIMATE_SPEED);
	}
	
	//init info panel
	Gallery.prototype.initInfoPanel = function() {
		this._$timer = this._$infoPanel.find(">.timer").data("pct", 1);
		if (!this._displayImgNum && !this._displayTimer && !(this._displayPlayBtn && this._displayImgBtns && !this._mouseoverButtons)) {
			this._$infoPanel.hide();
			return;
		}
		
		var align, offset;
		if (this._$textBox.data("align") == TOP) {
			align = BOTTOM;
			offset = this._textOffset;
		}
		else {
			align = TOP;
			offset = 0;
		}				
		this._$infoPanel.data("align", align).css("visibility","visible");
		if (this._mouseoverInfo) {
			this._$infoPanel.css(align, -this._$infoPanel.height() + offset);
			this._$screen.bind("mouseenter", {elem:this}, this.displayInfo).bind("mouseleave", {elem:this}, this.hideInfo);
		}
		else {
			this._$infoPanel.css(align, offset);
		}
			
		this._$innerInfo = this._$infoPanel.find(".inner-info");
		if (this._displayImgNum) {
			this._$gallery.bind(UPDATE_CONTENT_INFO, {elem:this}, this.updateImgInfo);
		}
		else {
			this._$innerInfo.hide();
		}
		
		if (this._displayTimer) {
			this._$timer.css("visibility","visible");
		}
		
		
		if (this._displayImgNum) {
			if ((!this._displayPlayBtn && !this._mouseoverButtons) || this._mouseoverButtons) {
				this._$innerInfo.hide();			
				this._$innerInfo = this._$sPanel.find(">.s-info");
				var digits = getNumDigits(this._numItems);
				var str = "";
				for (var i = 0; i < digits; i++) { str += "0"; }
				this._$innerInfo.html(str + " / " + str).width(this._$innerInfo.width()).html("");
			}
		}
		this._$sPanel.css("marginLeft", -this._$sPanel.width()/2);
	}
	
	//display info panel
	Gallery.prototype.displayInfo = function(e) {
		var that = e.data.elem;
		that._$infoPanel.stop().animate((that._$infoPanel.data("align") == BOTTOM) ? {bottom:that._textOffset} : {top:0}, ANIMATE_SPEED);
	}
	
	//hide info panel
	Gallery.prototype.hideInfo = function(e) {
		var that = e.data.elem;
		that._$infoPanel.stop().animate((that._$infoPanel.data("align") == BOTTOM) ? {bottom:-that._$infoPanel.height() + that._textOffset} : {top:-that._$infoPanel.height()}, ANIMATE_SPEED);
	}
	
	//update image info
	Gallery.prototype.updateImgInfo = function(e) {
		var that = e.data.elem;
		that._$innerInfo.html((that._currIndex+1) + " / " + that._numItems);
	}
	
	//init items
	Gallery.prototype.initItems = function() {
		var $captions = this._$thumbs.find(">div:first>p:first");
		if (this._useFilter) {
			$captions.addClass("ie-rgba");
		}
		if (this._displayTooltip) {
			$captions.hide();
			this._$tooltip = $("<div id='gallery-tooltip'></div>").append("<div class='tt-txt'></div>");
			$("body").append(this._$tooltip);
			if (this._captionAlign == TOP) {
				this._$tooltip.data("bottom",false).addClass("txt-up");
			}
			else {
				this._$tooltip.data("bottom",true).addClass("txt-down");
			}
			
			if (msieCheck(6)) {
				this._$tooltip.css("background-image", "none").find(":only-child").css("margin",0);
			}
		}
		else {
			var pad = $captions.outerWidth() - $captions.width();
			$captions.width(this._thumbWidth - pad);
		}
		
		for (var i = 0; i < this._numItems; i++) {
			var $thumb = this._$thumbs.eq(i);
			var $box = $thumb.find(">div:first");
			var $imgLink = $box.find(">a:first");
			var $img = $imgLink.find("img");
			var $caption = $box.find(">p:first");
			var $p = $thumb.find(">div.data>div:first");
			var textHeight = ($p.length > 0 && $p.html() != "") ? this._$innerText.html($p.html()).outerHeight() : 0;
			var itemEffect = EFFECTS[$thumb.attr("effect")];
			
			if ((typeof itemEffect == "undefined") || itemEffect ==  EFFECTS["h.slide"] || itemEffect ==  EFFECTS["v.slide"]) {
				itemEffect = EFFECTS[this._globalEffect];
			}
			else {
				this.checkEffect(itemEffect);
			}
			$thumb.data({imgurl:$imgLink.attr("href"), caption:$caption.html(), effect:itemEffect, delay:getPosNumber($thumb.attr("delay"), this._globalDelay), textHeight:textHeight});
			
			$img[0].complete || $img[0].readyState == "complete" ? this.processImg($img) : $img.bind("load", {elem:this}, this.processLoadedImg);
			if ($caption.length > 0 && $caption.html() != "") {
				if (this._displayTooltip) {
					$box.bind("mouseenter", {elem:this}, this.showTooltip).bind("mouseleave", {elem:this}, this.hideTooltip).bind("mousemove", {elem:this}, this.moveTooltip);
				}
				else {															  
					if (this._mouseoverCaption) {
						$box.bind("mouseenter", {elem:this}, this.displayCaption).bind("mouseleave", {elem:this}, this.hideCaption);
						$caption.css("top", this._captionAlign == BOTTOM ? this._thumbHeight : -$caption.outerHeight());
					}
					else {
						$caption.css("top", this._captionAlign == BOTTOM ? this._thumbHeight - $caption.outerHeight() : 0);
					}
				}
			}
		}
		this._$innerText.html("");
		this._$textBox.css("visibility", "visible");
	}
	
	//select list item
	Gallery.prototype.selectItem = function(e) {
		var that = e.data.elem;
		var $item = $(e.target).parents("li").eq(0);
		var i = $item.index();
		if (i >= 0 && i != that._currIndex) {
			that._dir = i < that._currIndex ? PREV : NEXT;
			that._$gallery.trigger(RESET);
			that._prevIndex = that._currIndex;
			that._currIndex = i;
			that.loadContent(that._currIndex);
		}
		return false;
	}
	
	//display thumb caption
	Gallery.prototype.displayCaption = function(e) {
		var that = e.data.elem;
		var $caption = $(this).find(">p:first");
		$caption.stop().animate({top:(that._captionAlign == BOTTOM) ? that._thumbHeight - $caption.outerHeight() : 0}, 300);
	}
	
	//hide thumb caption
	Gallery.prototype.hideCaption = function(e) {
		var that = e.data.elem;
		var $caption = $(this).find(">p:first");
		$caption.stop().animate({top:(that._captionAlign == BOTTOM) ? that._thumbHeight : -$caption.outerHeight()}, 300);
	}
	
	//show tooltip
	Gallery.prototype.showTooltip = function(e) {
		var that = e.data.elem;
		var caption = $(this).parent().data("caption");
		var yOffset = that._$tooltip.data("bottom") ? 0 : -that._$tooltip.outerHeight(true);
		that._$tooltip.find(">div.tt-txt").html(caption);
		that._$tooltip.css({top:e.pageY + yOffset, left:e.pageX}).stop(true, true).delay(TOOLTIP_DELAY).fadeIn(300);
	}
	
	//tooltip move
	Gallery.prototype.moveTooltip = function(e) {
		var that = e.data.elem;
		var yOffset = that._$tooltip.data("bottom") ? 0 : -that._$tooltip.outerHeight(true);
		that._$tooltip.css({top:e.pageY + yOffset, left:e.pageX});
	}
	
	//hide tooltip
	Gallery.prototype.hideTooltip = function(e) {
		e.data.elem._$tooltip.stop(true, true).fadeOut(0);
	}
	
	//init control panel
	Gallery.prototype.initCPanel = function() {
		var that = this;
		this._$cpanel = this._$gallery.find(".cpanel");
		if (this._thumbsAlign == TOP) {
			this._$gallery.prepend(this._$cpanel);
			this._$thumbBoxes.css("marginTop", 0);
		}
		else {
			this._$thumbBoxes.css("marginBottom", 0);
		}
		
		//config thumbnails
		this._$thumbBoxes.css({width:this._thumbWidth, height:this._thumbHeight});
		this._$thumbs.css({"margin-right":this._thumbMargin});
		this._unitSize = this._$thumbs.outerWidth(true);
		this._$thumbPanel.css({width:(this._numDisplay * this._$thumbBoxes.outerWidth()) + ((this._numDisplay - 1) * this._thumbMargin), height:this._$thumbBoxes.outerHeight(true)})
					     .bind("click", {elem:this}, this.selectItem)
						 .bind("mouseenter", 
							function() {
								that._$gallery.unbind(ADJUST_THUMBS);
							})
						 .bind("mouseleave", 
							function() {
								that._$gallery.unbind(ADJUST_THUMBS).bind(ADJUST_THUMBS, {elem:that}, that.moveThumbs);
							});
		
		var num;
		if (this._displayIndex) {
			num = this._numDisplay * Math.ceil(this._numItems/this._numDisplay);
		}
		else {
			num = this._numItems;
		}
		this._$thumbList.width(num * this._unitSize);
		this._maxSlots = num - this._numDisplay;
		this._prevSlots = 0;
		this._nextSlots = this._maxSlots;
		
		this.initThumbButtons();
		this.initIndexBar();
		if (!this._displayIndex && !this._displayThumbBtns) {
			this._moveBy1 = true;
			this._contThumbNav = false;
			this._$thumbBoxes.bind("click", {elem:this}, this.itemMove);
		}
						
		this._selectStyle = this._displayArrow ? (this._thumbsAlign == TOP ? "down-arrow" : "up-arrow") : "curr";
		this._$cpanel.css({width:this._$thumbPanel.outerWidth() + this._$listBackButton.outerWidth() + this._$listFwdButton.outerWidth(), 
						   height:this._$thumbPanel.outerHeight() + this._$cpanel.find(".cbar").outerHeight()});
		
		this._$gallery.bind(ADJUST_THUMBS, {elem:this}, this.moveThumbs);
	}
	
	//config thumb buttons
	Gallery.prototype.initThumbButtons = function() {
		this._$listBackButton = this._$cpanel.find(".thumbs-back");
		this._$listFwdButton =  this._$cpanel.find(".thumbs-fwd");
		if (this._displayThumbBtns) {
			var height = this._$thumbBoxes.outerHeight();
			var margin = this._$thumbBoxes.css("margin-top");
			this._$listBackButton.css({height:height, marginTop:margin}).mousedown(preventDefault).bind("click", {elem:this}, this.prevThumbs);
			this._$listFwdButton.css({height:height,  marginTop:margin}).mousedown(preventDefault).bind("click", {elem:this}, this.nextThumbs);
			
			if (!this._contThumbNav) {
				this._$gallery.bind(UPDATE_THUMB_BUTTONS, {elem:this}, this.updateThumbBtns);
			}
		}
		else {
			this._$listBackButton.remove();
			this._$listFwdButton.remove();
		}
	}
	
	//config index bar
	Gallery.prototype.initIndexBar = function() {
		if (this._displayIndex || this._displayThumbInfo) {
			var content = "<div class='cbar'><div class='thumb-info'></div></div>";
			if (this._thumbsAlign == TOP) {
				this._$cpanel.prepend(content);
			}
			else {
				this._$cpanel.append(content);
			}
		}
		else {
			return;
		}
		var $lowerPanel = this._$cpanel.find(".cbar").css({width:this._$thumbPanel.outerWidth(), "margin-left":this._$listBackButton.outerWidth(), "margin-right":this._$listFwdButton.outerWidth()});
		if (this._displayThumbInfo) {
			this._$thumbInfo = this._$cpanel.find(".thumb-info");
			this._$gallery.bind(UPDATE_THUMB_INFO, {elem:this}, this.updateThumbInfo);
			if (!this._displayIndex) {
				this._$thumbInfo.css("width", "100%");
			}
		}
		else {
			this._$cpanel.find(".thumb-info").hide();
		}
		
		if (this._displayIndex) {
			var n = Math.ceil(this._numItems/this._numDisplay);
			var str = "<div class='index-panel'>";
			for (var i = 0; i < n; i++) {
				var beg = i * this._numDisplay;
				var end = Math.min(beg + this._numDisplay, this._numItems);
				str += "<div class='index' title='" + ((beg + 1) + "-" + end) + "'></div>";
			}
			str += "</div>";
			if (this._thumbsAlign == TOP) {
				$lowerPanel.prepend(str);
			}
			else {
				$lowerPanel.append(str);
			}
			this._$indexes = $lowerPanel.find(".index").mousedown(preventDefault).bind("click", {elem:this}, this.goToIndex);
			this._$gallery.bind(UPDATE_INDEX, {elem:this}, this.updateIndexes);
			var $indexPanel = $lowerPanel.find(".index-panel");
			$indexPanel.css({"padding-left":Math.floor(($lowerPanel.width() - $indexPanel.width())/2)});
		}
	}
		
	//update control panel
	Gallery.prototype.updateCPanel = function() {
		this._$gallery.trigger(UPDATE_INDEX).trigger(UPDATE_THUMB_INFO).trigger(UPDATE_THUMB_BUTTONS);
	}
	
	//update indexes
	Gallery.prototype.updateIndexes = function(e) {
		var that = e.data.elem;
		var i = Math.ceil(that._prevSlots/that._numDisplay);
		that._$indexes.filter(".index-hl").removeClass("index-hl");
		that._$indexes.eq(i).addClass("index-hl");
	}
	
	//update thumb info
	Gallery.prototype.updateThumbInfo = function(e) {
		var that = e.data.elem;
		var start = -(that._pos/that._unitSize);
		var end = Math.min(start + that._numDisplay, that._numItems);
		that._$thumbInfo.html((start + 1) + " - " + end + " of " + that._numItems);
	}
	
	//update thumb buttons
	Gallery.prototype.updateThumbBtns = function(e) {
		var that = e.data.elem;
		var start = Math.abs(that._pos/that._unitSize);
		var end = start + that._numDisplay;
		that._$listBackButton.toggleClass("off", start <= 0);
		that._$listFwdButton.toggleClass("off", end >= that._numItems);
	}
	
	
	Gallery.prototype.togglePlay = function(e) {
		var that = e.data.elem;
		that._rotate = !that._rotate;		
		if (that._rotate) {
			$(this).addClass("pause");
			that._$gallery.trigger(START);
		}
		else {
			$(this).removeClass("pause");
			that._$gallery.trigger(PAUSE);
		}
	}
	
	//previous image
	Gallery.prototype.prevImg = function(e) {
		var that = (typeof e != "undefined") ? e.data.elem : this;
		if (that._currIndex > 0) {
			that._prevIndex = that._currIndex;
			that._currIndex--;
		}
		else if (that._contImgNav) {
			that._prevIndex = that._currIndex;
			that._currIndex = that._numItems - 1;
		}
		else {
			return;
		}
		that._dir = PREV;
		that._$gallery.trigger(RESET);
		that.loadContent(that._currIndex);
		that._$gallery.trigger(ADJUST_THUMBS);
		return false;
	}
	
	//next image
	Gallery.prototype.nextImg = function(e) {
		var that = (typeof e != "undefined") ? e.data.elem : this;
		if (that._currIndex < that._numItems - 1) {
			that._prevIndex = that._currIndex;
			that._currIndex++;
		}
		else if (that._contImgNav) {
			that._prevIndex = that._currIndex;
			that._currIndex = 0;
		}
		else {
			return;
		}
		that._dir = NEXT;
		that._$gallery.trigger(RESET);
		that.loadContent(that._currIndex);
		that._$gallery.trigger(ADJUST_THUMBS);
		return false;
	}
	
	//get previous thumbs
	Gallery.prototype.prevThumbs = function(e) {
		var that = (typeof e != "undefined") ? e.data.elem : this;
		if (that._nextSlots < that._maxSlots) {
			var slots = that._moveBy1 ? 1 : Math.min(that._maxSlots - that._nextSlots, that._numDisplay);
			that._nextSlots += slots;
			that._prevSlots -= slots;
		}
		else if (that._contThumbNav) {
			that._nextSlots = 0;
			that._prevSlots = that._maxSlots;
		}
		else {
			return;
		}
		that.moveList();
		return false;
	}
		
	//get next thumbs
	Gallery.prototype.nextThumbs = function(e) {
		var that = (typeof e != "undefined") ? e.data.elem : this;
		if (that._prevSlots < that._maxSlots) {
			var slots = that._moveBy1 ? 1 : Math.min(that._maxSlots - that._prevSlots, that._numDisplay);
			that._prevSlots += slots;
			that._nextSlots -= slots;
		}
		else if (that._contThumbNav) {
			that._prevSlots = 0;
			that._nextSlots = that._maxSlots;
		}
		else {
			return;
		}
		that.moveList();
		return false;
	}
	
	//move list
	Gallery.prototype.moveList = function() {
		this._pos = -this._prevSlots * this._unitSize;
		this._$thumbList.stop(true, true).animate({left:this._pos}, this._scrollSpeed);
		this.updateCPanel();
	}
	
	//item click move
	Gallery.prototype.itemMove = function(e) {
		var that = e.data.elem;
		var index = ($(this).parents("li").eq(0).index() - that._prevSlots)%that._numDisplay
		if (index+1 == that._numDisplay) {
			that.nextThumbs();
		}
		else if (index == 0) {
			that.prevThumbs();
		}
	}
	
	//move thumbs
	Gallery.prototype.moveThumbs = function(e) {
		var that = e.data.elem;
		that._prevSlots = Math.floor(that._currIndex/that._numDisplay) * that._numDisplay;
		if (!that._displayIndex && that._prevSlots > that._maxSlots) {
			that._prevSlots = that._maxSlots;
		}
		that._nextSlots = that._maxSlots - that._prevSlots;
		that.moveList();
	}
	
	//go to index			
	Gallery.prototype.goToIndex = function(e) {
		var that = e.data.elem;
		that._prevSlots = $(this).index() * that._numDisplay;
		that._nextSlots = that._maxSlots - that._prevSlots;
		that.moveList();
		return false;
	}
	
	//gallery mouseover
	Gallery.prototype.galleryOver = function(e) {
		var that = e.data.elem;
		that._rotate = false;
		that._$playBtn.removeClass("pause");
		that._$gallery.trigger(PAUSE);
	}
	
	//gallery mouseout
	Gallery.prototype.galleryOut = function(e) {
		var that = e.data.elem;
		that._rotate = true;
		that._$playBtn.addClass("pause");
		that._$gallery.trigger(START);
	}
	
	//pause on last
	Gallery.prototype.pauseLast = function(i) {
		if (i == this._numItems - 1) {
			this._rotate = false;
			this._$playBtn.removeClass("pause");
			this._$gallery.trigger(PAUSE);
		}
	}
	
	//load content
	Gallery.prototype.loadContent = function(i) {
		if (this._playOnce) {
			this.pauseLast(i);
		}
		
		//select current thumb
		var $item = this._$thumbs.eq(i);
		this._$thumbs.filter("." + this._selectStyle).removeClass(this._selectStyle);
		$item.addClass(this._selectStyle);
		
		//set delay
		this._delay = $item.data("delay");
		
		//update link
		if (this._$mainLink) {
			var $currLink = $item.find("div.data>a");
			var href = $currLink.attr("href");
			if (href) {
				this._$mainLink.unbind("click", preventDefault).css({cursor:"pointer"}).attr({href:href, target:$currLink.attr("target")});
			}
			else {
				this._$mainLink.click(preventDefault).css({cursor:"default"});
			}
		}
		
		this._$gallery.trigger(UPDATE_CONTENT_INFO).trigger(UPDATE_CONTENT_BUTTONS);
		this.updateText();
		
		//load image
		if ($item.data("img")) {
			this._$preloader.hide();
			this.displayContent($item.data("img"));
		}	
		else {	
			//load new image
			var $img = $("<img class='main-img'/>");
			var that = this;
			$img.load(
				function() {
					that._$preloader.hide();
					that.storeImg($item, $(this));
					that.displayContent($(this));
				}
			).error(
				function() {
					alert("Error loading image");
				}
			);
			this._$preloader.show();
			$img.attr("src", $item.data("imgurl"));
		}	    
	}
		
	//display content
	Gallery.prototype.displayContent = function($img) {
		if (this._vStripeEffect) {
			this._vStripes.clear();
		}
		if (this._hStripeEffect) {
			this._hStripes.clear();
		}				
		if (this._vStripeEffect || this._hStripeEffect) {
			this.setPrevious();
		}
		var effect = this._$thumbs.eq(this._currIndex).data("effect");
		if (effect == EFFECTS["none"] || (typeof effect == "undefined")) {
			this.showContent($img);
			return;
		}		
		else if (effect == EFFECTS["fade"]) {
			this.fadeInContent($img);
			return;
		}
		else if (effect == EFFECTS["h.slide"]) {
			this.slideContent($img, "left", this._screenWidth);
			return;
		}
		else if (effect == EFFECTS["v.slide"]) {
			this.slideContent($img, "top", this._screenHeight);
			return;
		}
		
		if (effect == EFFECTS["random"]) {
			effect = Math.floor(Math.random() * (ei - 5));
		}				
		
		if (effect <= EFFECTS["vert.random.fade"]){
			this._vStripes.displayContent($img, effect);
		}
		else if (effect <= EFFECTS["horz.random.fade"]){
			this._hStripes.displayContent($img, effect);
		}
	}
	
	//set previous
	Gallery.prototype.setPrevious = function() {
		if (this._prevIndex >= 0) {
			var currSrc = this._$mainLink.find("img#curr-img").attr("src");
			var prevSrc = this._$thumbs.eq(this._prevIndex).data("imgurl");
			if (currSrc != prevSrc) {
				this._$mainLink.find("img.main-img").attr("id","").hide();
				var $img = this._$mainLink.find("img.main-img").filter(function() { return $(this).attr("src") == prevSrc; });
				$img.eq(0).show();
			}
		}
	}
	
	//display image (no effect)
	Gallery.prototype.showContent = function($img) {
		this._$mainLink.find("img.main-img").attr("id","").hide();
		$img.attr("id", "curr-img").show();
		this._$gallery.trigger(START);
	}
	
	//display content (fade effect)
	Gallery.prototype.fadeInContent = function($img) {
		this._$mainLink.find("img#curr-img").stop(true, true);
		this._$mainLink.find("img.main-img").attr("id","").css("z-index", 0);
		var that = this;
		$img.attr("id", "curr-img").css("z-index", 1).stop(true, true).fadeIn(this._duration, 
			function() {
				that._$mainLink.find("img.main-img:not('#curr-img')").hide();
				that._$gallery.trigger(START);
			}
		);
	}
	
	//slide content
	Gallery.prototype.slideContent = function($currImg, pos, moveby) {
		this._$strip.stop(true,true);
		var $prevImg = this._$strip.find("#curr-img");
		if ($prevImg.size() > 0) {
			this._$strip.find(".main-img").attr("id","").parents(".content-box").css({top:0,left:0});
			$currImg.attr("id", "curr-img").parents(".content-box").show();
			var $img, dest;
			if (this._dir == PREV) {
				this._$strip.css(pos, -moveby);
				$img = $prevImg;
				dest = 0;
			}
			else {
				$img = $currImg;
				dest = -moveby;
			}
			$img.parents(".content-box").css(pos,moveby);
			var prop = (pos == "top") ? {top:dest} : {left:dest};
			var that = this;
			this._$strip.stop(true,true).animate(prop, this._duration, this._easing,
								function() {
									that._$strip.find(".main-img:not('#curr-img')").parents(".content-box").hide();
									$img.parents(".content-box").css({top:0,left:0});
									that._$strip.css({top:0,left:0});
									that._$gallery.trigger(START);
								});
		}
		else {
			this._$strip.css({top:0,left:0});
			this._$strip.find(".main-img").parents(".content-box").hide().css({top:0,left:0});
			$currImg.attr("id", "curr-img").parents(".content-box").show();
			this._$gallery.trigger(START);
		}
	}
	
	//process loaded thumb image
	Gallery.prototype.processLoadedImg = function(e) {
		e.data.elem.processImg($(this));
	}
	
	//process thumb image
	Gallery.prototype.processImg = function($img) {
		var ratio;
		if ($img.outerWidth() > this._thumbWidth) {
			ratio = $img.outerHeight()/$img.outerWidth();
			$img.width(this._thumbWidth);
			$img.height(ratio * this._thumbWidth);
		}
		
		if ($img.outerHeight() > this._thumbHeight) {
			ratio = $img.outerWidth()/$img.outerHeight();
			$img.width(ratio * this._thumbHeight);
			$img.height(this._thumbHeight);
		}
		$img.css({left:Math.round((this._thumbWidth - $img.outerWidth())/2), top:Math.round((this._thumbHeight - $img.outerHeight())/2)});
	}
	
	//load image
	Gallery.prototype.loadImg = function(loadIndex) {
		try {
			var $item = this._$thumbs.eq(loadIndex);
			var $img = $("<img class='main-img'/>");
			var that = this;
			$img.load(function() {
						if (!$item.data("img")) {
							that.storeImg($item, $(this));
						}
						loadIndex++
						if (loadIndex < that._numItems) {
							that.loadImg(loadIndex);
						}
					})
				.error(function() {
						//error loading image, continue next
						loadIndex++
						if (loadIndex < that._numItems) {
							that.loadImg(loadIndex);
						}
					});
			$img.attr("src", $item.data("imgurl"));	
		}
		catch(ex) {}
	}
	
	//process & store image
	Gallery.prototype.storeImg = function($item, $img) {
		if (this._globalEffect == "h.slide" || this._globalEffect == "v.slide") {
			this._$strip.append($img);
			this.centerImg($img);
			var $div = $("<div class='content-box'></div>").css({width:this._screenWidth, height:this._screenHeight});
			$img.wrap($div);
			$img.css("display","block");
			var $link = $item.find("div.data>a");
			if ($link) {
				$img.wrap($link);
			}
		}
		else {
			this._$mainLink.append($img);
			this.centerImg($img);
		}
		$item.data("img", $img);
	}
	
	Gallery.prototype.centerImg = function($img) {
		if (this._autoCenter && $img.width() > 0 && $img.height() > 0) {
			var tDiff = (this._screenHeight - $img.height())/2;
			var lDiff = (this._screenWidth  - $img.width())/2;
			$img.css({top:tDiff, left:lDiff});
		}
	}
	
	//shuffle items
	Gallery.prototype.shuffleItems = function() {
		var $items = new Array(this._numItems);
		for (var i = 0; i < this._numItems; i++) {
			var ri = Math.floor(Math.random() * this._numItems);
			var temp = this._$thumbs.eq(i);
			$items[i] = this._$thumbs.eq(ri);
			$items[ri] = temp;
		}
		
		for (var i = 0; i < this._numItems; i++) {
			this._$thumbList.append($items[i]);
		}
		
		this._$thumbs = this._$thumbList.find(">li");
	}
	
	//start timer
	Gallery.prototype.startTimer = function(e) {
		var that = e.data.elem;
		if (that._rotate && that._timerId == null) {
			var dur = Math.round(that._$timer.data("pct") * that._delay);
			that._$timer.animate({width:(that._screenWidth+1)}, dur, "linear");
			that._timerId = setTimeout(function() {
											that._dir = NEXT;
											that._prevIndex = that._currIndex;
											that._currIndex = (that._currIndex < that._numItems - 1) ? that._currIndex + 1 : 0;
											that._$gallery.trigger(RESET);
											that.loadContent(that._currIndex);
											that._$gallery.trigger(ADJUST_THUMBS);
										}, dur);
		}
	}
	
	//reset timer
	Gallery.prototype.resetTimer = function(e) {
		var that = e.data.elem;
		clearTimeout(that._timerId);
		that._timerId = null;
		that._$timer.stop(true).width(0).data("pct", 1);
	}
	
	//pause timer
	Gallery.prototype.pauseTimer = function(e) {
		var that = e.data.elem;
		clearTimeout(that._timerId);
		that._timerId = null;
		var pct = 1 - (that._$timer.width()/(that._screenWidth+1));
		that._$timer.stop(true).data("pct", pct);
	}
	
	//check effect
	Gallery.prototype.checkEffect = function(num) {
		if (num == EFFECTS["random"]) {
			this._hStripeEffect = this._vStripeEffect = true;
		}
		else if (num <= EFFECTS["vert.random.fade"]) {
			this._vStripeEffect = true;
		}
		else if (num <= EFFECTS["horz.random.fade"]) {
			this._hStripeEffect = true;
		}
	}
	
	//key press handler
	Gallery.prototype.onKeyPress = function(e) {
		var that = e.data.elem;
		switch(e.keyCode) {
			case 37:
				that.prevImg();
				break;
			case 39:
				that.nextImg();
				break;
		}
	}
	
	//prevent default behavior
	function preventDefault() {
		return false;
	}
	
	//msie ver. check
	function msieCheck(ver) {
		if (jQuery.browser.msie && parseInt(jQuery.browser.version) <= ver) {
			return true;
		}
		return false;
	}
	
	//shuffle array
	function shuffleArray(arr) {
		var total =  arr.length;
		for (var i = 0; i < total; i++) {
			var ri = Math.floor(Math.random() * total);
			var temp = arr[i];
			arr[i] = arr[ri];
			arr[ri] = temp;
		}	
	}
	
	//get positive number
	function getPosNumber(val, defaultVal) {
		if (!isNaN(val) && val > 0) {
			return val;
		}
		return defaultVal;
	}
	
	//get nonnegative number
	function getNonNegNumber(val, defaultVal) {
		if (!isNaN(val) && val >= 0) {
			return val;
		}
		return defaultVal;
	}
	
	//get number of digits
	function getNumDigits(num) {
		var count = 1;
		num = Math.abs(num);
		num = parseInt(num/10);
		while(num > 0) {
			count++;
			num = parseInt(num/10);
		}
		return count;
	}
	
	$.fn.wtGallery = function(params) {		
		var defaults = { 
			num_display:5,
			screen_width:720,
			screen_height:360,
			padding:10,
			thumb_width:125,
			thumb_height:70,
			thumb_margin:5,
			text_align:TOP,
			caption_align:BOTTOM,
			auto_rotate:true,
			delay:DEFAULT_DELAY,			
			rotate_once:false,
			auto_center:true,
			cont_imgnav:true,
			cont_thumbnav:true,
			display_play:true,
			display_imgnav:true,		
			display_imgnum:true,
			display_thumbnav:true,
			display_thumbnum:false,
			display_arrow:true,	
			display_tooltip:false,
			display_timer:true,
			display_indexes:true,
			mouseover_pause:false,
			mouseover_text:false,
			mouseover_info:false,
			mouseover_caption:true,
			mouseover_buttons:true,
			transition:"h.slide",
			transition_speed:DURATION,
			scroll_speed:SCROLL_SPEED,
			vert_size:STRIPE_SIZE,
			horz_size:STRIPE_SIZE,
			vstripe_delay:INTERVAL_DELAY,
			hstripe_delay:INTERVAL_DELAY,
			move_one:false,
			shuffle:false,
			easing:"",
			mousewheel_scroll:true,
			thumbnails_align:BOTTOM
		};
		
		var opts = $.extend({}, defaults, params);
		return this.each(
			function() {
				var gallery = new Gallery($(this), opts);
			}
		);
	}
})(jQuery);