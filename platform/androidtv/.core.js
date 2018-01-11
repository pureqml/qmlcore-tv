_globals.core.__videoBackends.androidtv = function() { return _globals.androidtv.video }
_globals.core.__deviceBackend = function() { return _globals.androidtv.device }

exports.core.device = 1

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	_globals._context.system.vendor = device.manufacturer
}
