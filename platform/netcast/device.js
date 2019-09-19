var Device = function(ui) {
	this._ui = ui
	this._device = document.getElementById("device")
	ui.supporting3d = this.getDeviceProperty("support3D")
	ui.macAddress = this.getDeviceProperty("net_macAddress")
	ui.modelName = this.getDeviceProperty("modelName")
	ui.deviceId = this.getDeviceProperty("serialNumber")
	ui.firmware = this.getDeviceProperty("version")
	ui.sdk = this.getDeviceProperty("SDKVersion")
	ui.language = this.getDeviceProperty("tvLanguage2")
	ui.country = this.getDeviceProperty("tvCountry2")
}

//Supported properties:
//version
//manufacturer
//modelName
//serialNumber
//swVersion
//hwVersion
//SDKVersion
//osdResolution
//networkType
//net_macAddress
//drmClientInfo
//net_dhcp
//net_isConnected
//net_hasIP
//net_ipAddress
//net_netmask
//net_gateway
//net_dns1
//net_dns2
//supportMouse
//supportVoiceRecog
//supportPentouch
//support3D
//support3DMode
//preferredSubtitleLanguage
//preferredAudioLanguage
//preferredSubtitleStatus
//tvLanguage2
//tvCountry2
//timeZone
//platform
//chipset
Device.prototype.getDeviceProperty = function(val) { return this._device[val] }

exports.createDevice = function(ui) {
	return new Device(ui)
}

exports.Device = Device
