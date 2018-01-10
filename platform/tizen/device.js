var Device = function(ui) {
	this._ui = ui
	var tizenDeviceId = window.tizen.systeminfo.getCapability("http://tizen.org/system/tizenid")
	if (!tizenDeviceId)
		tizenDeviceId = "tizen_" + Math.random().toString(36).substr(2, 9)
	ui.deviceId = tizenDeviceId

	window.tizen.systeminfo.getPropertyValue("BUILD", this.fillDeviceInfo.bind(this), function(error) { log("Failed to get devceinfo", error) });
}

Device.prototype.getDeviceProperty(device): {
	if (!device) {
		log("Device info is null")
		return
	}
	this._ui.modelName = device.model
	this._ui.firmware = device.buildVersion
}

exports.createDevice = function(ui) {
	return new Device(ui)
}

exports.Device = Device
