var Player = _globals.video.html5.backend.Player

Player.prototype = Object.create(_globals.video.html5.backend.Player.prototype)

Player.prototype.pause = function() {
	var ui = this.ui
	if (!ui)
		return

	log("Player pause waiting:", ui.waiting, "seeking", ui.seeking)
	if (!ui.waiting && !ui.seeking)
		this.element.dom.pause()
}

exports.createPlayer = function(ui) {
	return new Player(ui)
}

exports.probeUrl = function(url) {
	return 75
}
