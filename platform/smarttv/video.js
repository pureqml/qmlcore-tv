var Player = function(ui) {
	var player = this._context.createElement('object')
	this.player = player
	this._crunchTimer = null

	player.dom.setAttribute("classid", "clsid:SAMSUNG-INFOLINK-SEF")
	this.ui = ui
	this.started = false
	this.source = ''

	ui.element.remove()
	ui.element = player
	ui.parent.element.append(this.element)

	///onCompleted:

	//DAFUQ???

	//generate uniqueId (see Element.uniqueId)
	window.Player = {}
	window.Player.onEvent = function(event, arg) {
		log("VIDEO PLAYER EVENT", event, arg)
		if (isNaN(event))
			return

		switch (parseInt(event)) {
		case -1: //Fired on error?
			break;
		case 6: //Was fired when the file as at the end... After 8 was fired
			break;
		case 7: //Fired after play was pressed --> or when ready to play?
			break;
		case 8: //Playback came to an end (case found when rewind came to the start of the file)
			break;
		case 9: // SEF init ?
			break;
		case 11: //Fired after 9
			break;
		case 12: //Fired after last 13 event. Buffering complete
			break;
		case 13:// Possible that this indicates the buffering level in %
			break;
		case 14: //Fired every 0.5 seconds with current playback time in val2
			self.progress = arg;
			break;
		default:
			break;
		}
	}

	var player = this.player
	player.Open('Player', '1.000', 'Player')
	player.OnEvent = 'Player.onEvent'

	this.startTimer()
	this.started = false
}

Player.prototype.startTimer = function() {
	if (this._crunchTimer === null)
		this._crunchTimer = setInterval(this.play.bind(this), 5000)
}

Player.prototype.setSource = function(url) {
	this.source = url
}

Player.prototype.play = function() {
	log("video play source ", this.source)

	var player = this.player
	if (!player.Execute) {
		log("video player not initialized yet")
		this.startTimer()
		return;
	}

	if (this.started) {
		log("video play stop ")
		player.Execute("Stop")
	}

	log("calling initialize")
	player.Execute("InitPlayer", this.source + "|COMPONENT=HLS")
	this.updateGeometry()
	//player.Execute("SetInitialBufferSize", 400*1024);
	log("calling StartPlayback")
	log("StartPlayback returns", player.Execute("StartPlayback"))
	this.started = true;
}

Player.prototype.pause = function() {
	if (this.started) {
		log("video play stop ")
		this.player.Execute("Stop")
	}
}

Player.prototype.seek = function(delta) {
	log('NOT IMPLEMENTED: seek', delta)
}

Player.prototype.seekTo = function(tp) {
	log('NOT IMPLEMENTED: seekTo', delta)
}

Player.prototype.setVolume = function(volume) {
	log('NOT IMPLEMENTED: setVolume', delta)
}

Player.prototype.setMute = function(muted) {
	log('NOT IMPLEMENTED: mute', delta)
}

Player.prototype.setRect = function(l, t, r, b) {
	var w = r - l, h = b - t
	this.style('width', w)
	this.style('height', h)

	this.player.Execute("SetDisplayArea", l, t, w, h)
}

Player.prototype.setVisibility = function(visible) {
	log('NOT IMPLEMENTED: setVisibility', delta)
}


Player.prototype.setBackgroundColor = function(color) {
	log('NOT IMPLEMENTED: setBackgroundColor', delta)
}


exports.createPlayer = function(ui) {
	return new Player(ui)
}

exports.probeUrl = function(url) {
	return 75
}
