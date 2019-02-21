var Device = function(ui) {
	if (!window.tizen) {
		log("'window.tizen' not defined")
		return
	}
	this._ui = ui
	var tizenDeviceId = window.tizen.systeminfo.getCapability("http://tizen.org/system/tizenid")
	if (!tizenDeviceId)
		tizenDeviceId = "tizen_" + Math.random().toString(36).substr(2, 9)
	ui.deviceId = tizenDeviceId

	window.tizen.systeminfo.getPropertyValue("BUILD", this.fillDeviceInfo.bind(this), function(error) { log("Failed to get devceinfo", error) });

	var webapis = window.webapis
	if (webapis && webapis.avinfo)
		ui.supportingHdr = webapis.avinfo.isHdrTvSupport()
	else
		log("ERROR: webapis is undefined")

	var userAgent = window.navigator ? window.navigator.userAgent : ""
	if (userAgent) {
		userAgent = userAgent.toLowerCase()
		var begin = userAgent.indexOf("tizen")
		var endSemicolon = userAgent.indexOf(";", begin)
		var endBrace = userAgent.indexOf(")", begin)
		var end = endSemicolon > -1 && endSemicolon < endBrace ? endSemicolon : (endBrace < 0 ? userAgent.length - 1 : endBrace)
		ui.sdk = userAgent.substring(begin + 6, end)
	}

	if (webapis && webapis.productinfo)
		ui.supportingUhd = webapis.productinfo.isUdPanelSupported()
}

Device.prototype.getDeviceProperty = function(device) {
	if (!device) {
		log("Device info is null")
		return
	}
	this._ui.modelName = device.model
	this._ui.firmware = device.buildVersion
}

Device.prototype.fillDeviceInfo = function(device) {
	if (!device) {
		log("Device info is null")
		return
	}
	var ui = this._ui
	ui.modelName = device.model
	ui.firmware = device.buildVersion
}

exports.createDevice = function(ui) {
	return new Device(ui)
}

exports.Device = Device
