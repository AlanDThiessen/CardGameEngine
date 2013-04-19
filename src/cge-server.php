<?php

// functions loaded by main plugin code via add_action & add_shortcode

require('cge-config.php');
require('cge-database.php');

function cge_show_launch_link() {

	echo '<div id="cge">';
	echo '<div id="content">';
	echo '<div id="welcome">';
	echo 'Welcome to the ' . CGENAME;

	$user = wp_get_current_user();
	// Stop here if the user isn't logged in.
	if (!$user->ID) {
		echo '!  Please <a href="' . site_url() . '/wp-login.php">log in</a> to play.';
		echo '</div>';
	} else {
		// OK, they're logged in, now make sure the database is initialized
		$dbinit = cge_db_init();
		if ($dbinit === false) {
			echo '. <div class="error">Unable to create database.</div>';
		} else {
			// now greet user by name and show launch link
			echo ', ' . $user->display_name . '!';
			echo '</div>';
			echo '<input type="hidden" id="sse-server" value="' . plugins_url( '/cge-sse-server.php', __FILE__  ) . '" />';
			echo '<div id="result">';
			echo '</div>';
			echo '<div id="cge_display">';
			echo '<div id="cge_header">';
			echo '	<div id="gameTypes"></div>';
			echo '	<div id="joinable"></div>';
			echo '</div>';
			echo '<div id="cge_window"></div>';
			echo '<div id="cge_footer"></div>';
			echo '</div>';
		}
	}
	echo '</div>';
	echo '</div>';
}

function cge_enqueue_css() {
	wp_register_style( 'cge_style', plugins_url( '/css/card-game-engine.css', __FILE__  ), array(  ), '20130130', 'all');
	wp_enqueue_style( 'cge_style' );
}

function cge_enqueue_js() {
	$cgeJsVars = array(
		'ajaxurl' => admin_url( 'admin-ajax.php' )
	);

	wp_register_script( 'cge_client', plugins_url( '/js/cge_client.js', __FILE__  ), array( 'jquery' ), '20130130', true );

   wp_register_script( 'js_card',
                       plugins_url( '/js/Card.js', __FILE__ ),
                       false,
                       false,
                       false );

   wp_register_script( 'js_card_group',
                       plugins_url( '/js/CardGroup.js', __FILE__ ), 
                       array( 'js_card' ), 
                       false, 
                       false );

   wp_register_script( 'js_card_container', 
                       plugins_url( '/js/CardContainer.js', __FILE__ ), 
                       array( 'js_card_group' ), 
                       false, 
                       false );

   wp_register_script( 'js_dealer', 
                       plugins_url( '/js/Dealer.js', __FILE__ ), 
                       array( 'js_card_container' ), 
                       false, 
                       false );

   wp_register_script( 'js_player', 
                       plugins_url( '/js/Player.js', __FILE__ ), 
                       array( 'js_card_container' ), 
                       false, 
                       false );

   wp_register_script( 'js_table', 
                       plugins_url( '/js/Table.js', __FILE__ ), 
                       array( 'js_card_container' ), 
                       false, 
                       false );

   wp_register_script( 'js_card_game', 
                       plugins_url( '/js/CardGame.js', __FILE__ ), 
                       array( 'js_dealer', 'js_player', 'js_table' ), 
                       false, 
                       false );

   wp_register_script( 'js_ten_phases_game', 
                       plugins_url( '/js/games/TenPhases/TenPhases.js', __FILE__ ), 
                       array( 'js_card_game' ), 
                       false, 
                       false );

   wp_enqueue_script( 'js_card' );
   wp_enqueue_script( 'js_card_group' );
   wp_enqueue_script( 'js_card_container' );
   wp_enqueue_script( 'js_dealer' );
   wp_enqueue_script( 'js_player' );
   wp_enqueue_script( 'js_table' );
   wp_enqueue_script( 'js_card_game' );
   wp_enqueue_script( 'js_ten_phases_game' );
	wp_enqueue_script( 'cge_client' );

	wp_localize_script( 'cge_client', 'cgeVars', $cgeJsVars );
}

