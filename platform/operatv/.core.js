if ('VK_UNSUPPORTED' in window) {
	_globals.core.__deviceBackend = function() { return _globals.operatv.device }

	log = function(dummy) {
		COPY_ARGS(args, 0)
		console.log("[QML] " + args.join(" "))
	}
	log("operatv detected")
	exports.core.vendor = "operatv"
	exports.core.device = 1
	exports.core.os = "operaOS"

	exports.core.keyCodes = {
		8: 'Back',
		13: 'Select',
		27: 'Back',
		37: 'Left',
		33: 'PageUp',
		34: 'PageDown',
		38: 'Up',
		39: 'Right',
		40: 'Down',
		403: 'Red',
		404: 'Green',
		405: 'Yellow',
		406: 'Blue',
		412: 'Rewind',
		413: 'Stop',
		415: 'Play',
		417: 'FastForward'
	}

	log("operatv initialized")
}

exports.closeApp = function() {
	log("Close operatv app. Not implemented yet")
}
