<?php


function cge_db_init() {
	global $wpdb;

	// create game table if it doesn't exist
	$gameDbExists = $wpdb->query( 'select 1 from ' . CGEGAMEDB );
	if ($gameDbExists === false) {
		$createGameDb  = 'create table ' . CGEGAMEDB . ' ( ';
		$createGameDb .= 'id int not null auto_increment primary key, ';
		$createGameDb .= 'game_type_id varchar(50), ';
		$createGameDb .= 'game_name varchar(50), ';
		$createGameDb .= 'created_by int not null, ';
		$createGameDb .= 'num_players_allowed int default 0, ';
		$createGameDb .= 'num_players_joined int default 0 ';
		$createGameDb .= ')';

		$gameDbCreated = $wpdb->query( $createGameDb );
		if ($gameDbCreated === false) {
			return false;
		}
	}

	// create player table if it doesn't exist
	$playerDbExists = $wpdb->query( 'select 1 from ' . CGEPLAYERDB );
	if ($playerDbExists === false) {
		$createPlayerDb = 'create table ' . CGEPLAYERDB . ' ( ';
		$createPlayerDb .= 'id int not null auto_increment primary key, ';
		$createPlayerDb .= 'game_id int, ';
		$createPlayerDb .= 'user_id int ';
		$createPlayerDb .= ')';

		$playerDbCreated = $wpdb->query( $createPlayerDb );
		if ($playerDbCreated === false) {
			return false;
		}
	}

	// create transaction table if it doesn't exist
	$transDbExists = $wpdb->query( 'select 1 from ' . CGETRANSDB );
	if ($transDbExists === false) {
		$createTransDb = 'create table ' . CGETRANSDB . ' ( ';
		$createTransDb .= 'id int not null auto_increment primary key, ';
		$createTransDb .= 'game_id int, ';
		$createTransDb .= 'user_id int, ';
		$createTransDb .= 'from_group_id varchar(50), ';
		$createTransDb .= 'to_group_id varchar(50), ';
		$createTransDb .= 'items text ';
		$createTransDb .= ')';

		$transDbCreated = $wpdb->query( $createTransDb );
		if ($transDbCreated === false) {
			return false;
		}
	}
}

function get_joinable_games() {
	global $wpdb;
	$games = $wpdb->get_results( "select * from " . CGEGAMEDB );
	return $games;
}

function get_game_by_id( $game_id ) {
	global $wpdb;
	$game = $wpdb->get_row( "select * from " . CGEGAMEDB . " where id = \"$game_id\"" );
	if ( $game->id ) {
		return $game;
	} else { 
		return 0;
	}
}

function get_game_by_user( $game_type_id, $user_id ) {
	global $wpdb;
	$game = $wpdb->get_row( "select id from " . CGEGAMEDB . " where game_type_id = \"$game_type_id\" and created_by = $user_id" );
	if ( $game->id ) {
		return $game->id;
	} else { 
		return 0;
	}
}

function create_game( $game_type_id, $game_name, $user_id, $num_players_allowed ) {
	global $wpdb;

	// create game in db
	$wpdb->insert(
		CGEGAMEDB,
		array(
			'game_type_id' => (string)$game_type_id,
			'game_name' => (string)$game_name,
			'created_by' => (int)$user_id,
			'num_players_allowed' => (int)$num_players_allowed,
		),
		array(
			'%s',
			'%s',
			'%d',
			'%d'
		)
	);

	return $wpdb->insert_id;
}

function join_game( $game_id, $user_id ) {
	global $wpdb;

	$wpdb->query( "start transaction;" );

	// add player to player table in db
	$wpdb->insert(
		CGEPLAYERDB,
		array(
			'game_id' => (string)$game_id,
			'user_id' => (int)$user_id
		),
		array(
			'%d',
			'%d',
		)
	);
	$insert_id =  $wpdb->insert_id;

	// get current number of players
	$num_players = $wpdb->get_var( "select num_players_joined from " . CGEGAMEDB . " where id = $game_id" );
	
	// update number of players in db
	$wpdb->update(
		CGEGAMEDB,
		array(
			'num_players_joined' => (int) ++$num_players
		),
		array( 
			'id' => (int)$game_id 
		),
		array(
			'%d'
		),
		array(
			'%d'
		)
	);

	$wpdb->query( "commit;" );

	return $insert_id;
}

