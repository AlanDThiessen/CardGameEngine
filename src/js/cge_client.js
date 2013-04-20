
// Declare the official cardGame.  When a game is created, this will be
// initialized to the appropriate game type.
var cardGame;


jQuery(document).ready(function($) {

	var user;
	var game_id;
	var gameSpec;
	var deckSpec;

	// exit if cge area hasn't been loaded
	if ( ! $('#cge').length > 0 ) {
		return false;
	}

	initialize();

	function initialize() {
		// mkae suer user is logged in, then show available games
		var data = {
			action: 'cge_get_user'
		};
		$.post(cgeVars.ajaxurl, data, function(response) {
			//console.log('Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				user = $.parseJSON(response);
				setupSseListeners();
				// show available games
				get_game_types();
				get_joinable_games();
			} else {
				//console.log('No user');
			}
		});
	}

	// Event listeners for updates from server
	function setupSseListeners() {
		var sseSourceUrl = $( '#sse-server' ).val();
		if ( '' != sseSourceUrl ) {
			//console.log('SSE Source URL: ' + sseSourceUrl);
			var sseSource = new EventSource( sseSourceUrl );
		}

		sseSource.addEventListener( 'message', function( evt ) {
			//console.log( evt.data );
		}, false );

		sseSource.addEventListener( 'userJoined', function( evt ) {
			//console.log( "User " + evt.data + " has joined the game." );
		}, false );

		sseSource.addEventListener( 'update', function( evt ) {
			//console.log( "Update: " + evt.data );
		}, false );
	}

	function get_game_types() {
		var data = {
			action: 'cge_get_game_types'
		};
		$.post(cgeVars.ajaxurl, data, function(response) {
			//console.log('Ajax response: ' + response);
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
			$.post(cgeVars.ajaxurl, data, function(response) {
				console.log('Ajax response: ' + response);
				if (null != response && response.length && response != 0) {
					var responseObject = $.parseJSON(response);

               // ADT: temporary work-around so we can launch a game even though it 
               //      currently exists
               responseObject.success = 1;

					if (responseObject.success) {
						get_joinable_games();
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
		$.post(cgeVars.ajaxurl, data, function(response) {
			//console.log('Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				deckSpec = $.parseJSON(response);
				launch_game();
			} else {
				console.log('Error loading deck spec');
			}
		});
	}

	function get_joinable_games() {
		var data = {
			action: 'cge_get_joinable_games',
		};
		$.post(cgeVars.ajaxurl, data, function(response) {
			//console.log('Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				show_joinable_games(response);
			} else {
				console.log('Error loading joinable games');
			}
		});
	}

	function show_joinable_games(joinable_games_json) {
		var joinable_games = $.parseJSON(joinable_games_json);
		if ( joinable_games.length ) {
			$('#cge_header #joinable').html('');
			$('#cge_header #joinable').append($('<div>', { 
					class: 'joinableGamesHeader',
					text:  'Click a game below to join in!',
			}));
			$.each(joinable_games, function(index, element) {
				$('#cge_header #joinable').append($('<div>', { 
					class: 'joinableGame',
					'data-game-id':  element.id,
					html: '<a href="javascript:void(0)">' + element.game_name + '</a> (' + (element.num_players_allowed - element.num_players_joined) + ' open seats)',
				}));
			});

			$('.joinableGame a').click(function(evt) {
				var data = {
					action:       'cge_join_game',
					game_id: $(this).parent().data( 'game-id'),
				};
				$.post(cgeVars.ajaxurl, data, function(response) {
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

		}
	}

	function launch_game(data) {
      console.log('Launching game of ' + gameSpec.name + ' with deck type ' + deckSpec.name );

      if( gameSpec.name == 'Ten Phases' )
      {
         cardGame = new TenPhasesGame();
      }
      else
      {
         cardGame = new CardGame();
      }

      cardGame.Init( gameSpec, deckSpec );
      cardGame.StartGame();
	}

});
