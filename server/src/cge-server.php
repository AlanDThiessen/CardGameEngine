<?php

// functions loaded by main plugin code via add_action & add_shortcode

require('cge-config.php');
require('cge-database.php');

function cge_register_user() {
	$username = htmlspecialchars( $_POST[ 'username' ] );
	$password = htmlspecialchars( $_POST[ 'password' ] );
	$display_name = htmlspecialchars( $_POST[ 'display_name' ] );
	$email = htmlspecialchars( $_POST[ 'email' ] );
	$user = register_user($username, $password, $display_name, $email);
	if ($user === true) {
		$userResponse = array(
			'cge_error_id' => '001',
			'cge_error' => 'User ' . $username . ' already exists.'
		);
	} elseif ($user === false) {
		$userResponse = array(
			'cge_error_id' => '002',
			'cge_error' => 'Database error.'
		);
	} else {
		$userResponse = array(
			'id' => $user->id,
			'username' => $user->user_name,
			'display_name' => $user->display_name,
			'email' => $user->email
		);
	}
	echo json_encode($userResponse);

	// Need this for Ajax return
	die();
}

function cge_login_user() {
	$username = htmlspecialchars( $_POST[ 'username' ] );
	$password = htmlspecialchars( $_POST[ 'password' ] );
	$user = login_user($username, $password);
	if ($user === false) {
		$userResponse = array(
			'cge_error_id' => '002',
			'cge_error' => 'Database error.'
		);
	} else {
		$userResponse = array(
			'id' => $user->id,
			'username' => $user->user_name,
			'display_name' => $user->display_name,
			'email' => $user->email
		);
	}
	echo json_encode($userResponse);
	// Need this for Ajax return
	die();
}

