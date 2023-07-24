_globals.core.__deviceBackend = function() { return _globals.netcast.device }
_globals.core.__videoBackends.netcast = function() { return _globals.netcast.drmVideo }

log = function(dummy) {
	COPY_ARGS(args, 0)
	logger = document.getElementById("logger") || undefined
	if (logger)
		logger.innerHTML += args.join(" ") + "<br>"
}

log("NetCast detected")
exports.core.vendor = "LG"
exports.core.device = 1
exports.core.os = "netcast"

var body = document.body.innerHTML
document.body.innerHTML += body + "<object id='device' type='application/x-netcast-info'></object>"
document.body.innerHTML += "<object id='drmplugin' type='application/oipfDrmAgent' style='visibility:hidden' width='0' height='0'></object>"

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

log("NetCast initialized")

exports.closeApp = function() {
	window.NetCastBack();
}
