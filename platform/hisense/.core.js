_globals.core.__deviceBackend = function() { return _globals.hisense.device }
_globals.core.__videoBackends.hisense = function() { return _globals.hisense.video }

log = console.log.bind(console)
log("Hisense detected")
exports.core.os = "hisense"
exports.core.vendor = "Hisense"
exports.core.device = 1

document.body.innerHTML += "<object id='drmplugin' type='application/oipfDrmAgent' style='visibility:hidden' width='0' height='0'></object>"

exports.core.keyCodes = {
	8: 'Back',
	13: 'Select',
	16: 'Shift',
	17: 'Ctrl',
	18: 'LeftAlt',
	27: 'Back',
	37: 'Left',
	32: 'Space',
	33: 'PageUp',
	34: 'PageDown',
	38: 'Up',
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
	65: 'A',
	66: 'B',
	67: 'C',
	68: 'D',
	69: 'E',
	70: 'F',
	71: 'G',
	72: 'H',
	73: 'I',
	74: 'J',
	75: 'K',
	76: 'L',
	77: 'M',
	78: 'N',
	79: 'O',
	80: 'P',
	81: 'Q',
	82: 'R',
	83: 'S',
	84: 'T',
	85: 'U',
	86: 'V',
	87: 'W',
	88: 'X',
	89: 'Y',
	90: 'Z',
	403: 'Red',
	404: 'Green',
	405: 'Yellow',
	406: 'Blue',
	230: 'RightAlt',
	19: 'Pause',
	413: 'Stop',
	415: 'Play',
	412: 'Rewind',
	417: 'FastForward'
}

exports.closeApp = function() {
	window.close()
}

document.addEventListener("click", handler, true);
function handler(e){
	e.stopPropagation();
	e.preventDefault();
}

log("Hisense initialized")
