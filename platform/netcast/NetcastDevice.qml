Item {
	function getTag() { return 'object' }

	constructor: {
		this.element.dom.id = "device"
		this.element.dom.type = "application/x-netcast-info"
		this.element.dom.width = "0"
		this.element.dom.height = "0"
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
	getDeviceProperty(val): { return this.element.dom[val] }
}
