if ('webOS' in window || 'webos' in window) {
	_globals.core.__videoBackends.webos = function() { return _globals.webos.video }
	_globals.core.__deviceBackend = function() { return _globals.webos.device }

	log = console.log.bind(console)

	log("WebOS detected")
	exports.core.vendor = "LG"
	exports.core.device = 1
	exports.core.os = "webOS"

	exports.core.keyCodes = {
		37: 'Left',
		38: 'Up',
		39: 'Right',
		40: 'Down',
		13: 'Select',
		33: 'ChannelUp',
		34: 'ChannelDown',
		27: 'Back',
		19: 'Pause',
		48: '0',
		49: '1',
		50: '2',
		51: '3',
		52: '4',
		53: '5',
		54: '6',
		55: '7',
		56: '8',
		57: '9',
		461: 'Back',
		403: 'Red',
		404: 'Green',
		405: 'Yellow',
		406: 'Blue',
		457: 'Menu',
		412: 'Rewind',
		417: 'FastForward',
		457: 'Info',
		413: 'Stop',
		415: 'Play'
	}

	log("webos initialized")

	exports.closeApp = function() {
		if (window.close)
			window.close()
		else
			window.webOS.platformBack();
	}

	exports.platformBack = function() {
		window.webOS.platformBack();
	}
}
