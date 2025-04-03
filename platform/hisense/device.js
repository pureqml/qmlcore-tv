var Device = function(ui) {
	if (window.Hisense_GetDeviceID)
		ui.deviceId = window.Hisense_GetDeviceID()
	else
		ui.deviceId = "hisense_" + Math.random().toString(36).substr(2, 9)

	if (window.Hisense_GetModelName)
		ui.modelName = window.Hisense_GetModelName()

	if (window.Hisense_GetFirmWareVersion)
		ui.firmware = window.Hisense_GetFirmWareVersion()

	if (window.Hisense_GetCountryCode)
		ui.country = window.Hisense_GetCountryCode()
}

exports.createDevice = function(ui) {
	return new Device(ui)
}

exports.Device = Device
