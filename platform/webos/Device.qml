Object {
	property bool macAccessable: false;

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
			function(res) { callback(res.idList.idValue) },
			function(res) { log("Failed to get device id directly"); self.generateId(callback) }
		)
	}

	//TODO: impl
	getMacAddress(callback): { }
}
