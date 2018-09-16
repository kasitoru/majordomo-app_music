/*
	Music Player for MajorDoMo
	Author: Sergey Avdeev <thesoultaker48@gmail.com>
	URL: https://github.com/thesoultaker48/majordomo-app_music
*/

class app_music {
	
	constructor(terminal) {
		this.container = '#app_music';
		this.terminal = terminal;
		
		this.main_timer = null;
		this.status_timer = null;
		
		this.mt_interval = 1000;
		this.st_interval = 3000;
		
		this.features = new Array(
			'status',
			//'play',
			'pause',
			'stop',
			'next',
			'previous',
			'seek',
			//'set_volume',
			'pl_get',
			//'pl_add',
			//'pl_empty',
			'pl_play',
			//'pl_sort',
			'pl_random',
			'pl_loop',
			'pl_repeat',
			'123'
		);
		
		this.status = new Object();
		this.status.track_id	= -1;
		this.status.length		= -1;
		this.status.time		= -1;
		this.status.state		= 'unknown';
		this.status.volume		= -1;
		this.status.random		= false;
		this.status.loop		= false;
		this.status.repeat		= false;
		this.status.playlist	= new Array();
		
		this.snapshot = new Object();
	}
	
	// Create snapshot of status object
	create_snapshot() {
		this.snapshot = $.extend(true, {}, this.status);
	}
	
	// Check snapshot of status object
	check_snapshot(property) {
		if(property == 'playlist') {
			return !(JSON.stringify(this.status[property]) === JSON.stringify(this.snapshot[property]));
		} else {
			return !(this.status[property] === this.snapshot[property]);
		}
	}
	
	// Player initialization
	init_player(callback) {
		var _this = this;
		// Check support for required features
		this.check_features(function(compatibility) {
			if(!compatibility) {
				alert('This type of terminal does not support all the necessary commands! Correct work is not guaranteed.');
			}
			// Get player status
			_this.get_status(function() {
				// Get playlist
				_this.pl_get(function() {
					// Update interface
					_this.update_interface(function() {
						// Show player
						$(_this.container).find('.app_music_loading_screen').fadeOut(1000);
						// Controls
						$(_this.container).find('.app_music_play_button').on('click', function() {
							_this.play($(this).attr('data-file'));
						});
						$(_this.container).find('.app_music_pause_button').on('click', function() {
							_this.pause();
						});
						$(_this.container).find('.app_music_stop_button').on('click', function() {
							_this.stop();
						});
						$(_this.container).find('.app_music_next_button').on('click', function() {
							_this.next();
						});
						$(_this.container).find('.app_music_previous_button').on('click', function() {
							_this.previous();
						});
						$(_this.container).find('.app_music_track_scrubber_element').draggable({
							axis: 'x',
							containment: $(_this.container).find('.app_music_track_progress_element'),
							stop: function() {
								var progress_width = $(_this.container).find('.app_music_track_progress_element').outerWidth(true);
								var track_position = Math.round((parseInt($(this).css('left'), 10)/(progress_width/100))*(_this.status.length/100));
								_this.seek(track_position);
							}
						});
						/*
						$(_this.container).find('.app_music_volume_scrubber_element').draggable({
							axis: 'x',
							containment: $(_this.container).find('.app_music_volume_progress_element'),
							stop: function() {
								var progress_width = $(_this.container).find('.app_music_volume_progress_element').outerWidth(true);
								var volume_position = Math.round((parseInt($(this).css('left'), 10)/(progress_width/100)));
								_this.set_volume(volume_position);
							}
						});
						*/
						$(_this.container).find('.app_music_pl_add_button').on('click', function() {
							_this.pl_add($(this).attr('data-file'));
						});
						$(_this.container).find('.app_music_pl_delete_button').on('click', function() {
							_this.pl_delete($(this).attr('data-id'));
						});
						$(_this.container).find('.app_music_pl_empty_button').on('click', function() {
							_this.pl_empty();
						});
						$(_this.container).find('.app_music_pl_play_button').on('click', function() {
							_this.pl_play($(this).attr('data-id'));
						});
						$(_this.container).find('.app_music_pl_sort_button').on('click', function() {
							_this.pl_sort($(this).attr('data-order'));
						});
						$(_this.container).find('.app_music_pl_random_button').on('click', function() {
							_this.pl_random();
						});
						$(_this.container).find('.app_music_pl_loop_button').on('click', function() {
							_this.pl_loop();
						});
						$(_this.container).find('.app_music_pl_repeat_button').on('click', function() {
							_this.pl_repeat();
						});
						$(_this.container).find('.app_music_pl_loop_repeat_button').on('click', function() {
							_this.pl_loop_repeat();
						});
						// The main interface timer
						_this.main_timer = setTimeout(function main_timer(__this) {
							if(__this.status.state == 'playing') {
								__this.status.time = __this.status.time + 1;
								if(__this.status.time >= __this.status.length) {
									__this.get_status(function() {
										__this.update_interface();
									});
								}
							}
							__this.update_interface(function() {
								__this.main_timer = setTimeout(main_timer, __this.mt_interval, __this);
							});
						}, _this.mt_interval, _this);
						// Timer for get player status
						_this.status_timer = setTimeout(function status_timer(__this) {
							__this.get_status(function() {
								__this.status_timer = setTimeout(status_timer, __this.st_interval, __this);
							});
						}, _this.st_interval, _this);
						// Callback
						if(!!callback) {
							callback();
						}
					});
				});
			});
		});
	}
		
