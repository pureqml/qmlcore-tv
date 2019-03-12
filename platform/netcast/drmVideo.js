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

Player.prototype.setSource = function(url) {
	if (this._drm) {
		var drm = this._drm
		log("Use DRM", JSON.stringify(drm))
		var laServer = drm.options.laServer ? drm.options.laServer : ""
		var customData = drm.customData ? drm.customData : ""
		var scope = this;
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
		var self = this
		drmPlugin.onDRMMessageResult = function(msgId, resultMsg, resultCode) {
			log("onDRMMessageResult", resultCode)
			if (resultCode == 0) {
				log("Play with DRM", url)
				self.player.dom.setAttribute("data", url)
				self.player.dom.play(1)
			} else {
				log("onDRMMessageResult failed. error:" + resultCode);
				self.drmError(resultCode, resultMsg);
			}
		};
		log("Send DRM message...")
		drmPlugin.sendDRMMessage(msgType, msg, drmSystemID);
	} else {
		log("Play", url)
		this.player.dom.setAttribute("data", url)
		this.player.dom.play(1)
	}
}

Player.prototype.play = function() {
}

Player.prototype.stop = function() {
}

Player.prototype.pause = function() {
}

Player.prototype.seek = function(delta) {
}

Player.prototype.seekTo = function(tp) {
}

Player.prototype.setVolume = function(volume) {
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

Player.prototype.setupDrm = function(type, options, callback, error) {
	var drmType = ""
	switch (type) {
		case "playready":  drmType = "wm-drm"; break;
		case "widevine":   drmType = "widevine"; break;
		case "verimatrix": drmType = "verimatrix"; break;
	}
	if (drmType) {
		log("DRM type:", drmType)
		this._drm = { "type": drmType, "options": options }
		this.player.dom.setAttribute("drm_type", "wm-drm")
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
