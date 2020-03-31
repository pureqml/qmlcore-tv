var Player = function(ui) {
	this._ui = ui

	var self = this
	ui.setMovie = function(movie) {
		self._movie = movie
	}.bind(this)

	ui.setControlIcons = function(controls) {
		self._controlIcons = controls
	}.bind(this)
}

Player.prototype.setSource = function(value) {
	log("set source", value)
	if (this._ui.autoPlay)
		this.play()
}

Player.prototype.setOption = function(name, value) {
}

Player.prototype.setAudioTrack = function(trackId) {
	log("setAudioTrack not implemented yet")
}

Player.prototype.setVideoTrack = function(trackId) {
	log("setVideoTrack not implemented yet")
}

Player.prototype.getAudioTracks = function() {
	log("getAudioTracks not implemented yet")
	return []
}

Player.prototype.getVideoTracks = function() {
	log("getVideoTracks not implemented yet")
	return []
}

Player.prototype.play = function() {
	var ui = this._ui

	var exo = ExoPlayer
	if (!this._lifecycleHandled) {
		ui._context.document.on("pause", function() { log("Pause activity", exo); exo.close() });
		ui._context.document.on("resume", function() { log("Resume to activity") });
		this._lifecycleHandled = true
	}

	if (ui.paused) {
		ExoPlayer.playPause()
		return
	}

	var self = this
	log("Play URL:", ui.source)
	ui.ready = false
	var movie = this._movie
	var controllerConfig = { }

	if (movie)
		controllerConfig = {
			streamImage: movie.poster,
			streamTitle: movie.title,
			streamDescription: movie.description,
			hideProgress: false,
			hidePosition: false,
			hideDuration: false,
			controlIcons: this._controlIcons || { }
		}

	ExoPlayer.show(
		{
			url: ui.source,
			autoPlay: ui.autoPlay,
			controller: controllerConfig
		},
		function(event) {
			if (event.eventAction == "ACTION_UP") {
				log("EventKeyCode " + event.eventKeycode)
				switch (event.eventKeycode) {
					case 'KEYCODE_BACK':
					case 'KEYCODE_ESCAPE':
						exo.close()
						break
					case 'KEYCODE_DPAD_LEFT':
						exo.seekTo(self._position - 30000)
						break
					case 'KEYCODE_DPAD_RIGHT':
						exo.seekTo(self._position + 30000)
						break
					case 'KEYCODE_DPAD_CENTER':
					case 'KEYCODE_MEDIA_PLAY_PAUSE':
						if (ui.ready)
							exo.playPause()
						break
				}
				ExoPlayer.showController()
			}

			exo.getState(
				function(e) {
					log("Player event", e)
					ui.duration = e.duration
					var position = parseInt(e.position)
					self._position = position
					ui.progress = position * 1.0 / 1000
					if (ui.duration > 0)
						ui.ready = true
					var state = e.playbackState
					if (state == "STATE_ENDED") {
						exo.close()
						ui.finished(e.position && e.duration && e.position >= e.duration)
					}
				},
				function(e) { log("Failed to get state", e)}
			)
		},
		function(err) {
			console.log("Video error:", err);
			ui.error(err)
		}
	);
}

Player.prototype.setVisibility = function(visible) {
}

Player.prototype.pause = function() {
}

Player.prototype.stop = function() {
}

Player.prototype.seek = function(delta) {
	var exo = ExoPlayer
	if (exo)
		exo.seekTo(this._position + delta * 1000)
}

Player.prototype.seekTo = function(tp) {
	var exo = ExoPlayer
	if (exo)
		exo.seekTo(tp * 1000)
}

Player.prototype.setVolume = function(volume) {
	log("Not implemented")
}

Player.prototype.setMute = function(muted) {
	log("Not implemented")
}

Player.prototype.setLoop = function(loop) {
	log("Not implemented")
}

Player.prototype.setRect = function(l, t, r, b) {
}

Player.prototype.setBackgroundColor = function(color) {
	log("Not implemented")
}

exports.createPlayer = function(ui) {
	return new Player(ui)
}

exports.probeUrl = function(url) {
	return 75
}
