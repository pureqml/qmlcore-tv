var Player = function(ui) {
	var player = ui._context.createElement('video')
	player.dom.preload = "metadata"
	this.player = player

	this.element = player
	this.ui = ui
	this.setEventListeners()

	ui.element.remove()
	ui.element = player
	ui.parent.element.append(ui.element)
}

Player.prototype = Object.create(_globals.video.html5.backend.Player.prototype)

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

Player.prototype.wrapCallback = function(callback) {
	return this.ui._context.wrapNativeCallback(callback)
}

Player.prototype.setSourceImpl = function(url) {
	var ui = this.ui
	this.player.dom.src = url
	log("setSourceImpl url", url, "startPostion", ui.startPosition)
	if (url && ui.startPosition)
		this.seekTo(ui.startPosition)
}

Player.prototype.setSource = function(url) {
	log("SetSource", url)
	var extension = this.getFileExtension(url)
	this.ui.ready = false

	var type = ""
	if (extension.indexOf(".ism/manifest") >= 0 || extension.indexOf(".isml/manifest") >= 0) {
		type = "application/vnd.ms-sstr+xml"
	} else if (extension.indexOf(".mpd") >= 0) {
		type = "application/dash+xml"
	} else {
		type = "application/vnd.apple.mpegurl"
	}

	log("Type", type, "Extension", extension)
	this.player.dom.setAttribute("type", type)

	var self = this
	var ui = this.ui

	log("DRM", this._drm)
	if (this._drm) {
		var drm = this._drm
		log("Use DRM", JSON.stringify(drm))
		if (drm.type === "playready") {
			log("Configure playready")
			var laServer = drm.options.laServer ? drm.options.laServer : ""
			var customData = drm.options.customData ? drm.options.customData : ""
			var msgType = "application/vnd.ms-playready.initiator+xml"
			var drmSystemID = "urn:dvb:casystemid:19219"
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
					self.setSourceImpl(url)
					if (ui.autoPlay)
						self.player.dom.play()
				} else {
					log("onDRMMessageResult failed. error:" + resultCode);
					self.drmError(resultCode, resultMsg);
				}
			})
			log("Send DRM message...")
			var result = drmPlugin.sendDRMMessage(msgType, msg, drmSystemID);
			log("DRM message result: ", result)
			log("Play with Playready DRM", url)
			self.setSourceImpl(url)
		} else {
			log("DRM type", drm.type, "not supported")
		}
	} else {
		log("Play", url, "Auto", ui.autoPlay)
		this.setSourceImpl(url)
		if (ui.autoPlay)
			this.player.dom.play()
	}
}

Player.prototype.setupDrm = function(type, options, callback, error) {
	if (type) {
		log("DRM type:", type)
		this._drm = { "type": type, "options": options }
	} else {
		this._drm = null
		log("DRM type:", type, "not supported, try: playready|widevine|verimatrix")
	}
	callback()
}

exports.createPlayer = function(ui) {
	return new Player(ui)
}

exports.probeUrl = function(url) {
	return 350
}
