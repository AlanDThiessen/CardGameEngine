<?php
/*
Plugin Name: Card Game Engine
Plugin URI: http://github.com/thesleepypenguin/card-game-engine
Description: A plugin to allow users to play card games
Version: 0.1
Author: Alan Thiessen, David Doughty, Jordan Goulder
License: Probably will be GPL2 at some point
*/

if ( !function_exists( 'add_action' ) ) {
        echo "Can't call this directly; it's a plugin.";
        exit;
}

require('src/cge-server.php');

add_shortcode( 'cge_launch_link', 'cge_show_launch_link' );
add_action( 'wp_enqueue_scripts', 'cge_enqueue_css' ); 
add_action( 'wp_enqueue_scripts', 'cge_enqueue_js' ); 
add_action('wp_ajax_cge_get_user', 'cge_get_user');
add_action('wp_ajax_cge_get_game_types', 'cge_get_game_types');
add_action('wp_ajax_cge_get_joinable_games', 'cge_get_joinable_games');
add_action('wp_ajax_cge_load_game_spec', 'cge_load_game_spec');
add_action('wp_ajax_cge_load_game_spec_from_id', 'cge_load_game_spec_from_id');
add_action('wp_ajax_cge_load_deck_spec', 'cge_load_deck_spec');


// functions and filters to use local email for admin emails
function use_local_email(){
	  return 'wp-admin@sleepypenguin.net';
}
add_filter( 'wp_mail_from', 'use_local_email' );

function use_local_email_name(){
	  return 'CGE Admin';
}
add_filter( 'wp_mail_from_name', 'use_local_email_name' );
