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
			echo '<div id="cge_header"></div>';
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
	// @TODO pull these from the db
	// and allow players to name their game instance
	$joinable_games = array(
		array(
			'id' => '1',
			'game_type_name' => 'Simple War',
			'instance_name' => "David's Simple War Instance",
			'open_seats' => '1',
		),
		array(
			'id' => '287',
			'game_type_name' => 'Ten Phases',
			'instance_name' => "Alan's Game of Ten Phases",
			'open_seats' => '3',
		),
	);

	echo json_encode($joinable_games);

	// Need this for Ajax return
	die();
}

function cge_start_game() {
	$gameTypeId = htmlspecialchars( $_POST[ 'game_type_id' ] );
	$gameFile = CGEPATH . 'xml/' . $gameTypeId . '-game.xml';
	if (!file_exists($gameFile)) {
		die('CGE ERROR: ' . $gameTypeId . ' definition file not found.');
	} 
	$game_spec = simplexml_load_file($gameFile);
	if ( $game_spec[ 'id' ] != $gameTypeId ) {
		die('CGE ERROR: Definition file found is for ' . $game_spec[ 'id' ] . ', not for ' . $gameTypeId );
	}

	// return game spec
	echo json_encode($game_spec);

	// Need this for Ajax return
	die();
}

function cge_join_game() {
	$gameId = htmlspecialchars( $_POST[ 'game_id' ] );
	//@TODO: add player to game; sse-server will notify players of change
	
	//@TODO: load game type from db
	if ($gameId == 1) {
		$gameTypeId = 'simple-war';
	} else {
		$gameTypeId = 'ten-phases';
	}
	$gameFile = CGEPATH . 'xml/' . $gameTypeId . '-game.xml';
	if (!file_exists($gameFile)) {
		die('CGE ERROR: ' . $gameTypeId . ' definition file not found.');
	} 
	$game_spec = simplexml_load_file($gameFile);
	if ( $game_spec[ 'id' ] != $gameTypeId ) {
		die('CGE ERROR: Definition file found is for ' . $game_spec[ 'id' ] . ', not for ' . $gameTypeId );
	}

	echo json_encode($game_spec);

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

