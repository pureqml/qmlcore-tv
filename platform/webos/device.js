var Device = function(ui) {
	this._ui = ui
	ui.deviceId = deviceString + "_" + Math.random().toString(36).substr(2, 9)

	var self = this
	this.lunaGetSystemInfo(function(res) { log("Device info", res); self.fillSystemInfo(res) }, function(res) { log("Failed to get device info", res) })
}

Device.prototype.lunaRequestImpl(serviceUri, requestObject): {
	if (!window.webOS) {
		log("webOS not found! Maybe you forget to include webOS.js.")
		return
	}
	window.webOS.service.request(serviceUri, requestObject)
}

Device.prototype.lunaFillRequest(method, args, success, error, complete): {
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

Device.prototype.lunaGetSystemInfo(callback, error): {
	var request = this.lunaFillRequest("getSystemInfo", { "keys": ["modelName", "firmwareVersion", "UHD", "sdkVersion", "_3d"] }, callback, error)
	this.lunaRequestImpl("luna://com.webos.service.tv.systemproperty", request)
}

Device.prototype.generateId(callback): {
	log("Generate id...")
	this.lunaKeyManager("generate", {"keyname": "deviceid", "type": "AES", "size": 16, "nohide": true},
		function(res) { log("Id was generated") },
		function(res) { log("Failed to generate id:", res) }
	)

	this.lunaKeyManager("fetchKey", {"keyname": "deviceid"},
		function(res) { callback(res.keydata) },
		function(res) { log("Failed to fetch id:", res) }
	)
}

Device.prototype.getDeviceId(callback): {
	var self = this
	this.lunaGetDeviceId(
		function(res) {
			if (res.returnValue && res.idList && res.idList.length) {
				log("Succss, deviceId:", res.idList[0].idValue)
				callback(res.idList[0].idValue)
			} else {
				log("Bad response, device Id will be generated", res)
				self.generateId(callback)
			}
		},
		function(res) { log("Failed to get device id directly"); self.generateId(callback) }
	)
}

Device.prototype.lunaRequestImpl(serviceUri, requestObject): {
	if (!window.webOS) {
		log("webOS not found! Maybe you forget to include webOS.js.")
		return
	}
	window.webOS.service.request(serviceUri, requestObject)
}

Device.prototype.lunaGetDeviceId(callback, error): {
	var request = this.lunaFillRequest("deviceid/getIDs", { "idType": ["LGUDID"] }, callback, error)
	this.lunaRequestImpl("luna://com.webos.service.sm", request)
}

Device.prototype.lunaKeyManager(method, args, success, error, complete): {
	var request = this.lunaFillRequest(method, args, success, error, complete)
	this.lunaRequestImpl("luna://com.palm.keymanager", request)
}

Device.prototype.fillSystemInfo(info): {
	this._ui.supportingUhd = info.UHD
	this._ui.supporting3d = info._3d
	this._ui.firmware = info.firmwareVersion
	this._ui.modelName = info.modelName
	this._ui.sdk = info.sdkVersion
}

exports.createDevice = function(ui) {
	return new Device(ui)
}

exports.Device = Device
