Object {
	property bool macAccessable: false;
	property bool supportingUhd;
	property bool supporting3d;
	property string modelName;
	property string sdk;

	getDeviceId(callback): { callback("samsungsmarttvdevice") }

	getMacAddress(callback): { log("Not supported") }
}
