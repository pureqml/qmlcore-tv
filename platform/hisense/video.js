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

	var self = this
	player.on('loadedmetadata', function() {
		log("loadedmetadata startPostion", ui.startPosition, "curr", self.element.dom.currentTime)
		if (ui.startPosition) {
			self.element.dom.currentTime = ui.startPosition
			ui.progress = ui.startPosition
		}
	}.bind(ui))
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
	log("setSourceImpl url", url)
	this.player.dom.src = url
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
	log("Play", url)
	this.setSourceImpl(url)
	// if (ui.autoPlay)
	// 	this.player.dom.play()
}

Player.prototype.setupDrm = function(type, options, callback, error) {
	if (type) {
		log("DRM type:", type)
		this._drm = { "type": type, "options": options }
	} else {
		this._drm = null
		log("DRM type:", type, "not supported, try: playready|widevine|verimatrix")
	}

	var drm = this._drm
	if (!drm) {
		error()
		return
	}

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
			error()
			return
		}
		log("Send DRM message...")
		var result = drmPlugin.sendDRMMessage(msgType, msg, drmSystemID)
		log("DRM message result: ", result)
		if (result != 0) {
			log("onDRMMessageResult failed. error:" + result)
			this.drmError(result)
		}
	} else {
		log("DRM type", drm.type, "not supported")
	}

	callback()
}

exports.createPlayer = function(ui) {
	return new Player(ui)
}

exports.probeUrl = function(url) {
	return 350
}
