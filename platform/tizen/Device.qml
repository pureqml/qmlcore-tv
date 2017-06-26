Item {
	property bool macAccessable: false;

	getDeviceId(callback): { callback(window.tizen.systeminfo.getCapability("http://tizen.org/system/tizenid")) }

	//TODO: impl
	getMacAddress(callback): { }
}
