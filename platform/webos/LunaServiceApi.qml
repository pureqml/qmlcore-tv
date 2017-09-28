Object {

	requestImpl(serviceUri, requestObject): {
		if (!window.webOS) {
			log("webOS not found! Maybe you forget to include webOS.js.")
			return
		}
		window.webOS.service.request(serviceUri, requestObject)
	}

	fillRequest(method, args, success, error, complete): {
		var res = {
			method: method,
			parameters: args,
			onSuccess: function(response) { success(response) }
		}

		if (error)
			res.onFailure = function(response) { error(response) }

		if (complete)
			res.onComplete = function(response) { complete(response) }

		if (args.subscribe)
			res['subscribe'] = args.subscribe

		if (args.resubscribeStatus)
			res['resubscribeStatus'] = args.resubscribeStatus

		return res;
	}

	getSystemInfo(callback, error): {
		var request = this.fillRequest("getSystemInfo", { "keys": ["modelName", "firmwareVersion", "UHD", "sdkVersion", "_3d"] }, callback, error)
		this.requestImpl("luna://com.webos.service.tv.systemproperty", request)
	}

	getDeviceId(callback, error): {
		var request = this.fillRequest("deviceid/getIDs", { "idType": ["LGUDID"] }, callback, error)
		this.requestImpl("luna://com.webos.service.sm", request)
	}

	keyManager(method, args, success, error, complete): {
		var request = this.fillRequest(method, args, success, error, complete)
		this.requestImpl("luna://com.palm.keymanager", request)
	}

	getInternetStatusRequest(callback): {
		var request = this.fillRequest("getStatus", {"subscribe":true}, callback)
		this.requestImpl("luna://com.palm.connectionmanager", request)
	}

	launchApp(id, params, callback, error): {
		var request = this.fillRequest("launch", { 'id': id, 'params': params }, callback, error)
		this.requestImpl("luna://com.webos.applicationManager", request)
	}
}
