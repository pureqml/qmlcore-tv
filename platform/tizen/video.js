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
		self.ui.waiting = true
		},
		onbufferingprogress : function(percent) {
			log("onbufferingprogress")
		},
		onbufferingcomplete : function() {
			log("onbufferingcomplete")
			self.ui.seeking = false
			self.ui.waiting = false
		},
		oncurrentplaytime : function(currentTime) {
			self.ui.seeking = false
			self.updateCurrentTime(currentTime);
		},
		onevent : function(eventType, eventData) {
			log("event type: " + eventType + ", data: " + eventData);
		},
		onerror : function(eventType) {
			log("error type: " + eventType);
			self.ui.ready = false
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
			self.ui.ready = false
			self.ui.finished()
		}
	};
}

Player.prototype.getAVPlay = function() {
	var webapis = this._webapis
	return webapis && webapis.avplay ? webapis.avplay : null
}

Player.prototype.setSource = function(value) {
	log("src", value)
	this.ui.ready = false
	this.playImpl()
}

Player.prototype.playImpl = function() {
	var avplay = this.getAVPlay()
	if (!avplay) {
		log("AVPlay was not initialized")
		return
	}
	var state = avplay.getState()
	var ui = this.ui
	log("playImpl", state, "src", ui.source)

	if (state != 'NONE')
		this.closeVideo()

	if (!ui.source)
		return

	log("playImpl", ui.source, "state", state)
	ui.duration = 0

	log("playImpl open")
	avplay.open(ui.source);
	log("playImpl setListener")
	avplay.setListener(this._listener);
	log("Init player, src:", ui.source, "width:", ui.width, "height:", ui.height)
	avplay.setDisplayRect(ui.x, ui.y, ui.width, ui.height);

	var selectedSource = ui.source
	log("playImpl prepareAync")
	avplay.prepare();
	log("Current state: " + avplay.getState());
	log("prepare complete", selectedSource, "source", ui.source);
	this.updateDuration()
	ui.ready = avplay.getState() === "READY"
	log("prepare complete", ui.ready, "autoplay", ui.autoPlay);
	if (ui.autoPlay)
		this.play()
}

Player.prototype.play = function() {
	var avplay = this.getAVPlay()
	if (!avplay) {
		log("AVPlay was not initialized")
		return
	}
	log('Play Video', this.ui.source);
	try {
		avplay.play();
		this.ui.paused = avplay.getState() == "PAUSED"
		log("Current state: " + avplay.getState());
	} catch (e) {
		log(e);
	}
}

//fixme: move this logic to core?
Player.prototype.setVisibility = function(visible) {
	var avplay = this.getAVPlay()
	if (!avplay) {
		log("AVPlay was not initialized")
		return
	}

	log("setVisibility", visible, "state", avplay.getState())
	if (visible) {
		if (this.ui.autoPlay)
			this.playImpl()
	} else {
		avplay.suspend()
	}
}

Player.prototype.pause = function() {
	var avplay = this.getAVPlay()
	if (!avplay) {
		log("AVPlay was not initialized")
		return
	}

	log('Pause Video', avplay);
	try {
		avplay.pause();
		this.ui.paused = avplay.getState() == "PAUSED"
		log("Current state: " + avplay.getState());
	} catch (e) {
		log(e);
	}
}

//missing API in VideoPlayer
Player.prototype.stop = function() {
	var avplay = this.getAVPlay()
	if (!avplay) {
		log("AVPlay was not initialized")
		return
	}

	log("Current state: " + avplay.getState());
	log('Stop Video');
	try {
		avplay.stop();
		log("Current state: " + avplay.getState());
	} catch (e) {
		log("Current state: " + avplay.getState());
		log(e);
	}
}

Player.prototype.seek = function(delta) {
	this.seekTo(this.ui.progress + delta)
}

Player.prototype.seekTo = function(tp) {
	var avplay = this.getAVPlay()
	if (!avplay) {
		log("AVPlay was not initialized")
		return
	}
	log("Seek to", tp, this.ui.progress)
	this.ui.seeking = true
	avplay.seekTo(tp * 1000)
}

Player.prototype.setVolume = function(volume) {
}

Player.prototype.setMute = function(muted) {
}

Player.prototype.setRect = function(l, t, r, b) {
	var avplay = this.getAVPlay()
	if (!avplay) {
		log("AVPlay was not initialized")
		return
	}
	avplay.setDisplayRect(l, t, r - l, b - t)
}

Player.prototype.setBackgroundColor = function(color) {
}

Player.prototype.closeVideo = function() {
	var avplay = this.getAVPlay()
	if (!avplay) {
		log("AVPlay was not initialized")
		return
	}
	log("Current state: " + avplay.getState());
	log('Close Video');
	try {
		avplay.close();
		log("Current state: " + avplay.getState());
	} catch (e) {
		log("Current state: " + avplay.getState());
		log(e);
	}
}

Player.prototype.updateDuration = function() {
	var avplay = this.getAVPlay()
	if (!avplay) {
		log("AVPlay was not initialized")
		return
	}
	this.ui.duration = avplay.getDuration() / 1000
	log("Duration", this.ui.duration)
}

Player.prototype.updateCurrentTime = function() {
	var avplay = this.getAVPlay()
	if (!avplay) {
		log("AVPlay was not initialized")
		return
	}
	this.ui.progress = avplay.getCurrentTime() / 1000
}

exports.createPlayer = function(ui) {
	return new Player(ui)
}

exports.probeUrl = function(url) {
	return 75
}
