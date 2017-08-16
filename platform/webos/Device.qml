Object {
	property bool macAccessable: false;
	property bool supportingUhd;
	property bool supporting3d;
	property string modelName;
	property string firmware;
	property string sdk;

	LunaServiceApi { id: luna; }

	generateId(callback): {
		log("Generate id...")
		var self = this
		luna.keyManager("generate", {"keyname": "deviceid", "type": "AES", "size": 16, "nohide": true},
			function(res) { log("Id was generated") },
			function(res) { log("Failed to generate id:", res) }
		)

		luna.keyManager("fetchKey", {"keyname": "deviceid"},
			function(res) { callback(res.keydata) },
			function(res) { log("Failed to fetch id:", res) }
		)
	}

	getDeviceId(callback): {
		var self = this
		luna.getDeviceId(
			function(res) {
				if (res.returnValue && res.idList && res.idList.length) {
					log("Succss, deviceId:", res.idList[0].idValue)
					callback(res.idList[0].idValue)
				} else {
					log("Bad response, device Id will be generated", res)
					self.generateId(callback)
				}
			},
			function(res) { log("Failed to get device id directly"); self.generateId(callback) }
		)
	}

	getMacAddress(callback): { log("Not supported") }

	fillSystemInfo(info): {
		this.supportingUhd = info.UHD
		this.supporting3d = info._3d
		this.firmware = info.firmwareVersion
		this.modelName = info.modelName
		this.sdk = info.sdkVersion
	}

	onCompleted: {
		var self = this
		luna.getSystemInfo(function(res) { log("Device info", res); self.fillSystemInfo(res) }, function(res) {log("Failed to get device info", res)})
	}
}
