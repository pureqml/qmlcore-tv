var Device = function(ui) {
	var deviceId
	if (window.webapis && window.webapis.tv) {
		var info = window.webapis.tv.info
		if (info) {
			deviceId = info.getDeviceID()
			ui.modelName = info.getModel()
			ui.firmware = info.getFirmware()
			ui.sdk = info.getVersion()
			ui.country = info.getCountry()
			ui.language = info.getLanguage()
		} else {
			log("Info object is undefined")
		}
		for (var i in info)
			log(i + " = " + info[i])
	} else {
		log('window.webapis is undefined, perhaps you missed <script type="text/javascript" language="javascript" src="$MANAGER_WIDGET/Common/webapi/1.0/webapis.js"></script>')
	}
	ui.deviceId = deviceId ? deviceId : "orsay_" + Math.random().toString(36).substr(2, 9)

	var network = document.getElementById("pluginObjectNetwork")
	if (network && network.GetMAC)
		ui.macAddress = network.GetMAC(0) || network.GetMAC(1)
	else
		log("Network plugin object not defined")
}

exports.createDevice = function(ui) {
	return new Device(ui)
}

exports.Device = Device
