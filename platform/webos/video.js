var Player = function(ui) {
	var player = ui._context.createElement('video')
	player.dom.preload = "metadata"

	if (ui.autoPlay)
		player.setAttribute('autoplay', "")

	var dom = player.dom
	player.on('play', function() { ui.waiting = false; ui.paused = dom.paused }.bind(ui))
	player.on('pause', function() { ui.paused = dom.paused }.bind(ui))
	player.on('ended', function() { ui.finished() }.bind(ui))
	player.on('seeked', function() { log("seeked"); ui.seeking = false; ui.waiting = false }.bind(ui))
	player.on('canplay', function() { log("canplay", dom.readyState); ui.ready = dom.readyState }.bind(ui))
	player.on('seeking', function() { log("seeking"); ui.seeking = true; ui.waiting = true }.bind(ui))
	player.on('waiting', function() { log("waiting"); ui.waiting = true }.bind(ui))
	player.on('stalled', function() { log("Was stalled", dom.networkState); dom.play() }.bind(ui))
	player.on('emptied', function() { log("Was emptied", dom.networkState); dom.play()}.bind(ui))
	player.on('volumechange', function() { ui.muted = dom.muted }.bind(ui))
	player.on('canplaythrough', function() { log("ready to play"); ui.paused = dom.paused }.bind(ui))

	player.on('error', function() {
		log("Player error occured", dom.error, "src", ui.source)

		if (!dom.error || !ui.source)
			return

		ui.error(dom.error)

		log("player.error", dom.error)
		switch (dom.error.code) {
		case 1:
			log("MEDIA_ERR_ABORTED error occured")
			break;
		case 2:
			log("MEDIA_ERR_NETWORK error occured")
			break;
		case 3:
			log("MEDIA_ERR_DECODE error occured")
			break;
		case 4:
			log("MEDIA_ERR_SRC_NOT_SUPPORTED error occured")
			break;
		default:
			log("UNDEFINED error occured")
			break;
		}
	}.bind(ui))

	player.on('timeupdate', function() {
		ui.waiting = false
		if (!ui.seeking)
			ui.progress = dom.currentTime
		log("UPDATE", ui.progress)
	}.bind(ui))

	player.on('durationchange', function() {
		var d = dom.duration
		log("Duration", d)
		ui.duration = isFinite(d) ? d : 0
	}.bind(ui))

	player.on('progress', function() {
		var last = dom.buffered.length - 1
		ui.waiting = false
		if (last >= 0)
			ui.buffered = dom.buffered.end(last) - dom.buffered.start(last)
	}.bind(ui))

	this.element = player
	this.ui = ui

	ui.element.remove()
	ui.element = player
	ui.parent.element.append(ui.element)
}

Player.prototype = Object.create(_globals.video.html5.backend.Player.prototype)

Player.prototype.setSource = function(url) {
	this.ui.ready = false
	if (this._drmClientId) {
		this.setDrmSource(url)
	} else {
		this.element.dom.src = url
	}
}

Player.prototype.setDrmSource = function(source) {
	log("playDrmSource", this._drmClientId, "type", this._drmType)
	var options = {};
	options.option = {};
	options.option.drm = {};
	if (this._drmType == "widevine") {
		options.mediaTransportType = "WIDEVINE";
		options.option.drm.type = "widevine";
		options.option.drm.clientId = this._drmClientId;
	} else if (this._drmType == "playready") {
		options.mediaTransportType = "URI";
		options.option.drm.type = "playready";
		options.option.drm.clientId = this._drmClientId;
	}

	var mediaOption = encodeURIComponent(JSON.stringify(options));
	var ui = this.ui
	var sourceElement = this._sourceElement ? this._sourceElement : ui._context.createElement('source')
	sourceElement.setAttribute('src', source);
	sourceElement.setAttribute('type', 'application/vnd.ms-sstr+xml');
	// sourceElement.setAttribute('type', 'application/vnd.ms-sstr+xml;mediaOption=' + mediaOption);
	// sourceElement.setAttribute('type', 'application/dash+xml;mediaOption=' + mediaOption);
	// sourceElement.setAttribute('type', 'application/vnd.apple.mpegurl;mediaOption=' + mediaOption);
	// sourceElement.setAttribute('type', 'application/x-mpegurl;mediaOption=' + mediaOption);
	if (!this._sourceElement)
		ui.element.append(sourceElement);
	this._sourceElement = sourceElement
	this.element.dom.load()
	this.element.dom.play()
}

Player.prototype.setSource = function(url) {
	this.ui.ready = false
	if (this._drmClientId) {
		this.setDrmSource(url)
	} else {
		this.element.dom.src = url
	}
}

Player.prototype.pause = function() {
	var ui = this.ui
	if (!ui)
		return

	log("Player pause waiting:", ui.waiting, "seeking", ui.seeking)
	if (!ui.waiting && !ui.seeking)
		this.element.dom.pause()
}

Player.prototype.lunaRequestImpl = function(serviceUri, requestObject) {
	if (!window.webOS) {
		log("webOS not found! Maybe you forget to include webOS.js.")
		return
	}
	window.webOS.service.request(serviceUri, requestObject)
}

Player.prototype.lunaFillRequest = function(method, args, success, error, complete) {
	var res = {
		method: method,
		parameters: args,
		onSuccess: function(response) { success(response) }
	}

	if (error)
		res.onFailure = function(response) { error(response) }

	if (complete)
		res.onComplete = function(response) { complete(response) }

	if (args.subscribe)
		res['subscribe'] = args.subscribe

	if (args.resubscribeStatus)
		res['resubscribeStatus'] = args.resubscribeStatus

	return res;
}

