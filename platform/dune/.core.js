_globals.core.__deviceBackend = function() { return _globals.dune.device }

exports.core.os = "linux"
exports.core.vendor = "dune"
exports.core.device = 1

document.body.innerHTML = '<object type="application/xf-dune-stb-api" id="duneapi"></object>'
var stb = document.getElementById("duneapi");

log = function(dummy) {
	COPY_ARGS(args, 0)
	stb.log("[QML] " + args.join(" "))
}
log("Dune detected")

if (!stb || !stb.init()) {
	log("Dune STB API initialization failed");
	return
}

exports.duneStb = stb

exports.core.keyCodes = {
	8: 'Back',
	13: 'Select',
	16: 'Shift',
	17: 'Ctrl',
	18: 'LeftAlt',
	38: 'Up',
	27: 'Back',
	37: 'Left',
	39: 'Right',
	40: 'Down',
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
	19: 'Pause',
	170: "Search",
	199: "Info",
	403: 'Red',
	404: 'Green',
	405: 'Yellow',
	406: 'Blue',
	178: 'Stop',
	250: 'Play',
	204: 'Rewind',
	205: 'FastForward',
	200: "Menu",
	207: "Audio",
    206: "Subtitle",
	208: "Record"
}

exports.closeApp = function() {
	window.close()
}

log("Dune initialized")
