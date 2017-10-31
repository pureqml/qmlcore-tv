var Player = function(ui) {
	var player = ui._context.createElement('object')
	player.dom.setAttribute("id", "av-player")
	player.dom.setAttribute("type", "application/avplayer")
	if (!window.webapis) {
		log('"webapis" is undefined, maybe <script src="$WEBAPIS/webapis/webapis.js"></script> is missed.')
		return
	}
	this._webapis = window.webapis
	log("WEBAPIS", this._webapis)

	this.ui = ui

	ui.element.remove()
	ui.element = player
	ui.parent.element.append(ui.element)

	//old onCompleted:
	var self = this
	this._listener = {
		onbufferingstart : function() {
		log("onbufferingstart")
		self.waiting = true
		},
		onbufferingprogress : function(percent) {
			log("onbufferingprogress")
		},
		onbufferingcomplete : function() {
			log("onbufferingcomplete")
			self.waiting = false
		},
		oncurrentplaytime : function(currentTime) {
			self.seeking = false
			self.updateCurrentTime(currentTime);
		},
		onevent : function(eventType, eventData) {
			log("event type: " + eventType + ", data: " + eventData);
		},
		onerror : function(eventType) {
			log("error type: " + eventType);
			self.ready = false
			self.error(eventType)
		},
		onsubtitlechange : function(duration, text, data3, data4) {
			log("Subtitle Changed.");
		},
		ondrmevent : function(drmEvent, drmData) {
			log("DRM callback: " + drmEvent + ", data: " + drmData);
		},
		onstreamcompleted : function() {
			log("Stream Completed");
			self.ready = false
			self.finished()
		}
	};

	this._webapis.network.addNetworkStateChangeListener(function(data) {
		if (data == 4) {		// Network is connected again.
			self.networkConnected = true
		} else if (data == 5) {	// Network is disconnected.
			self.networkConnected = false
		}
	})
}

Player.prototype.setSource = function(value) {
	log("src", value)
	this.ready = false
	var webapis = this._webapis
	var state = webapis.avplay.getState()
	if (state == "PLAYING" || state == "PAUSED")
		this.closeVideo()
	this.playImpl()
}

Player.prototype.playImpl = function() {
	log("playImpl")
	var webapis = this._webapis
	this.ui.duration = 0
	log("playImpl open")
	webapis.avplay.open(this.source);
	log("playImpl setListener")
	webapis.avplay.setListener(this._listener);
	log("playImpl prepare")
	webapis.avplay.prepare();
	log("Init player, src:", this.source, "width:", this.width, "height:", this.height)
	webapis.avplay.setDisplayRect(this.x, this.y, this.width, this.height);
	log("Current state: " + webapis.avplay.getState());
	log("prepare complete");
	this.updateDuration()
	this.ui.ready = webapis.avplay.getState() === "READY"
}

Player.prototype.play = function() {
	var webapis = this._webapis
	log("Current state: " + webapis.avplay.getState());
	log('Play Video', this.source);
	try {
		webapis.avplay.play();
		this.paused = webapis.avplay.getState() == "PAUSED"
		log("Current state: " + webapis.avplay.getState());
	} catch (e) {
		log("Current state: " + webapis.avplay.getState());
		log(e);
	}
}

//fixme: move this logic to core?
Player.prototype.setVisibility = function(visible) {
	var webapis = this._webapis
	if (!webapis)
		return

	if (visible) {
		webapis.avplay.restore()
		if (webapis.avplay.getState() == "PLAYING")
			this.closeVideo()
		this.playImpl()
	} else {
		webapis.avplay.suspend()
	}
}

Player.prototype.pause = function() {
	var webapis = this._webapis
	log("Current state: " + webapis.avplay.getState());
	log('Pause Video');
	try {
		webapis.avplay.pause();
		this.paused = webapis.avplay.getState() == "PAUSED"
		log("Current state: " + webapis.avplay.getState());
	} catch (e) {
		log("Current state: " + webapis.avplay.getState());
		log(e);
	}
}

//missing API in VideoPlayer
Player.prototype.stop = function() {
	var webapis = this._webapis
	log("Current state: " + webapis.avplay.getState());
	log('Stop Video');
	try {
		webapis.avplay.stop();
		log("Current state: " + webapis.avplay.getState());
	} catch (e) {
		log("Current state: " + webapis.avplay.getState());
		log(e);
	}
}

Player.prototype.seek = function(delta) {
	this.seekTo(this.ui.progress + val)
}

Player.prototype.seekTo = function(tp) {
	log("Seek to", tp, this.ui.progress)
	this.seeking = true
	this._webapis.avplay.seekTo(tp * 1000)
}

Player.prototype.setVolume = function(volume) {
}

Player.prototype.setMute = function(muted) {
}

Player.prototype.setRect = function(l, t, r, b) {
	var webapis = this._webapis
	webapis.avplay.setDisplayRect(l, t, r - l, b - t)
}

Player.prototype.setBackgroundColor = function(color) {
}

Player.prototype.closeVideo = function() {
	var webapis = this._webapis
	log("Current state: " + webapis.avplay.getState());
	log('Close Video');
	try {
		webapis.avplay.close();
		log("Current state: " + webapis.avplay.getState());
	} catch (e) {
		log("Current state: " + webapis.avplay.getState());
		log(e);
	}
}

Player.prototype.updateDuration = function() {
	//duration is given in millisecond
	var webapis = this._webapis
	this.ui.duration = webapis.avplay.getDuration() / 1000
	log("Duration", this.ui.duration)
}

Player.prototype.updateCurrentTime = function() {
	var webapis = this._webapis
	this.ui.progress = webapis.avplay.getCurrentTime() / 1000
}

exports.createPlayer = function(ui) {
	return new Player(ui)
}

exports.probeUrl = function(url) {
	return 75
}
