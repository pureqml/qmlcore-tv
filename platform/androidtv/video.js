var Player = function(ui) {
	this._ui = ui
}

Player.prototype.setSource = function(value) {
	log("set source", value)
}

Player.prototype.play = function() {
	var ui = this._ui
	log("Play URL:", ui.source)
	VideoPlayer.play(
		ui.source,
		{
			volume: 1.0,
			scalingMode: VideoPlayer.SCALING_MODE.SCALE_TO_FIT_WITH_CROPPING
		},
		function() {
			log("video completed");
			ui.finished()
		},
		function(err) {
			console.log("VideoPlayer error:", err);
			ui.error(err)
		}
	);
}

Player.prototype.setVisibility = function(visible) {
	log("setVisibility", visible)
}

Player.prototype.pause = function() {
}

Player.prototype.stop = function() {
}

Player.prototype.seek = function(delta) {
}

Player.prototype.seekTo = function(tp) {
}

Player.prototype.setVolume = function(volume) {
}

Player.prototype.setMute = function(muted) {
}

Player.prototype.setRect = function(l, t, r, b) {
}

Player.prototype.setBackgroundColor = function(color) {
}

exports.createPlayer = function(ui) {
	return new Player(ui)
}

exports.probeUrl = function(url) {
	return 75
}
