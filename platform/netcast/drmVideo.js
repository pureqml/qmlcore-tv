var Player = function(ui) {
	var player = ui._context.createElement('object')
	this.player = player

	player.dom.setAttribute("drm_type", "wm-drm")
	player.dom.setAttribute("type", "application/vnd.ms-sstr+xml")
	player.dom.setAttribute("data", "")
	player.dom.setAttribute("width", ui.width)
	player.dom.setAttribute("height", ui.height)
	player.style("width", ui.width)
	player.style("height", ui.height)

	this.ui = ui
	this.source = ''

	ui.element.remove()
	ui.element = player
	ui.parent.element.append(ui.element)
}

Player.prototype.getDrmPlugin = function(url) {
	if (this.drmPlugin) {
		return this.drmPlugin
	} else {
		this.drmPlugin = document.getElementById("drmplugin")
		return this.drmPlugin
	}
}

Player.prototype.drmError = function(resultCode, resultMsg) {
	var errorMsg, errorDetail;
	switch(resultCode) {
		case 1:
			errorMsg = 'Unknown Error';
			errorDetail = 'SendDRMMessage() failed because an unspecified error occurred.';
			break;
		case 2:
			errorMsg = 'Cannot Process Request';
			errorDetail = 'SendDRMMessage() failed because the DRM agent was unable to complete the necessary computations in the time allotted.';
			break;
		case 3:
			errorMsg = 'Unknown MIME Type';
			errorDetail = 'SendDRMMessage() failed because the specified Mime Type is unknown for the specified DRM system indicated in the MIME type';
			break;
		case 4:
			errorMsg = 'User Consent Needed';
			errorDetail = 'SendDRMMessage() failed because user consent is needed for that action';
			break;
		default:
			errorMsg = 'Unknown Error';
			errorDetail = 'SendDRMMessage() failed due to Unknown Error';
			break;
	}
	log('DRM error', errorMsg, errorDetail);
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

Player.prototype.wrapCallback = function(callback) {
	return this.ui._context.wrapNativeCallback(callback)
}

Player.prototype.setSource = function(url) {
	log("SetSource", url)
	var extension = this.getFileExtension(url)
	this.ui.ready = false
	this._startPosition = this.ui.startPosition

	var type = extension.indexOf(".ism/manifest") >= 0 || extension.indexOf(".isml/manifest") >= 0 ? "application/vnd.ms-sstr+xml" : "application/x-netcast-av"
	log("Type", type, "Extension", extension)
	this.player.dom.setAttribute("type", type)

	var self = this
	var ui = this.ui
	this.player.dom.onPlayStateChange = this.wrapCallback(function() {
		log("dom.onPlayStateChange", self.player.dom.playState)
		self.wrapCallback(self.stateChangedHandler(self.player.dom.playState).bind(self)).bind(self)
	})
	this.player.dom.onBuffering = this.wrapCallback(function() { log("onBuffering") })

	if (this._drm) {
		var drm = this._drm
		log("Use DRM", JSON.stringify(drm))
		if (drm.type === "wm-drm") {
			log("Configure playready")
			var laServer = drm.options.laServer ? drm.options.laServer : ""
			var customData = drm.options.customData ? drm.options.customData : ""
			var msgType = "application/vnd.ms-playready.initiator+xml";
			var drmSystemID = "urn:dvb:casystemid:19219";
			var msg = '<?xml version="1.0" encoding="utf-8"?>' +
				'<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
				  '<LicenseServerUriOverride>' +
					'<LA_URL>' + laServer + '</LA_URL>' +
				   '</LicenseServerUriOverride>' +
				  '<SetCustomData>' +
					'<CustomData>'+ customData +'</CustomData>' +
				  '</SetCustomData>' +
				'</PlayReadyInitiator>'

			var drmPlugin = this.getDrmPlugin()
			if (!drmPlugin) {
				log("ERROR DRM plugin not found")
				return
			}
			drmPlugin.onDRMRightsError = this.wrapCallback(function(err) { log("onDRMRightsError", err) })
			drmPlugin.onDRMMessageResult = this.wrapCallback(function(msgId, resultMsg, resultCode) {
				log("onDRMMessageResult", resultCode)
				if (resultCode == 0) {
					log("Play with Playready DRM", url)
					self.player.dom.data = url
					if (ui.autoPlay)
						self.player.dom.play(1)
				} else {
					log("onDRMMessageResult failed. error:" + resultCode);
					self.drmError(resultCode, resultMsg);
				}
			})
			log("Send DRM message...")
			drmPlugin.sendDRMMessage(msgType, msg, drmSystemID);
		} else if (drm.type === "widevine") {
			log("Configure widevine")
			var options = drm.options

			var laServer = options.laServer || ""
			log("setWidevineDrmURL: '" + laServer + "'")
			this.player.dom.setWidevineDrmURL(laServer);

			var userData = options.userData || ""
			log("setWidevineUserData: '" + userData + "'")
			this.player.dom.setWidevineUserData(userData);

			var portal = options.portal || ""
			log("setWidevineUserData", portal)
			this.player.dom.setWidevinePortalID(portal);

			var deviceID = options.deviceID || ""
			log("setWidevineDeviceID", deviceID)
			this.player.dom.setWidevineDeviceID(deviceID);

			var clientIP = options.clientIP || ""
			log("setWidevineClientIP", clientIP)
			this.player.dom.setWidevineClientIP(clientIP);

			var streamID = options.streamID || ""
			log("setWidevineStreamID", streamID)
			this.player.dom.setWidevineStreamID(streamID);

			var drmAckServerURL = options.drmAckServerURL || ""
			log("setWidevineDrmAckURL", drmAckServerURL)
			this.player.dom.setWidevineDrmAckURL(drmAckServerURL);

			var drmHeartBeatPeriod = options.drmHeartBeatPeriod || ""
			log("setWidevineHeartbeatPeriod", drmHeartBeatPeriod)
			this.player.dom.setWidevineHeartbeatPeriod(drmHeartBeatPeriod);
			log("Widevine configured. Try to play...")

			this.player.dom.setWidevineDeviceType("TV")
			log("Type was set")
			this.player.dom.data = url
			if (ui.autoPlay)
				this.player.dom.play(1)
		} else {
			log("DRM type", drm.type, "not supported")
		}
	} else {
		log("Play", url, "Auto", ui.autoPlay)
		this.player.dom.data = url
		if (ui.autoPlay)
			this.player.dom.play(1)
	}
}

Player.prototype.stateChangedHandler = function(state) {
	log("stateChangedHandler", state)
	if (state === 0) {
		log("stopped")
		this.ui.ready = false
		this.timeUpdater = null
	} else if (state === 1) {
		log("playing")
		if (this._startPosition) {
			log("Seek to start pos", this._startPosition)
			this.seekTo(this._startPosition)
			this._startPosition = 0
		}
		this.ui.ready = true
		this.ui.paused = false
		this.ui.waiting = false
		this.ui.duration = this.player.dom.playTime * 1.0 / 1000
		if (!this.timeUpdater) {
			var self = this
			this.timeUpdater = setInterval(this.wrapCallback(function() { self.ui.progress = self.player.dom.playPosition * 1.0 / 1000;  }), 500)
		}
	} else if (state === 2) {
		log("paused")
		this.ui.paused = true
	} else if (state === 3 || state === 4) {
		log("connecting || buffering")
		this.ui.waiting = true
	} else if (state === 5) {
		log("finished")
		this.ui.finished();
		this.ui.ready = false
		this.timeUpdater = null
	} else if (state === 6) {
		log("error")
		this.ui.error()
		this.ui.ready = false
		this.timeUpdater = null
	}
}

Player.prototype.play = function() {
	this.player.dom.play(1);
}

Player.prototype.stop = function() {
	this.player.dom.stop();
}

Player.prototype.pause = function() {
	this.player.dom.pause();
}

Player.prototype.seek = function(delta) {
	log("Seek delta", delta, "pro", this.ui.progress)
	this.seekTo(this.ui.progress + delta);
}

Player.prototype.seekTo = function(tp) {
	log("seekTo", tp)
	this.player.dom.seek((tp < 0 ? 0 : tp) * 1000);
}

Player.prototype.setVolume = function(volume) {
	log('NOT IMPLEMENTED: volume', volume)
}

Player.prototype.setMute = function(muted) {
	log('NOT IMPLEMENTED: mute', muted)
}

Player.prototype.setRect = function(l, t, r, b) {
	var w = r - l
	var h = b - t
	this.player.dom.setAttribute("width", w)
	this.player.dom.setAttribute("height", h)
	this.player.style("width", w)
	this.player.style("height", h)
}

Player.prototype.setVisibility = function(visible) {
	log('videoplayer setVisibility', visible)
}

Player.prototype.getVideoTracks = function() {
	return []
}

Player.prototype.getAudioTracks = function() {
	return []
}

Player.prototype.setAudioTrack = function(trackId) {
	log("setAudioTrack' not implemented")
}

Player.prototype.setVideoTrack = function(trackId) {
	log("setVideoTrack' not implemented")
}

Player.prototype.setOption = function(name, value) {
}

Player.prototype.setupDrm = function(type, options, callback, error) {
	var drmType = ""
	switch (type) {
		case "playready":
			drmType = "wm-drm"
			this.player.dom.setAttribute("drm_type", "wm-drm")
			break
		case "widevine":
			drmType = "widevine"
			this.player.dom.setAttribute("drm_type", "widevine")
			break
		case "verimatrix":
			// TODO: impl
			drmType = "verimatrix"
			break
	}
	if (drmType) {
		log("DRM type:", drmType)
		this._drm = { "type": drmType, "options": options }
		this.player.dom.setAttribute("drm_type", drmType)
	} else {
		this._drm = null
		log("DRM type:", drmType, "not supported, try: playready|widevine|verimatrix")
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
	return 50
}
