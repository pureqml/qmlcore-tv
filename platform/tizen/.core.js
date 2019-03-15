_globals.core.__videoBackends.tizen = function() { return _globals.tizen.video }
_globals.core.__deviceBackend = function() { return _globals.tizen.device }

log = console.log.bind(console)

if ('tizen' in window) {
	log("[QML] Tizen")
	exports.core.vendor = "samsung"
	exports.core.device = 1
	exports.core.os = "tizen"

	var inputDevice = window.tizen.tvinputdevice
	if (inputDevice) {
		inputDevice.registerKey("0")
		inputDevice.registerKey("1")
		inputDevice.registerKey("2")
		inputDevice.registerKey("3")
		inputDevice.registerKey("4")
		inputDevice.registerKey("5")
		inputDevice.registerKey("6")
		inputDevice.registerKey("7")
		inputDevice.registerKey("8")
		inputDevice.registerKey("9")
		inputDevice.registerKey("ColorF0Red")
		inputDevice.registerKey("ColorF1Green")
		inputDevice.registerKey("ColorF2Yellow")
		inputDevice.registerKey("ColorF3Blue")
		inputDevice.registerKey("ChannelUp")
		inputDevice.registerKey("ChannelDown")
		inputDevice.registerKey("MediaFastForward")
		inputDevice.registerKey("MediaPlayPause")
		inputDevice.registerKey("MediaRewind")
		inputDevice.registerKey("MediaPlay")
		inputDevice.registerKey("MediaStop")
		inputDevice.registerKey("MediaPause")
	} else {
		log('"inputDevice" is undefined dont forget to add privilege: <tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/> into the "config.xml"')
	}

	exports.closeApp = function() {
		window.tizen.application.getCurrentApplication().exit();
	}

	log("tizen initialized")
}

exports.core.keyCodes = {
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
	37: 'Left',
	38: 'Up',
	39: 'Right',
	40: 'Down',
	13: 'Select',
	19: 'Pause',
	403: 'Red',
	404: 'Green',
	405: 'Yellow',
	406: 'Blue',
	427: 'ChannelUp',
	428: 'ChannelDown',
	457: 'Menu',
	415: 'Play',
	413: 'Stop',
	412: 'Rewind',
	417: 'FastForward',
	10252: 'Pause',
	10009: 'Back'
}