function cge_get_game_types() {
	$game_types = array();
	$xml_files = scandir( CGEPATH . '/../xml/games' );
	foreach ( $xml_files as $xml_file ) {
		if ( substr( $xml_file, -8, 8 ) == 'game.xml' ) {
			$game_spec = simplexml_load_file( CGEPATH . '/../xml/games/' . $xml_file );
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
	$user_id = htmlspecialchars( $_POST[ 'user_id' ] );
	$joinable_games = array();
	$games = get_joinable_games();

	foreach ( $games as $game ) {
		$players = get_players( $game->id );
		if ( !in_array( $user_id, $players ) ) {
			$joinable_games[] = $game;
		}
	}

	echo json_encode($joinable_games);

	// Need this for Ajax return
	die();
}

function cge_get_my_games() {

	$user_id = htmlspecialchars( $_POST[ 'user_id' ] );
	$my_games = get_my_games( $user_id );

	echo json_encode($my_games);

	// Need this for Ajax return
	die();
}

function cge_start_game() {
	$game_type_id = htmlspecialchars( $_POST[ 'game_type_id' ] );
	$user_id = htmlspecialchars( $_POST[ 'user_id' ] );

	$gameFile = CGEPATH . '/../xml/games/' . $game_type_id . '-game.xml';
	if (!file_exists($gameFile)) {
		die('CGE ERROR: ' . $game_type_id . ' definition file not found.');
	} 
	$game_spec = simplexml_load_file($gameFile);
	if ( $game_spec[ 'id' ] != $game_type_id ) {
		die('CGE ERROR: Definition file found is for ' . $game_spec[ 'id' ] . ', not for ' . $game_type_id );
	}

	// check whether this user already has a game of this type, 
	//$game_id = get_game_by_creator( $game_type_id, $user_id );

	//if ( $game_id ) {
		// @TODO: verify with user to reusue or delete this game?
		//$success = 0;
	//} else {
		//$game_name = $game_spec->name . ' created by ' . $user->display_name;
		$game_name = $game_spec->name . ' created by FIXME';

		// create game in db
		$game_id = create_game( $game_type_id, $game_name, $user_id, $game_spec->required->maxPlayers );

		// add first user to game
		$success = join_game( $game_id, $user_id );
	//}

	if ($success) {
		notify( $game_id, $user_id, CGEGAMEDB, $game_id );
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
	$user_id = htmlspecialchars( $_POST[ 'user_id' ] );

	$game = get_game_by_id( $game_id );
	if (!$game) {
		die('CGE ERROR: ' . $game_id . ' not found.');
	}

	// load game definition file
	$game_type_id = $game->game_type_id;
	$gameFile = CGEPATH . '/../xml/games/' . $game_type_id . '-game.xml';
	if (!file_exists($gameFile)) {
		die('CGE ERROR: ' . $game_type_id . ' definition file not found.');
	} 
	$game_spec = simplexml_load_file($gameFile);
	if ( $game_spec[ 'id' ] != $game_type_id ) {
		die('CGE ERROR: Definition file found is for ' . $game_spec[ 'id' ] . ', not for ' . $game_type_id );
	}

	// add user to game; sse-server will notify players of change
	$success = join_game( $game_id, $user_id );
	
	if ($success) {
		notify( $game_id, $user_id, CGEGAMEDB, $game_id );
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

function cge_get_num_players() {
	$game_id = htmlspecialchars( $_POST[ 'game_id' ] );
	$return_value = get_num_players( $game_id );

	echo json_encode($return_value);

	// Need this for Ajax return
	die();
}

function cge_load_deck_spec() {
	$deckType = htmlspecialchars( $_POST[ 'deck_type' ] );
	$deckFile = CGEPATH . '/../xml/decks/' . $deckType . '-deck.xml';
	if (!file_exists($deckFile)) {
		$deckSpec = array(
			'cge_error_id' => '003',
			'cge_error' => 'Deck ' . $deckType . ' definition file not found.'
		);
	}
	else {
   	$deckSpec = simplexml_load_file($deckFile);
	}

	echo json_encode($deckSpec);

	// Need this for Ajax return
	die();
}

function cge_record_transaction() {

	$game_id = htmlspecialchars( $_POST[ 'game_id' ] );
	$user_id = htmlspecialchars( $_POST[ 'user_id' ] );
	$from_group_id = htmlspecialchars( $_POST[ 'from_group_id' ] );
	$to_group_id = htmlspecialchars( $_POST[ 'to_group_id' ] );
	$items = htmlspecialchars( $_POST[ 'items' ] );

	$success = record_transaction( $game_id, $user_id, $from_group_id, $to_group_id, $items );

	if ( $success > 0 ) {
		notify( $game_id, $user_id, CGETRANSDB, $success );
	}

	$return_value = array(
		'success' => $success
	);
	echo json_encode($return_value);

	// Need this for Ajax return
	die();
}

function cge_pause_game() {

	$game_id = htmlspecialchars( $_POST[ 'game_id' ] );
	$user_id = htmlspecialchars( $_POST[ 'user_id' ] );
	$success = pause_game( $game_id );

	if ( $success > 0 ) {
		notify( $game_id, $user_id, CGEGAMEDB, $game_id );
	}

	$return_value = array(
		'success' => $success
	);
	echo json_encode($return_value);

	// Need this for Ajax return
	die();
}

function cge_resume_game() {

	$game_id = htmlspecialchars( $_POST[ 'game_id' ] );
	$user_id = htmlspecialchars( $_POST[ 'user_id' ] );
	$success = resume_game( $game_id );

	if ($success > 0) {
		notify( $game_id, $user_id, CGEGAMEDB, $game_id );
	}

	$return_value = array(
		'success' => $success
	);
	echo json_encode($return_value);

	// Need this for Ajax return
	die();
}

function cge_end_game() {
 
	$game_id = htmlspecialchars( $_POST[ 'game_id' ] );
	$user_id = htmlspecialchars( $_POST[ 'user_id' ] );
	$success = end_game( $game_id );

	if ($success > 0) {
		notify( $game_id, $user_id, CGEGAMEDB, $game_id );
	}

	$return_value = array(
		'success' => $success
	);
	echo json_encode($return_value);

	// Need this for Ajax return
	die();
}

function cge_ack_event() {
	$game_id = htmlspecialchars( $_POST[ 'game_id' ] );
	$user_id = htmlspecialchars( $_POST[ 'user_id' ] );
	$notif_id = htmlspecialchars( $_POST[ 'notif_id' ] );

	//error_log($game_id . ':' . $notif_id);
	$success = update_player_info( $game_id, $user_id, $notif_id );

	$return_value = array(
		'success' => $success
	);
	echo json_encode($return_value);

	// Need this for Ajax return
	die();
}

