<?php

require('src/cge-server.php');

$ajax_functions = array(
	'cge_login_user',
	'cge_get_game_types',
	'cge_get_joinable_games',
	'cge_get_my_games',
	'cge_start_game',
	'cge_join_game',
	'cge_get_num_players',
	'cge_load_deck_spec',
	'cge_record_transaction',
	'cge_pause_game',
	'cge_resume_game',
	'cge_end_game',
	'cge_ack_event',
);

$action =  htmlspecialchars( $_POST[ 'action' ] );

if (in_array($action, $ajax_functions)) {
	$action();
}

die();
