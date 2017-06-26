Object {
	property bool macAccessable: true;
	property string macAddress;

	NetcastDevice { id: netcastDevice; }

	getDeviceId(callback): { res = { text: netcastDevice.getDeviceProperty("serialNumber") }; callback(res)}
	getMacAddress(callback): { res = { text: netcastDevice.getDeviceProperty("net_macAddress") }; callback(res) }
}
