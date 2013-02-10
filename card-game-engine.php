<?php
/*
Plugin Name: Card Game Engine
Plugin URI: http://github.com/thesleepypenguin/card-game-engine
Description: A plugin to allow users to play card games
Version: 0.1
Author: Alan Thiessen, David Doughty, Jordan Goulder
License: Probably will be GPL2 at some point
*/

// @TODO: move functions to file(s) in src directory so this file contains 
// only minimal WP plugin calls (add_action, add_shortcode, etc)

if ( !function_exists( 'add_action' ) ) {
        echo "Can't call this directly; it's a plugin.";
        exit;
}

require('src/cge-config.php');

function cge_enqueue_css() {
	wp_register_style( 'cge_style', plugins_url( '/src/css/card-game-engine.css', __FILE__  ), array(  ), '20130130', 'all');
	wp_enqueue_style( 'cge_style' );
}
add_action( 'wp_enqueue_scripts', 'cge_enqueue_css' ); 

function cge_enqueue_js() {
	$cgeJsVars = array(
		'ajaxurl' => admin_url( 'admin-ajax.php' )
	);
	wp_register_script( 'cge_client', plugins_url( '/src/js/cge_client.js', __FILE__  ), array( 'jquery' ), '20130130', true );

	wp_enqueue_script( 'cge_client' );
	wp_localize_script( 'cge_client', 'cgeVars', $cgeJsVars );
}
add_action( 'wp_enqueue_scripts', 'cge_enqueue_js' ); 

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
	);

	echo json_encode($game_types);

	// Need this for Ajax return
	die();
}
add_action('wp_ajax_cge_get_game_types', 'cge_get_game_types');

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
add_action('wp_ajax_cge_get_joinable_games', 'cge_get_joinable_games');

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
add_action('wp_ajax_cge_load_game_spec', 'cge_load_game_spec');

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
add_action('wp_ajax_cge_load_deck_spec', 'cge_load_deck_spec');

