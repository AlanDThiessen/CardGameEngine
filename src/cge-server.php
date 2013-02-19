<?php

// functions loaded by main plugin code via add_action & add_shortcode

require('cge-config.php');

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
		// OK, they're logged in, greet them by name and show launch link
		echo ', ' . $user->display_name . '!';
		echo '</div>';
		echo '<div id="cge_display">';
		echo '<div id="cge_header"></div>';
		echo '<div id="cge_window"></div>';
		echo '<div id="cge_footer"></div>';
		echo '</div>';
	}
	echo '</div>';
	echo '</div>';
}
add_shortcode( 'cge_launch_link', 'cge_show_launch_link' );

function cge_get_game_types() {
	// @TODO pull these from the db
	$game_types = array(
		array(
			'id' => 'simple-war',
			'name' => 'Simple War',
		),
		array(
			'id' => 'flex',
			'name' => 'Flex',
		),
		array(
			'id' => 'rummy',
			'name' => 'Rummy',
		),
		array(
			'id' => 'ten-phases',
			'name' => 'Ten Phases',
		),
	);

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
			'id' => '245',
			'game_type_name' => 'Flex',
			'instance_name' => "Chris's Game of Flex",
			'open_seats' => '2',
		),
	);

	echo json_encode($joinable_games);

	// Need this for Ajax return
	die();
}

function cge_load_game_spec() {
	$gameTypeId = htmlspecialchars( $_POST[ 'game_type_id' ] );
	$gameFile = CGEPATH . 'xml/' . $gameTypeId . '-game.xml';
	if (!file_exists($gameFile)) {
		die('CGE ERROR: ' . $gameTypeId . ' definition file not found.');
	} 
	$gameSpec = simplexml_load_file($gameFile);
	if ( $gameSpec[ 'id' ] != $gameTypeId ) {
		die('CGE ERROR: Definition file found is for ' . $gameSpec[ 'id' ] . ', not for ' . $gameTypeId );
	}

	echo json_encode($gameSpec);


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

