_globals.core.__videoBackends.orsay = function() { return _globals.orsay.video }
_globals.core.__deviceBackend = function() { return _globals.orsay.device }
//samsung guts
var widgetAPI
var tvKey
var pluginAPI

log = function(dummy) {
	COPY_ARGS(args, 0)
	alert("[QML] " + args.join(" "))
}

if ('Common' in window) {
	alert("[QML] samsung smart tv")
	exports.core.vendor = "samsung"
	exports.core.device = 1
	exports.core.os = "orsay"

	log("loading")
	widgetAPI = new window.Common.API.Widget() // Creates Common module
	log("widget ok")
	tvKey = new window.Common.API.TVKeyValue()
	log("tv ok")
	widgetAPI.sendReadyEvent() // Sends 'ready' message to the Application Manager
	log("registering keys")

	window.onShow = function() {
		var NNaviPlugin = document.getElementById("pluginObjectNNavi");
		pluginAPI = new window.Common.API.Plugin()
		pluginAPI.registFullWidgetKey()
		pluginAPI.SetBannerState(1);
		NNaviPlugin.SetBannerState(2);
		pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
		pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
		pluginAPI.unregistKey(tvKey.KEY_MUTE);
		log("plugin ok, sending ready", context)
		context._processActions();
	}

	exports.closeApp = function() {
		widgetAPI.sendExitEvent();
	}

	log("Orsay initialized")
}

exports.core.keyCodes = {
	4: 'Left',
	5: 'Right',
	17: '0',
	101: '1',
	98: '2',
	6: '3',
	8: '4',
	9: '5',
	10: '6',
	12: '7',
	13: '8',
	14: '9',
	20: 'Green',
	21: 'Yellow',
	22: 'Blue',
	68: 'PageUp',
	65: 'PageDown',
	68: 'ChannelUp',
	65: 'ChannelDown',
	69: 'Rewind',
	70: 'Stop',
	71: 'Play',
	72: 'FastForward',
	74: 'Pause',
	88: 'Back',
	108: 'Red',
	262: 'Menu',
	29461: 'Down',
	29460: 'Up',
	29443: 'Select'
}
