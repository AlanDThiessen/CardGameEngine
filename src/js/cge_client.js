jQuery(document).ready(function($) {

	var gameSpec;
	var deckSpec;

	get_game_types();
	get_joinable_games();

	function get_game_types() {
		var data = {
			action: 'cge_get_game_types'
		};
		$.post(cgeVars.ajaxurl, data, function(response) {
			//alert('Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				show_game_types(response);
			} else {
				alert('Error loading game types');
			}
		});
	}

	function show_game_types(game_types_json) {
		var game_type_list = '';
		var game_types = $.parseJSON(game_types_json);
		$('#cge_header').append($('<div>', { 
				class: 'gameTypesHeader',
				text:  'Click a type of game below to start a new game!',
		}));
		$.each(game_types, function(index, element) {
			$('#cge_header').append($('<div>', { 
				html: '<a href="javascript:void(0)">' + element.name + '</a>',
				class: 'gameType',
				'data-game-type-id':  element.id,
			}));
		});

		$('.gameType a').click(function(evt) {
			var data = {
				action:       'cge_load_game_spec',
				game_type_id: $(this).parent().data( 'game-type-id'),
			}
			$.post(cgeVars.ajaxurl, data, function(response) {
				//alert('Ajax response: ' + response);
				if (null != response && response.length && response != 0) {
					gameSpec = $.parseJSON(response);
					load_deck(gameSpec.required.deck);
				} else {
					alert('Error loading game spec');
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
			//alert('Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				deckSpec = $.parseJSON(response);
				start_game();
			} else {
				alert('Error loading deck spec');
			}
		});
	}

	function get_joinable_games() {
		var data = {
			action: 'cge_get_joinable_games',
		};
		$.post(cgeVars.ajaxurl, data, function(response) {
			//alert('Ajax response: ' + response);
			if (null != response && response.length && response != 0) {
				show_joinable_games(response);
			} else {
				alert('Error loading joinable games');
			}
		});
	}

	function show_joinable_games(joinable_games_json) {
		var joinable_games = $.parseJSON(joinable_games_json);
		$('#cge_header').append($('<div>', { 
				class: 'joinableGamesHeader',
				text:  'Click a game below to join in!',
		}));
		$.each(joinable_games, function(index, element) {
			$('#cge_header').append($('<div>', { 
				class: 'joinableGame',
				'data-game-id':  element.id,
				html: '<a href="javascript:void(0)">' + element.instance_name + '</a> (' + element.open_seats + ' open seats)',
			}));
		});
	}

	function start_game(data) {
		alert('Starting game of ' + gameSpec.name + ' with deck type ' + deckSpec.name);
	}

});
