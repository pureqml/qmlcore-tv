Item {
	signal error;
	signal finished;
	property string	source;
	property Color	backgroundColor: "#000";
	property float	volume: 1.0;
	property bool	loop;
	property bool	ready;
	property bool	muted;
	property bool	paused;
	property bool	waiting;
	property bool	seeking;
	property bool	autoPlay;
	property bool	networkConnected: true;
	property int	duration;
	property int	progress;
	property int	buffered;

	play: {
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

	onRecursiveVisibleChanged: {
		var webapis = this._webapis
		if (!webapis)
			return

		if (value) {
			webapis.avplay.restore()
			if (webapis.avplay.getState() == "PLAYING")
				this.closeVideo()
			if (this.autoPlay)
				this.playImpl()
		} else {
			webapis.avplay.suspend()
		}
	}

	closeVideo: {
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

	pause: {
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

	stop: {
		var webapis = this._webapis
		log("Current state: " + webapis.avplay.getState());
		var state = webapis.avplay.getState()
		if (state == "PLAYING" || state == "PAUSED") {
			log('Stop Video');
			try {
				webapis.avplay.stop();
				log("Current state: " + webapis.avplay.getState());
			} catch (e) {
				log("Current state: " + webapis.avplay.getState());
				log(e);
			}
		}
	}

	seek(val): { this.seekTo(this.progress + val) }

	seekTo(val): {
		log("Seek to", val, this.progress)
		this.seeking = true
		this._webapis.avplay.seekTo(val * 1000)
	}

	updateDuration: {
		//duration is given in millisecond
		var webapis = this._webapis
		this.duration = webapis.avplay.getDuration() / 1000;
		log("Duration", this.duration)
	}

	updateCurrentTime: {
		var webapis = this._webapis
		this.progress = webapis.avplay.getCurrentTime() / 1000;
	}

	onAutoPlayChanged: {
		if (value)
			this.play()
	}

	onXChanged: { this.updateRect() }
	onYChanged: { this.updateRect() }
	onWidthChanged: { this.updateRect() }
	onHeightChanged: { this.updateRect() }

	onSourceChanged: {
		this.ready = false
		var webapis = this._webapis
		log("src", value)
		this.playImpl()
	}

	updateRect: {
		var webapis = this._webapis
		webapis.avplay.setDisplayRect(this.x, this.y, this.width, this.height);
	}

	constructor: {
		var player = this._context.createElement('object')
		player.dom.setAttribute("id", "av-player")
		player.dom.setAttribute("type", "application/avplayer")
		if (!window.webapis) {
			log('"webapis" is undefined, maybe <script src="$WEBAPIS/webapis/webapis.js"></script> is missed.')
			return
		}
		this._webapis = window.webapis
		log("WEBAPIS", this._webapis)

		this.element.remove()
		this.element = player
		this.parent.element.append(this.element)
	}

	playImpl: {
		var webapis = this._webapis
		var state = webapis.avplay.getState()
		if (state != 'NONE')
			this.closeVideo()
		if (!this.source)
			return
		log("playImpl", this.source, "state", state)
		this.duration = 0

		log("playImpl open")
		webapis.avplay.open(this.source);
		log("playImpl setListener")
		webapis.avplay.setListener(this._listener);
		log("Init player, src:", this.source, "width:", this.width, "height:", this.height)
		webapis.avplay.setDisplayRect(this.x, this.y, this.width, this.height);

		var self = this
		var selectedSource = this.source
		log("playImpl prepareAync")
		webapis.avplay.prepareAsync(function() {
			log("Current state: " + webapis.avplay.getState());
			log("prepare complete", selectedSource, "sour", self.source);
			self.updateDuration()
			self.ready = webapis.avplay.getState() === "READY"
			if (self.autoPlay)
				self.play()
		}.bind(this), function(event) { log("Failed to prepare"); self.error(event) }.bind(this))
	}

	onCompleted: {
		var self = this
		this._listener = {
			onbufferingstart : function() {
				log("onbufferingstart")
				self.waiting = true
			}.bind(this),
			onbufferingprogress : function(percent) {
				log("onbufferingprogress")
			}.bind(this),
			onbufferingcomplete : function() {
				log("onbufferingcomplete")
				self.waiting = false
			}.bind(this),
			oncurrentplaytime : function(currentTime) {
				self.seeking = false
				self.updateCurrentTime(currentTime);
			}.bind(this),
			onevent : function(eventType, eventData) {
				log("event type: " + eventType + ", data: " + eventData);
			}.bind(this),
			onerror : function(eventType) {
				log("error type: " + eventType);
				self.ready = false
				self.error(eventType)
			}.bind(this),
			onsubtitlechange : function(duration, text, data3, data4) {
				log("Subtitle Changed.");
			}.bind(this),
			ondrmevent : function(drmEvent, drmData) {
				log("DRM callback: " + drmEvent + ", data: " + drmData);
			}.bind(this),
			onstreamcompleted : function() {
				log("Stream Completed");
				self.ready = false
				self.finished()
			}.bind(this)
		};
		if (this.autoPlay && this.source)
			this.playImpl()

		this._webapis.network.addNetworkStateChangeListener(function(data) {
			if (data == 4) {		// Network is connected again.
				self.networkConnected = true
			} else if (data == 5) {	// Network is disconnected.
				self.networkConnected = false
			}
		})
	}
}
