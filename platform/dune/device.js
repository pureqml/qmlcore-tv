var Device = function(ui) {
	this._ui = ui
	this._stb = document.getElementById("duneapi");
	var stb = this._stb
	if (!stb) {
		log("Dune API STB not defined")
		return
	}
	ui.firmware = stb.getFirmwareVersion()
	ui.deviceId = stb.getSerialNumber()
	ui.macAddress = stb.getMacAddress()
	ui.sdk = stb.getApiVersion()
	ui.modelName = stb.getProductId()
}

exports.createDevice = function(ui) {
	return new Device(ui)
}

exports.Device = Device
