Object {
	property bool macAccessable: false;
	property string modelName;
	property string firmware;

	getDeviceId(callback): {
		var tizenDeviceId = window.tizen.systeminfo.getCapability("http://tizen.org/system/tizenid")
		if (!tizenDeviceId)
			tizenDeviceId = "tizen" + Math.random().toString(36).substr(2, 9)
		callback(tizenDeviceId)
	}

	//TODO: impl
	getMacAddress(callback): { }

	fillDeviceInfo(device): {
		if (!device) {
			log("Device info is null")
			return
		}
		this.modelName = device.model
		this.firmware = device.buildVersion
	}

	onCompleted: {
		window.tizen.systeminfo.getPropertyValue("BUILD", this.fillDeviceInfo.bind(this), function(error) { log("Failed to get devceinfo", error) });
	}
}