function cge_get_user() {
	$user = wp_get_current_user();
	if ($user->ID) {
		$userResponse = array(
			'ID' => $user->ID,
			'login' => $user->user_login,
			'name' => $user->display_name,
		);
		echo json_encode($userResponse);
	}
	// Need this for Ajax return
	die();
}

function cge_get_game_types() {
	$game_types = array();
	$xml_files = scandir( CGEPATH . 'xml' );
	foreach ( $xml_files as $xml_file ) {
		if ( substr( $xml_file, -8, 8 ) == 'game.xml' ) {
			$game_spec = simplexml_load_file( CGEPATH . 'xml/' . $xml_file );
			if ( $game_spec[ 'id' ] != null ) {
				$game_types[] = array(
					'id'   => (string)$game_spec[ 'id' ],
					'name' => (string)$game_spec->name
				);
			}
		}
	}

	echo json_encode($game_types);

	// Need this for Ajax return
	die();
}

function cge_get_joinable_games() {

	$joinable_games = get_joinable_games();
	echo json_encode($joinable_games);

	// Need this for Ajax return
	die();
}

function cge_start_game() {
	$game_type_id = htmlspecialchars( $_POST[ 'game_type_id' ] );
	$gameFile = CGEPATH . 'xml/' . $game_type_id . '-game.xml';
	if (!file_exists($gameFile)) {
		die('CGE ERROR: ' . $game_type_id . ' definition file not found.');
	} 
	$game_spec = simplexml_load_file($gameFile);
	if ( $game_spec[ 'id' ] != $game_type_id ) {
		die('CGE ERROR: Definition file found is for ' . $game_spec[ 'id' ] . ', not for ' . $game_type_id );
	}

	$user = wp_get_current_user();

	// check whether this user already has a game of this type, 
	$game_id = get_game_by_user( $game_type_id, $user->ID );

	if ( $game_id ) {
		// @TODO: verify with user to reusue or delete this game?
		$success = 0;
	} else {
		$game_name = $game_spec->name . ' created by ' . $user->display_name;

		// create game in db
		$game_id = create_game( $game_type_id, $game_name, $user->ID, $game_spec->required->maxPlayers );

		// add first user to game
		$success = join_game( $game_id, $user->ID );
	}

	// return game id & spec
	$return_value = array(
		'success' => $success,
		'game_id' => $game_id,
		'game_spec' => $game_spec
	);
	echo json_encode($return_value);

	// Need this for Ajax return
	die();
}

function cge_join_game() {
	//load game type from db
	$game_id = htmlspecialchars( $_POST[ 'game_id' ] );
	$game = get_game_by_id( $game_id );
	if (!$game) {
		die('CGE ERROR: ' . $game_id . ' not found.');
	}

	// load game definition file
	$game_type_id = $game->game_type_id;
	$gameFile = CGEPATH . 'xml/' . $game_type_id . '-game.xml';
	if (!file_exists($gameFile)) {
		die('CGE ERROR: ' . $game_type_id . ' definition file not found.');
	} 
	$game_spec = simplexml_load_file($gameFile);
	if ( $game_spec[ 'id' ] != $game_type_id ) {
		die('CGE ERROR: Definition file found is for ' . $game_spec[ 'id' ] . ', not for ' . $game_type_id );
	}

	$user = wp_get_current_user();

	// add user to game; sse-server will notify players of change
	$success = join_game( $game_id, $user->ID );
	
	// return game id & spec
	$return_value = array(
		'success' => $success,
		'game_id' => $game_id,
		'game_spec' => $game_spec
	);
	echo json_encode($return_value);

	// Need this for Ajax return
	die();
}

function cge_load_deck_spec() {
	$deckType = htmlspecialchars( $_POST[ 'deck_type' ] );
	$deckFile = CGEPATH . 'xml/' . $deckType . '-deck.xml';
	if (!file_exists($deckFile)) {
		die('CGE ERROR: ' . $deckType . ' definition file not found.');
	} 
	$deckSpec = simplexml_load_file($deckFile);

	echo json_encode($deckSpec);

	// Need this for Ajax return
	die();
}

