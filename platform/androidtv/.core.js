_globals.core.__videoBackends.androidtv = function() { return _globals.androidtv.video }
_globals.core.__deviceBackend = function() { return _globals.androidtv.device }

exports.core.device = 1

var fitToScreen = function() {
	var width = window.$manifest$resolutionWidth
	var height = window.$manifest$resolutionHeight

	if (height) {
		window.cordovaExecCall("setSize", [width, height],
			function() { log("SetSize", width, height) },
			function(err) { log("Failed to set size") }
		)
	} else {
		window.cordovaExecCall("ftiToScreen", [],
			function() { log("Fit to screen") },
			function(err) { log("Failed to fit screen") }
		)
	}
}

window.cordovaExecCall = function(name, args, callback, error) {
	log("cordovaExecCall", name, "args", args)
	if (window.cordova) {
		window.cordova.exec(callback, error, "AndroidTV", name, args);
	} else {
		log("Cordova undefined error")
		error()
	}
}

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	console.log("androidtv device ready")
	_globals._context.system.vendor = device.manufacturer
	fitToScreen()
}

document.addEventListener("click", handler, true);
function handler(e){
	e.stopPropagation();
	e.preventDefault();
}

log("AndroidTV initialized")
