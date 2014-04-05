
// Declare the official cardGame.  When a game is created, this will be
// initialized to the appropriate game type.
var cardGame;


jQuery(document).ready(function($) {

	var ajaxUrl;
	var user;
	var game_id;
	var gameSpec;
	var deckSpec;
	var players = [ 1, 2, 3 ];

	// exit if cge area hasn't been loaded
	if ( ! $('#cge').length > 0 ) {
		return false;
	}

	initialize();

	function initialize() {
		var ajaxUrl = $( '#ajaxUrl' ).val();
		// make sure user is logged in, then show available games
		var data = {
			action: 'cge_get_user'
		};
		$.post(ajaxUrl, data, function(response) {
			console.log('Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				user = $.parseJSON(response);
				// may want to make sure user is in a game before listening for updates
				setupSseListeners(); 
				// show available games
				get_game_types();
				get_joinable_games();
				get_my_games();
			} else {
				console.log('No user');
			}
		});
	}

	// Event listeners for updates from server
	function setupSseListeners() {
		var data = '';
		var sseSourceUrl = $( '#sse-server' ).val();
		if ( '' != sseSourceUrl ) {
			console.log('SSE Source URL: ' + sseSourceUrl);
			var sseSource = new EventSource( sseSourceUrl );

			sseSource.addEventListener( 'message', function( evt ) {
				console.log( evt.data );
				data = $.parseJSON( evt.data );
				acknowledgeEvent( data.game_id, data.notif_id ); 
			}, false );

			sseSource.addEventListener( 'gameState', function( evt ) {
				console.log( "Game state change: " + evt.data);
				data = $.parseJSON( evt.data );
				acknowledgeEvent( data.id, data.notif_id ); 
			}, false );

			sseSource.addEventListener( 'playerJoined', function( evt ) {
				console.log( "User " + evt.data + " has joined the game." );
				data = $.parseJSON( evt.data );
				acknowledgeEvent( data.game_id, data.notif_id ); 
			}, false );

			sseSource.addEventListener( 'transaction', function( evt ) {
				console.log( "Transaction:  " + evt.data );
				data = $.parseJSON( evt.data );
				acknowledgeEvent( data.game_id, data.notif_id ); 
			}, false );
		}
	}

	function acknowledgeEvent ( game_id, notif_id ) {
		var data = {
			action: 'cge_ack_event',
			game_id: game_id,
			notif_id: notif_id
		};
		$.post(ajaxUrl, data, function(response) {
			console.log('ACK Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				// successful acknowledgment
			} else {
				console.log('Error acknowledging Event: ' + notif_id);
			}
		});
	}

	function get_game_types() {
		var data = {
			action: 'cge_get_game_types'
		};
		$.post(ajaxUrl, data, function(response) {
			console.log('GGT: Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				show_game_types(response);
			} else {
				console.log('Error loading game types');
			}
		});
	}

	function show_game_types(game_types_json) {
		var game_type_list = '';
		var game_types = $.parseJSON(game_types_json);
		$('#cge_header #gameTypes').append($('<div>', { 
				class: 'gameTypesHeader',
				text:  'Click a type of game below to start a new game!',
		}));
		$.each(game_types, function(index, element) {
			$('#cge_header #gameTypes').append($('<div>', { 
				html: '<a href="javascript:void(0)">' + element.name + '</a>',
				class: 'gameType',
				'data-game-type-id':  element.id,
			}));
		});

		$('.gameType a').click(function(evt) {
			var data = {
				action:       'cge_start_game',
				game_type_id: $(this).parent().data( 'game-type-id'),
			};
			$.post(ajaxUrl, data, function(response) {
				console.log('CSG: Ajax response: ' + response);
				if (null != response && response.length && response != 0) {
					var responseObject = $.parseJSON(response);

               // ADT: temporary work-around so we can launch a game even though it 
               //      currently exists
               responseObject.success = 1;

					if (responseObject.success) {
						get_joinable_games();
						get_my_games();
						game_id = responseObject.game_id;
						gameSpec = responseObject.game_spec;
						load_deck(gameSpec.required.deck);
					} else {
						alert('You already have a game of that type.');
					}
				} else {
					console.log('Error loading game spec');
				}
			});
		});

	}

	function load_deck(deckType) {
		var data = {
			action:    'cge_load_deck_spec',
			deck_type: deckType,
		};
		$.post(ajaxUrl, data, function(response) {
			console.log('Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				deckSpec = $.parseJSON(response);
				launch_game();
			} else {
				console.log('Error loading deck spec');
			}
		});
	}

	function get_my_games() {
		var data = {
			action: 'cge_get_my_games',
		};
		$.post(ajaxUrl, data, function(response) {
			console.log('GMG: Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				show_my_games(response);
			}
		});
	}

	function show_my_games(my_games_json) {
		var my_games = $.parseJSON(my_games_json);
		$('#cge_header #myGames').html('');
		if ( my_games.length ) {
			$('#cge_header #myGames').append($('<div>', { 
					class: 'myGamesHeader',
					text:  'Click a game below to join back in!',
			}));
			$.each(my_games, function(index, element) {
				$('#cge_header #myGames').append($('<div>', { 
					class: 'myGame',
					'data-game-id':  element.id,
					html: '<a class="join" href="javascript:void(0)">' + element.game_name + '</a> ([fix me] players) <a class="pause" href="javascript:void(0)">Pause</a> <a class="end" href="javacript:void(0)">End</a> <a class="transaction" href="javascript:void(0)">Transaction</a>',
				}));
			});

			$('.myGame a.join').click(function(evt) {
				var data = {
					action:       'cge_join_game',
					game_id: $(this).parent().data( 'game-id'),
				}
				$.post(ajaxUrl, data, function(response) {
					console.log('Ajax response: ' + response);
					if (null != response && response.length && response != 0) {
						var responseObject = $.parseJSON(response);
						game_id = responseObject.game_id;
						gameSpec = responseObject.game_spec;
						load_deck(gameSpec.required.deck);
					} else {
						console.log('Error loading game spec');
					}
				});
			});

			$('.myGame a.pause').click(function(evt) {
				var data = {
					action:       'cge_pause_game',
					game_id: $(this).parent().data( 'game-id'),
				}
				$.post(ajaxUrl, data, function(response) {
					console.log('Ajax response: ' + response);
					if (null != response && response.length && response != 0) {
						var responseObject = $.parseJSON(response);
						success = responseObject.success;
					} else {
						console.log('Error pausing game');
					}
				});
			});

			$('.myGame a.end').click(function(evt) {
				var data = {
					action:       'cge_end_game',
					game_id: $(this).parent().data( 'game-id'),
				}
				$.post(ajaxUrl, data, function(response) {
					console.log('Ajax response: ' + response);
					if (null != response && response.length && response != 0) {
						var responseObject = $.parseJSON(response);
						success = responseObject.success;
					} else {
						console.log('Error ending game');
					}
				});
			});

			$('.myGame a.transaction').click(function(evt) {
				var itemsArray = [ "3C", "2D", "5H", "AS" ];
				var items = JSON.stringify(itemsArray);
				var data = {
					action:       'cge_record_transaction',
					game_id: $(this).parent().data( 'game-id'),
					from_group_id: "player1_hand",
					to_group_id: "dealer_discard",
					items: items,
				};
				console.log(data);
				$.post(ajaxUrl, data, function(response) {
					console.log('Ajax response: ' + response);
					if (null != response && response.length && response != 0) {
						var responseObject = $.parseJSON(response);
						success = responseObject.success;
					} else {
						console.log('Error sending transaction');
					}
				});
			});

		}
	}

	function get_joinable_games() {
		var data = {
			action: 'cge_get_joinable_games',
		};
		$.post(ajaxUrl, data, function(response) {
			console.log('GJG: Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				show_joinable_games(response);
			} else {
				console.log('Error loading joinable games');
			}
		});
	}

	function show_joinable_games(joinable_games_json) {
		var joinable_games = $.parseJSON(joinable_games_json);
		$('#cge_header #joinable').html('');
		if ( joinable_games.length ) {
			$('#cge_header #joinable').append($('<div>', { 
					class: 'joinableGamesHeader',
					text:  'Click a game below to join in!',
			}));
			$.each(joinable_games, function(index, element) {
				$('#cge_header #joinable').append($('<div>', { 
					class: 'joinableGame',
					'data-game-id':  element.id,
					html: '<a href="javascript:void(0)">' + element.game_name + '</a> ([fix me] open seats)',
				}));
			});

			$('.joinableGame a').click(function(evt) {
				var data = {
					action:       'cge_join_game',
					game_id: $(this).parent().data( 'game-id'),
				};
				$.post(ajaxUrl, data, function(response) {
					console.log('Ajax response: ' + response);
					if (null != response && response.length && response != 0) {
						get_joinable_games();
						get_my_games();
						var responseObject = $.parseJSON(response);
						game_id = responseObject.game_id;
						gameSpec = responseObject.game_spec;
						load_deck(gameSpec.required.deck);
					} else {
						console.log('Error loading game spec');
					}
				});
			});

		}
	}

	function launch_game(data) {
      console.log('Launching game of ' + gameSpec.name + ' with deck type ' + deckSpec.name );

      if( gameSpec.name == 'Ten Phases' )
      {
         //cardGame = new TenPhasesGame();
      }
      else
      {
         //cardGame = new CardGame();
      }

      //cardGame.Init( gameSpec, deckSpec );
      //cardGame.StartGame();
	}

});
