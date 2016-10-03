Item {
	id: videoPlayerProto;
	signal error;
	signal finished;
	property bool	autoPlay;
	property string	source;
	property string	tracks;
	property bool	loop: false;
	property bool	ready: true;
	property bool	paused: false;
	property bool	muted: false;
	property bool	flasPlayerPaused: false;
	property bool	waiting: false;
	property bool	seeking: false;
	property bool	desktop: context.system.device == System.Desktop;
	property bool	playing: false;
	property float	volume: 1.0;
	property int	networkState;
	property int	duration;
	property int	progress;
	property int	buffered;

	Timer {
		id: crunchTimer;
		interval: 5000;

		onTriggered: { videoPlayerProto.play(); }
	}

	onAutoPlayChanged: {
		if (value)
			this.play()
	}

	pause: {
		if (this.started) {
			log("video play stop ")
			player.Execute("Stop")
		}
	}

	play: {
		log("video play source ", this.source)

		var player = this.element.dom
		if (!player.Execute) {
			log("video player not initialized yet")
			crunchTimer.restart();
			return;
		}

		if (!this.source)
			return

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

	onWidthChanged: {
		log("video player width changed to", this.width)
		this.updateGeometry()
	}

	onHeightChanged: {
		log("video player height changed to", this.height)
		this.updateGeometry()
	}

	onXChanged: { this.updateGeometry() }
	onYChanged: { this.updateGeometry() }
	volumeUp:	{ this.volume += 0.1; }
	volumeDown:	{ this.volume -= 0.1; }

	updateGeometry: {
		if (!this.element)
			return

		this.style('width', this.width)
		this.style('height', this.height)

		var box = this.toScreen()
		log("videoplayer box", box[0], box[1], this.width, this.height)
		this.element.dom.Execute("SetDisplayArea", box[0], box[1], this.width, this.height);
	}

	onSourceChanged: {
		log("video source changed to", this.source)
		this.play();
	}

	constructor: {
		var player = this._context.createElement('object')
		player.dom.setAttribute("classid", "clsid:SAMSUNG-INFOLINK-SEF")
		this.element.remove()
		this.element = player
		this.parent.element.append(this.element)
	}

	onCompleted: {
		window.Player = {}
		window.Player.onEvent = function(event, arg) {
			log("VIDEO PLAYER EVENT", event, arg)
			if (isNaN(event))
				return

			switch (parseInt(val1)) {
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

		var player = this.element.dom
		player.Open('Player', '1.000', 'Player')
		player.OnEvent = 'Player.onEvent'
		this.updateGeometry()
		crunchTimer.restart();
		this.started = false;
	}
}
