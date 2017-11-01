Object {
	property bool macAccessable: true;
	property bool supporting3d;
	property string macAddress;
	property string modelName;
	property string firmware;
	property string sdk;

	constructor: { this._device = document.getElementById("device") }

	getDeviceId(callback): { callback({ text: this.getDeviceProperty("serialNumber") })}
	getMacAddress(callback): { callback({ text: this.getDeviceProperty("net_macAddress") }) }

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
	getDeviceProperty(val): { return this._device[val] }

	onCompleted: {
		this.modelName = this.getDeviceProperty("modelName")
		this.firmware = this.getDeviceProperty("version")
		this.sdk = this.getDeviceProperty("SDKVersion")
		this.supporting3d = this.getDeviceProperty("support3D")
	}
}
