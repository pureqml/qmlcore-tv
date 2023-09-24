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

	if (window.Hisense_GetOSVersion)
		ui.sdk = window.Hisense_GetOSVersion()

	if (window.Hisense_Get4KSupportState)
		ui.supportingUhd = window.Hisense_Get4KSupportState()

	if (window.Hisense_GetSupportForHDR)
		ui.supportingHdr = window.Hisense_GetSupportForHDR()

	if (window.Hisense_GetMenuLanguageCode)
		ui.language = window.Hisense_GetMenuLanguageCode()
}

exports.createDevice = function(ui) {
	return new Device(ui)
}

exports.Device = Device
