var Device = function(ui) {
	document.addEventListener("deviceready", onDeviceReady, false);
	function onDeviceReady() {
		ui.deviceId = device.uuid
		ui.modelName = device.model
		ui.firmware = device.version
		log("MODEL", ui)
	}
}

exports.createDevice = function(ui) {
	return new Device(ui)
}

exports.Device = Device
