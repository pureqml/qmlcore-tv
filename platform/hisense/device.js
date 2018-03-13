var Device = function(ui) {
	ui.deviceId = "hisense_" + Math.random().toString(36).substr(2, 9)
}

exports.createDevice = function(ui) {
	return new Device(ui)
}

exports.Device = Device
