var Player = function(ui) {
	var player = ui._context.createElement('video')
	player.dom.preload = "metadata"

	var dom = player.dom
	player.on('play', function() { ui.waiting = false; ui.paused = dom.paused }.bind(ui))
	player.on('pause', function() { ui.paused = dom.paused }.bind(ui))
	player.on('ended', function() { ui.finished() }.bind(ui))
	player.on('seeked', function() { log("seeked"); ui.seeking = false; ui.waiting = false }.bind(ui))
	player.on('canplay', function() { log("canplay", dom.readyState); ui.ready = dom.readyState }.bind(ui))
	player.on('seeking', function() { log("seeking"); ui.seeking = true; ui.waiting = true }.bind(ui))
	player.on('waiting', function() { log("waiting"); ui.waiting = true }.bind(ui))
	player.on('stalled', function() { log("Was stalled", dom.networkState); if (!dom.paused) dom.play() }.bind(ui))
	player.on('emptied', function() { log("Was emptied", dom.networkState); if (!dom.paused) dom.play()}.bind(ui))
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

	this.setAutoPlay(ui.autoPlay)

	this._xhr = new XMLHttpRequest()
	this._xhr.addEventListener('load', this.parseManifest.bind(this))

	var self = this
	ui._context.document.on('visibilitychange', function() {
		if (self._drmClientId && document.hidden) {
			self.unloadDrmClient()
		}
	})
}

Player.prototype = Object.create(_globals.video.html5.backend.Player.prototype)

Player.prototype.parseManifest = function(data) {
	var lines = data.target.responseText.split('\n');
	var url = this.ui.source
	var path = url.substring(0, url.lastIndexOf('/') + 1)
	this._videoTracks = []
	this._audioTracks = []
	this._totalTracks = {}
	for (var i = 0; i < lines.length - 1; ++i) {
		var line = lines[i]
		var nextLine = lines[i + 1]
		if (line.indexOf('#EXT-X-STREAM-INF') == 0) {
			var attributes = line.split(',');
			var track = {
				url: nextLine.indexOf("http") === 0 ? nextLine : (path + nextLine)
			}
			for (var j = 0; j < attributes.length; ++j) {
				var param = attributes[j].split('=');
				if (param.length > 1) {
					switch (param[0].trim().toLowerCase()) {
						case "bandwidth":
							track.bandwidth = param[1].trim()
							break
						case "audio":
							track.audio = param[1].trim().replace(/"/g, "")
							break
						case "resolution":
							var size = param[1].split("x")
							track.width = size[0]
							track.height = size[1]
							break
					}
				}
			}
			var key = track.width + "x" + track.height
			if (!this._totalTracks[key]) {
				this._totalTracks[key] = []
			}
			this._totalTracks[key].push(track)
		} else if (line.indexOf('#EXT-X-MEDIA:TYPE=AUDIO') == 0) {
			var attributes = line.split(',');
			var audioTrack = {}
			for (var j = 0; j < attributes.length; ++j) {
				var param = attributes[j].split('=');
				if (param.length > 1) {
					switch (param[0].trim().toLowerCase()) {
						case "group-id":
							audioTrack.id = param[1].trim().replace(/"/g, "")
							break
						case "name":
							audioTrack.label = param[1].trim().replace(/"/g, "")
							break
						case "language":
							audioTrack.language = param[1].trim().replace(/"/g, "")
							break
						case "uri":
							audioTrack.url = path + param[1].trim()
							break
					}
				}
			}
			this._audioTracks.push(audioTrack)
		}
	}

	var idx = 0
	for (var i in this._totalTracks) {
		var tmpTrack = this._totalTracks[i][0]
		tmpTrack.id = idx++
		this._videoTracks.push(tmpTrack)
	}
}

Player.prototype.setDrmSource = function(source) {
	log("playDrmSource", this._drmClientId, "type", this._drmType)
	var options = {};
	options.option = {};
	options.option.drm = {};

	var extension = this._extension
	var type = ""
	if (extension === ".m3u8" || extension === ".m3u") {
		options.mediaTransportType = "HLS";
		type = "application/x-mpegURL"
	} else if (extension === ".mpd") {
		type = "application/dash+xml"
	} else if (extension === ".mp4") {
		type = "video/mp4"
		options.mediaTransportType = "URI";
	} else {
		type = "application/vnd.ms-sstr+xml"
	}

	if (this._drmType == "widevine") {
		options.mediaTransportType = "WIDEVINE";
		options.option.drm.type = "widevine";
		options.option.drm.clientId = this._drmClientId;
	} else if (this._drmType == "playready") {
		options.option.drm.type = "playready";
		options.option.drm.clientId = this._drmClientId;
	}

	var mediaOption = encodeURIComponent(JSON.stringify(options));
	var ui = this.ui
	var sourceElement = this._sourceElement ? this._sourceElement : ui._context.createElement('source')
	sourceElement.setAttribute('src', source);

	// sourceElement.setAttribute('type', type);
	// mediaOption are needed according documentation but it doesnt work for some streams
	sourceElement.setAttribute('type', type + ';mediaOption=' + mediaOption);

	if (!this._sourceElement)
		ui.element.append(sourceElement);
	this._sourceElement = sourceElement
	this.element.dom.load()
	this.element.dom.play()
}

Player.prototype.getVideoTracks = function() {
	return this._videoTracks || []
}

Player.prototype.getAudioTracks = function() {
	return this._audioTracks || []
}

Player.prototype.setVideoTrack = function(trackId) {
	if (!this._videoTracks || this._videoTracks.length <= 0) {
		log("There is no available video track", this._videoTracks)
		return
	}
	if (trackId >= this._videoTracks.length) {
		log("Track with id", trackId, "not found")
		return
	}
	var progress = this.ui.progress
	log("Set video", this._videoTracks[trackId])
	this.element.dom.src = this._videoTracks[trackId].url
	this.seekTo(progress)
}

Player.prototype.playDashUrl = function(source) {
	var ui = this.ui
	var sourceElement = this._sourceElement ? this._sourceElement : ui._context.createElement('source')
	sourceElement.setAttribute('src', source);
	sourceElement.setAttribute('type', "application/dash+xml");

	if (!this._sourceElement)
		ui.element.append(sourceElement);

	this._sourceElement = sourceElement
	this.element.dom.load()
	this.element.dom.play()
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

Player.prototype.setSource = function(url) {
	this.ui.ready = false
	this._extension = this.getFileExtension(url)
	if (this._drmClientId) {
		this.setDrmSource(url)
	} else if (this._extension === ".mpd") {
		this.playDashUrl(url)
	} else if (this._extension === ".m3u8" || this._extension === ".m3u") {
		if (url) {
			this._xhr.open('GET', url);
			this._xhr.send()
		}
		this.element.dom.src = url
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
