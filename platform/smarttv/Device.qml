Object {
	property bool macAccessable: false;
	property bool supportingUhd;
	property bool supporting3d;
	property string modelName;
	property string sdk;

	getDeviceId(callback): { callback("smarttv" + Math.random().toString(36).substr(2, 9)) }

	getMacAddress(callback): { log("Not supported") }
}
