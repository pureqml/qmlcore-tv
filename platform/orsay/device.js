var Device = function(ui) {
	var deviceId
	if (webapis && webapis.tv) {
		var info = webapis.tv.info
		if (info) {
			deviceId = info.getDeviceID()
			ui.modelName = info.getModel()
			ui.firmware = info.getFirmware()
			ui.sdk = info.getVersion()
		} else {
			log("Info object is undefined")
		}
		for (var i in info)
			log(i + " = " + info[i])
	} else {
		log('webapis is undefiined perhabs you forget to add <script type="text/javascript" language="javascript" src="$MANAGER_WIDGET/Common/webapi/1.0/webapis.js"></script>')
	}
	ui.deviceId = deviceId ? deviceId : "orsay_" + Math.random().toString(36).substr(2, 9)
	webapis.tv.info
}

exports.createDevice = function(ui) {
	return new Device(ui)
}

exports.Device = Device
