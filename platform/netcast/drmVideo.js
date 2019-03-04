var Player = function(ui) {
	var player = ui._context.createElement('object')
	this.player = player

	player.dom.setAttribute("drm_type", "wm-drm")
	player.dom.setAttribute("type", "application/vnd.ms-sstr+xml")
	player.dom.setAttribute("data", "")
	player.dom.setAttribute("width", ui.width)
	player.dom.setAttribute("height", ui.height)
	player.style("width", ui.width)
	player.style("height", ui.height)

	this.ui = ui
	this.source = ''

	ui.element.remove()
	ui.element = player
	ui.parent.element.append(ui.element)
}

Player.prototype.setSource = function(url) {
	this.player.dom.setAttribute("data", url)
}

Player.prototype.play = function() {
}

Player.prototype.stop = function() {
}

Player.prototype.pause = function() {
}

Player.prototype.seek = function(delta) {
}

Player.prototype.seekTo = function(tp) {
}

Player.prototype.setVolume = function(volume) {
}

Player.prototype.setMute = function(muted) {
	log('NOT IMPLEMENTED: mute', muted)
}

Player.prototype.setRect = function(l, t, r, b) {
}

Player.prototype.setVisibility = function(visible) {
	log('videoplayer setVisibility', visible)
}

Player.prototype.getVideoTracks = function() {
	return []
}

Player.prototype.getAudioTracks = function() {
	return []
}

Player.prototype.setAudioTrack = function(trackId) {
	log("setAudioTrack' not implemented")
}

Player.prototype.setVideoTrack = function(trackId) {
	log("setVideoTrack' not implemented")
}

Player.prototype.setupDrm = function(type, options, callback, error) {
	log("setupDrm' not implemented")
	callback()
}

Player.prototype.setBackgroundColor = function(color) {
	log('NOT IMPLEMENTED: setBackgroundColor')
}

exports.createPlayer = function(ui) {
	return new Player(ui)
}

exports.probeUrl = function(url) {
	return 50
}
