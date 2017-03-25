log = console.log.bind(console)


if ('tizen' in window) {
	log("[QML] Tizen")
	exports.core.vendor = "samsung"
	exports.core.device = 1
	exports.core.os = "tizen"

	exports.core.keyCodes = {
		37: 'Left',
		38: 'Up',
		39: 'Right',
		40: 'Down',
		13: 'Select',
		403: 'Red',
		404: 'Green',
		405: 'Yellow',
		406: 'Blue',
		427: 'ChannelUp',
		428: 'ChannelDown',
		457: 'Menu',
		10009: 'Back'
	}

	log("tizen initialized")
}