	// Check features
	check_features(callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=features&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				var compatibility = true;
				_this.features.every(function(feature) {
					var supported = false;
					json.data.every(function(item) {
						if(feature == item) {
							supported = true;
							return false;
						} else {
							return true;
						}
					});
					if(supported == false) {
						compatibility = false;
						return false;
					} else {
						return true;
					}
				});
				if(!compatibility) {
					console.warn('check_features(): This type of terminal does not support all the necessary commands! Correct work is not guaranteed.');
				}
				if(!!callback) {
					callback(compatibility);
				}
			} else {
				console.error('check_features(): '+json.message);
			}
		});
	}
			
	// Update the interface
	update_interface(callback) {
		var _this = this;
		// Track title
		if(this.check_snapshot('track_id')) {
			if(this.status.track_id == -1) {
				$(this.container).find('.app_music_track_title_text').text('');
			} else {
				this.status.playlist.every(function(item) {
					if(item.id == _this.status.track_id) {
						$(_this.container).find('.app_music_track_title_text').text(item.name);
						return false;
					}
					return true;
				});
			}
		}
		// Length
		if(this.check_snapshot('length')) {
			if(this.status.length <= 0) {
				$(this.container).find('.app_music_track_length_text').text('00:00');
			} else {
				var h = Math.floor(this.status.length/60/60);
				var m = Math.floor((this.status.length-h*60*60)/60);
				var s = Math.floor((this.status.length-h*60*60-m*60));
				var length = (h>0?h+':':'')+('00'+m).slice(-2)+':'+('00'+s).slice(-2);
				$(this.container).find('.app_music_track_length_text').text(length);
			}
		}
		// Time
		if(this.check_snapshot('time')) {
			if(this.status.time <= 0) {
				$(this.container).find('.app_music_track_time_text').text('00:00');
				$(this.container).find('app_music_track_scrubber_element').css('left', '0px');
			} else {
				var h = Math.floor(this.status.time/60/60);
				var m = Math.floor((this.status.time-h*60*60)/60);
				var s = Math.floor((this.status.time-h*60*60-m*60));
				var time = (h>0?h+':':'')+('00'+m).slice(-2)+':'+('00'+s).slice(-2);
				$(this.container).find('.app_music_track_time_text').text(time);
				var progress_width = $(this.container).find('.app_music_track_progress_element').outerWidth(true);
				$(this.container).find('.app_music_track_scrubber_element').css('left', Math.round((progress_width/100)*(this.status.time/(this.status.length/100)))+'px');
			}
		}
		// State
		if(this.check_snapshot('state')) {
			if(this.status.state == 'playing') {
				$(this.container).find('.app_music_pause_button').removeClass('active');
				$(this.container).find('.app_music_stop_button').removeClass('active');
				$(this.container).find('.app_music_play_button').addClass('active');
			} else {
				$(this.container).find('.app_music_pause_button').addClass('active');
				$(this.container).find('.app_music_stop_button').addClass('active');
				$(this.container).find('.app_music_play_button').removeClass('active');
			}
		}
		// Volume
		/*
		if(this.check_snapshot('volume')) {
		}
		*/
		// Random
		if(this.check_snapshot('random')) {
			if(this.status.random) {
				$(this.container).find('.app_music_pl_random_button').addClass('active');
			} else {
				$(this.container).find('.app_music_pl_random_button').removeClass('active');
			}
		}
		// Loop
		if(this.check_snapshot('loop')) {
			if(this.status.loop) {
				$(this.container).find('.app_music_loop_button').addClass('active');
			} else {
				$(this.container).find('.app_music_loop_button').removeClass('active');
			}
		}
		// Repeat
		if(this.check_snapshot('repeat')) {
			if(this.status.repeat) {
				$(this.container).find('.app_music_repeat_button').addClass('active');
			} else {
				$(this.container).find('.app_music_repeat_button').removeClass('active');
			}
		}
		// Loop & Repeat
		if(this.check_snapshot('loop') || this.check_snapshot('repeat')) {
			if(this.status.loop) {
				$(this.container).find('.app_music_pl_loop_repeat_button').addClass('active_loop');
				$(this.container).find('.app_music_pl_loop_repeat_button').removeClass('active_repeat');
			} else if(this.status.repeat) {
				$(this.container).find('.app_music_pl_loop_repeat_button').removeClass('active_loop');
				$(this.container).find('.app_music_pl_loop_repeat_button').addClass('active_repeat');
			} else {
				$(this.container).find('.app_music_pl_loop_repeat_button').removeClass('active_loop');
				$(this.container).find('.app_music_pl_loop_repeat_button').removeClass('active_repeat');
			}
		}
		// Playlist
		if(this.check_snapshot('playlist')) {
			this.status.playlist.every(function(item) {
				$(_this.container).find('.app_music_tracklist_list').append('<li class="app_music_pl_play_button" data-id="'+item.id+'">'+item.name+'</li>');
				return true;
			});
		}
		// Create snapshot
		this.create_snapshot();
		// Callback
		if(!!callback) {
			callback();
		}
	}
		
	/*
		API for app_player
	*/
		
	// Get player status
	get_status(callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=status&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.status.track_id	= json.data.track_id;
				_this.status.length		= json.data.length;
				_this.status.time		= json.data.time;
				_this.status.state		= json.data.state;
				_this.status.volume		= json.data.volume;
				_this.status.random		= json.data.random;
				_this.status.loop		= json.data.loop;
				_this.status.repeat		= json.data.repeat;
				if(!!callback) {
					callback();
				}
			} else {
				console.error('status(): '+json.message);
			}
		});
	}
		
	// Play
	play(file, callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=play&param='+encodeURIComponent(file)+'&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('play(): '+json.message);
			}
		});
	}
		
	// Pause
	pause(callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=pause&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('play_pause(): '+json.message);
			}
		});
	}
		
	// Stop
	stop(callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=stop&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('stop(): '+json.message);
			}
		});
	}
		
	// Next
	next(callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=next&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('next(): '+json.message);
			}
		});
	}
		
	// Previous
	previous(callback) {
		var _this = this;
		if(this.status.time > 3) {
			this.stop(function() {
				_this.pause(callback);
			});
		} else {
			$.ajax({
				url: '/popup/app_player.html?ajax=1&command=previous&play_terminal='+this.terminal,
				dataType: 'json'
			}).done(function(json) {
					if(json.success) {
					_this.get_status(function() {
						_this.update_interface(callback);
					});
				} else {
					console.error('previous(): '+json.message);
				}
			});
		}
	}
		
	// Seek
	seek(position, callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=seek&param='+parseInt(position, 10)+'&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('seek(): '+json.message);
			}
		});
	}

	// Set volume
	set_volume(level, callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=set_volume&param='+parseInt(level, 10)+'&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('set_volume(): '+json.message);
			}
		});
	}
		
	// Playlist: Get
	pl_get(callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=pl_get&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.snapshot.playlist = _this.status.playlist;
				_this.status.playlist = new Array();
				if(json.data) {
					json.data.every(function(item) {
						_this.status.playlist.push(item);
						return true;
					});
				}
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('pl_get(): '+json.message);
			}
		});
	}
		
	// Playlist: Add
	pl_add(file, callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=pl_add&param='+encodeURIComponent(file)+'&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('pl_add(): '+json.message);
			}
		});
	}
		
	// Playlist: Delete
	pl_delete(id, callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=pl_delete&param='+parseInt(id, 10)+'&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('pl_delete(): '+json.message);
			}
		});
	}
		
	// Playlist: Empty
	pl_empty(callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=pl_empty&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('pl_empty(): '+json.message);
			}
		});
	}
		
	// Playlist: Play
	pl_play(id, callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=pl_play&param='+parseInt(id, 10)+'&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('pl_play(): '+json.message);
			}
		});
	}
		
	// Playlist: Sort
	pl_sort(order, callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=pl_sort&param='+encodeURIComponent(file)+'&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('pl_sort(): '+json.message);
			}
		});
	}
		
	// Playlist: Random
	pl_random(callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=pl_random&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('pl_random(): '+json.message);
			}
		});
	}
		
	// Playlist: Loop
	pl_loop(callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=pl_loop&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('pl_loop(): '+json.message);
			}
		});
	}
		
	// Playlist: Repeat
	pl_repeat(callback) {
		var _this = this;
		$.ajax({
			url: '/popup/app_player.html?ajax=1&command=pl_repeat&play_terminal='+this.terminal,
			dataType: 'json'
		}).done(function(json) {
			if(json.success) {
				_this.get_status(function() {
					_this.update_interface(callback);
				});
			} else {
				console.error('pl_repeat(): '+json.message);
			}
		});
	}

	// Playlist: Loop & Repeat
	pl_loop_repeat(callback) {
		var _this = this;
		if(this.status.loop) {
			this.pl_loop(function() {
				_this.pl_repeat(callback);
			});
		} else if(this.status.repeat) {
			this.pl_repeat(callback);
		} else {
			this.pl_loop(callback);
		}
	}
	
}