Player.prototype.createDrmClient = function(options, callback, error) {
	var request = this.lunaFillRequest("load", options, callback, error)
	this.lunaRequestImpl("luna://com.webos.service.drm", request)
}

Player.prototype.sendDrmMessage = function(options, callback, error) {
	var request = this.lunaFillRequest("sendDrmMessage", options, callback, error)
	this.lunaRequestImpl("luna://com.webos.service.drm", request)
}

Player.prototype.unloadDrmClient = function(clientId, callback, error) {
	var request = this.lunaFillRequest("unload", { "clientId": clientId }, callback, error)
	this.lunaRequestImpl("luna://com.webos.service.drm", request)
}

Player.prototype.subscribeLicensingError = function(options, callback, error) {
	var request = this.lunaFillRequest("getRightsError", options, callback, error)
	this.lunaRequestImpl("luna://com.webos.service.drm", request)
}

Player.prototype.getDrmClientId = function(type, callback) {
	var self = this
	var appId = "com." + ($manifest$title || "pureqml") + ".app"
	log("CREATEDRM", type, appId)
	this.createDrmClient(
		{ "drmType": type, "appId": appId },
		function(result) {
			log("DRM Client created", result)
			self._drmClientId = result.clientId
			self._drmType = type
			callback(result.clientId)
		}.bind(this),
		function(result) {
			log("Failed to create client id Error[" + result.errorCode + "]", result.errorText)
		}
	);
}

Player.prototype.setupDrm = function(type, options, callback) {
	var self = this
	this.getDrmClientId(type, function(clientId) {
		var msg
		var msgType
		var drmSystemId

		if (type == "playready") {
			msg = '<?xml version="1.0" encoding="utf-8"?>' +
				'<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
				'<LicenseServerUriOverride>' +
					'<LA_URL>' + (options.laServer || "") + '</LA_URL>' +
					'<KID>' + (options.contentId || "") + '</KID>' +
				'</LicenseServerUriOverride>' +
				'</PlayReadyInitiator>'

			msgType = "application/vnd.ms-playready.initiator+xml";
			drmSystemId = "urn:dvb:casystemid:19219";
		} else if (type == "widevine") {
			msg = '<?xml version="1.0" encoding="utf-8"?>' +
			'<WidevineCredentialsInfo xmlns="http://www.smarttv-alliance.org/DRM/widevine/2012/protocols/">' +
				'<ContentURL>' + (options.contentUrl || "") + '</ContentURL>' +
				'<DeviceID></DeviceID>' +
				'<StreamID></StreamID>' +
				'<ClientIP></ClientIP>' +
				'<DRMServerURL>' + (options.laServer || "") + '</DRMServerURL>' +
				'<DRMAckServerURL></DRMAckServerURL>' +
				'<DRMHeartBeatURL></DRMHeartBeatURL>' +
				'<DRMHeartBeatPeriod>0</DRMHeartBeatPeriod>' +
				'<UserData></UserData>' +
				'<Portal></Portal>' +
				'<StoreFront></StoreFront>' +
				'<BandwidthCheckURL></BandwidthCheckURL>' +
				'<BandwidthCheckInterval></BandwidthCheckInterval>' +
			'</WidevineCredentialsInfo >'

			msgType = "application/widevine+xml";
			drmSystemId = "urn:dvb:casystemid:19156";
		} else {
			throw new Error("Unknown or unsupported DRM type", type)
		}

		settings = {
			"clientId": clientId,
			"msgType": msgType,
			"msg": msg,
			"drmSystemId": drmSystemId
		}

		self.sendDrmMessage(settings, function(result) {
			log("sendDrmMessage succeeded", result, "type", type);
			if (type == "widevine") {
				if (callback)
					callback(clientId)
				return
			}
			var msgId = result.msgId;
			var resultCode = result.resultCode;
			var resultMsg = result.resultMsg;
			log("Message ID: " + msgId);
			log("[" + resultCode + "] " + resultMsg);

			self.subscribeLicensingError({ "clientId": clientId, "subscribe": true },
				function(result) {
					log("Subscrivelive", result)
					var contentId = result.contentId;
					if (contentId == msgId) {
						if (0 == result.errorState) {
							log("No license");
						} else if ( 1 == result.errorState) {
							log("Invalid license");
						}
						log("DRM System ID: " + result.drmSystemId);
						log("License Server URL: " + result.rightIssueUrl);
					}
				},
				function(result) {
					log("Lisence[" + result.errorCode + "] " + result.errorText);
				}
			)

			switch (resultCode) {
				case 0:
					log("The action(s) requested by sendDrmMessage() completed successfully");
					if (callback)
						callback(clientId)
					break
				case 2:
					log("Cannot Process Request: sendDrmMessage() failed because the DRM agent was unable to complete the necessary computations in the time allotted");
					break
				case 3:
					log("Unknown MIME Type: sendDrmMessage() failed, because the specified MIME type is unknown for the specified DRM system indicated in the MIME type");
					break
				case 4:
					log("User Consent Needed sendDrmMessage() failed because user consent is needed for that action");
					break
				case 1:
				default:
					log("Unknown Error: sendDrmMessage() failed because an unspecified error occurred.");
					break
			}
		})
	}.bind(this));
}

exports.createPlayer = function(ui) {
	return new Player(ui)
}

exports.probeUrl = function(url) {
	return 75
}
