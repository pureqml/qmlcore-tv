var Player = function(ui) {
	var player = ui._context.createElement('object')
	this.player = player
	this._crunchTimer = null

	player.dom.setAttribute("classid", "clsid:SAMSUNG-INFOLINK-SEF")
	this.ui = ui
	this.source = ''

	ui.element.remove()
	ui.element = player
	ui.parent.element.append(ui.element)

	window.Player = {}
	window.Player.onEvent = this.ui._context.wrapNativeCallback(function(event, arg) {
		if (isNaN(event))
			return

		switch (parseInt(event)) {
		case -1: //Fired on error?
			ui.error({ "message": "Unknown error", "code": -1 })
			break;
		case 1: //Connection to the stream failed
			ui.error({ "message": "Connection to the stream failed", "code": 1 })
			break;
		case 2: //Authentication Failed
			ui.error({ "message": "Authentication Failed", "code": 2 })
			break;
		case 3: //Stream not found
			ui.error({ "message": "Stream not found", "code": 3 })
			break;
		case 4: //Network disconnected
			ui.error({ "message": "Network disconnected", "code": 4 })
			break;
		case 6: //Render error
			var msg = ""
			switch (arg) {
			case 1: msg = 'Unsupported container'; break
			case 2: msg = 'Unsupported video codec'; break
			case 3: msg = 'Unsupported audio codec'; break
			case 4: msg = 'Unsupported video resolution'; break
			case 6: msg = 'Corrupted stream'; break
			default: msg = 'Unknown error'; break
			}
			log("Render error message:", msg, "code:", arg)
			ui.error({ "message": msg, "code": arg })
			break;
		case 7: //Fired after play was pressed --> or when ready to play?
			log("Ready to play")
			var duration = player.dom.Execute("GetDuration") / 1000
			log("Duration: " + duration)
			ui.duration = duration
			ui.ready = true
			break;
		case 8: //Playback came to an end (case found when rewind came to the start of the file)
			ui.finished()
			break;
		case 9: // SEF init ?
			break;
		case 11: //Fired after 9
			break;
		case 12: //Fired after last 13 event. Buffering complete
			ui.waiting = false
			ui.seeking = false
			break;
		case 13:// Possible that this indicates the buffering level in %
			ui.waiting = true
			break;
		case 14: //Fired every 0.5 seconds with current playback time in val2
			ui.progress = arg * 1.0 / 1000
			break;
		case 100: //DRM error
			ui.error({ "message": "DRM error", "code": 100 })
			break;
		default:
			break;
		}
	})

	player.dom.Open('Player', '1.000', 'Player')
	player.dom.OnEvent = 'Player.onEvent'
}

Player.prototype.startTimer = function() {
	if (this._crunchTimer === null)
		this._crunchTimer = setInterval(this.ui._context.wrapNativeCallback(this.play).bind(this), 5000)
}

Player.prototype.setSource = function(url) {
	if (url == "" || !this.visible) {
		return
	}
	log("Set source", url)
	this.player.dom.Open('Player', '1.000', 'Player')
	this.player.dom.OnEvent = 'Player.onEvent'

	this.player.dom.Execute("Stop")
	this.ui.ready = false
	this.ui.paused = false
	this.source = url
	if (this.ui.autoPlay)
		this.play()
}

Player.prototype.getFileExtension = function(filePath) {
	if (!filePath)
		return ""
	var urlLower = filePath.toLowerCase()
	var querryIndex = filePath.indexOf("?")
	if (querryIndex >= 0)
		urlLower = urlLower.substring(0, querryIndex)
	var extIndex = urlLower.lastIndexOf(".")
	return urlLower.substring(extIndex, urlLower.length)
}

Player.prototype.play = function() {
	log("video play source ", this.source)
	var ui = this.ui
	var player = this.player.dom

	if (!player.Execute) {
		log("PLAY video player not initialized yet")
		this.startTimer()
		return;
	}

	log("Player paused", ui.paused, "ready", ui.ready)
	if (ui.paused) {
		log("video play resume")
		player.Execute("Resume")
		ui.paused = false
		return
	} else if (ui.ready) {
		log("Stream is playing already")
		return
	}

	var component = ""
	var extension = this.getFileExtension(this.source)
	if (extension === ".m3u8" || extension === ".m3u")
		component = "|COMPONENT=HLS"

	if (this._drm)
		component += '|COMPONENT=WMDRM';

	log("Extension", extension, "Component", component)
	player.Execute("InitPlayer", this.source + component)

	if (this._drm) {
		var options = this._drm.options
		log("DRM", JSON.stringify(options))
		if (options.customData)
			player.Execute('SetPlayerProperty', '3', options.customData, options.customData.length);
		if (options.laServer)
			player.Execute('SetPlayerProperty', '4', options.laServer, options.laServer.length);
	}

	ui.waiting = true
	log("calling StartPlayback")
	log("StartPlayback returns", player.Execute("StartPlayback", ui.startPosition))
}

Player.prototype.stop = function() {
	log("video stop and close", this.player.dom.Execute)
	if (this.player.dom.Execute) {
		this.player.dom.Execute("Stop")
		this.player.dom.Execute("Close")
	}
	this.ui.ready = false
}

Player.prototype.pause = function() {
	if (this.ui.ready) {
		log("video pause")
		this.player.dom.Execute("Pause")
		this.ui.paused = true
	}
}

Player.prototype.seek = function(delta) {
	log('seekTo', delta)
	this.ui.seeking = true
	this.player.dom.Execute("JumpForward", delta)
}

Player.prototype.seekTo = function(tp) {
	this.seek(tp - this.ui.progress)
}

Player.prototype.setVolume = function(volume) {
	log('NOT IMPLEMENTED: setVolume', volume)
}

Player.prototype.setMute = function(muted) {
	log('NOT IMPLEMENTED: mute', muted)
}

Player.prototype.setRect = function(l, t, r, b) {
	var w = r - l, h = b - t
	this.player.dom.Execute("SetDisplayArea", l, t, w, h)
}

Player.prototype.setVisibility = function(visible) {
	log('videoplayer setVisibility', visible, "exec", this.player.dom.Execute)
	this.visible = visible
	if (visible) {
		if (this.source != this.ui.source)
			this.setSource(this.ui.source)
	} else {
		this.stop()
	}
}

Player.prototype.getVideoTracks = function() {
	return []
}

Player.prototype.getAudioTracks = function() {
	return []
}

Player.prototype.setOption = function(name, value) {
}

Player.prototype.setAudioTrack = function(trackId) {
	log("setAudioTrack' not implemented")
}

Player.prototype.setVideoTrack = function(trackId) {
	log("setVideoTrack' not implemented")
}

Player.prototype.setupDrm = function(type, options, callback, error) {
	if (type === "playready") {
		log("DRM type:", type)
		this._drm = { "type": type, "options": options }
	} else {
		this._drm = null
		log("DRM type:", drmType, "not supported, try: playready")
	}
	callback()
}

Player.prototype.setBackgroundColor = function(color) {
	log('NOT IMPLEMENTED: setBackgroundColor')
}

exports.createPlayer = function(ui) {
	return new Player(ui)
}

exports.probeUrl = function(url) {
	return 75
}
