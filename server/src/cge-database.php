<?php

// connect to db
global $mysqli;
$mysqli = new mysqli('localhost', CGEDBUSER, CGEDBPWD, CGEDB);

// check connection
if ($mysqli->connect_errno) {
	    die("Connect failed: " . $mysqli->connect_error);
}


/*
Name: cge_db_init
Input: none
Output: false if any tables aren't initialized, otherwise true
Description: create db tables if they don't exist:
	Game: id game_type_id game_name created_by num_players_allowed game_state
	Player: id game_id user_id latest_notif
	Transaction: id game_id user_id from_group_id to_group_id items
	Notification: id game_id user_id table_name trans_id
*/

function cge_db_init() {
	// create game table if it doesn't exist
	global $mysqli;

	$userDbExists = $mysqli->query( 'select 1 from ' . CGEUSERDB );
	if ($userDbExists === false) {
		$createUserDb  = 'create table ' . CGEUSERDB . ' ( ';
		$createUserDb .= 'id int not null auto_increment primary key, ';
		$createUserDb .= 'user_name varchar(50), ';
		$createUserDb .= 'password varchar(50), ';
		$createUserDb .= 'display_name varchar(50), ';
		$createUserDb .= 'email varchar(50), ';
		$createUserDb .= 'active int default 1 ';
		$createUserDb .= ')';

		$userDbCreated = $mysqli->query( $createUserDb );
		if ($userDbCreated === false) {
			return false;
		}
	}

	$gameDbExists = $mysqli->query( 'select 1 from ' . CGEGAMEDB );
	if ($gameDbExists === false) {
		$createGameDb  = 'create table ' . CGEGAMEDB . ' ( ';
		$createGameDb .= 'id int not null auto_increment primary key, ';
		$createGameDb .= 'game_type_id varchar(50), ';
		$createGameDb .= 'game_name varchar(50), ';
		$createGameDb .= 'created_by int not null, ';
		$createGameDb .= 'num_players_allowed int default 0, ';
		$createGameDb .= 'game_state varchar(10) ';
		$createGameDb .= ')';

		$gameDbCreated = $mysqli->query( $createGameDb );
		if ($gameDbCreated === false) {
			return false;
		}
	}

	// create player table if it doesn't exist
	$playerDbExists = $mysqli->query( 'select 1 from ' . CGEPLAYERDB );
	if ($playerDbExists === false) {
		$createPlayerDb = 'create table ' . CGEPLAYERDB . ' ( ';
		$createPlayerDb .= 'id int not null auto_increment primary key, ';
		$createPlayerDb .= 'game_id int, ';
		$createPlayerDb .= 'user_id int, ';
		$createPlayerDb .= 'latest_notif int default 0 ';
		$createPlayerDb .= ')';

		$playerDbCreated = $mysqli->query( $createPlayerDb );
		if ($playerDbCreated === false) {
			return false;
		}
	}

	// create transaction table if it doesn't exist
	$transDbExists = $mysqli->query( 'select 1 from ' . CGETRANSDB );
	if ($transDbExists === false) {
		$createTransDb = 'create table ' . CGETRANSDB . ' ( ';
		$createTransDb .= 'id int not null auto_increment primary key, ';
		$createTransDb .= 'game_id int, ';
		$createTransDb .= 'user_id int, ';
		$createTransDb .= 'from_group_id varchar(50), ';
		$createTransDb .= 'to_group_id varchar(50), ';
		$createTransDb .= 'items text ';
		$createTransDb .= ')';

		$transDbCreated = $mysqli->query( $createTransDb );
		if ($transDbCreated === false) {
			return false;
		}
	}

	// create notification table if it doesn't exist
	$notifDbExists = $mysqli->query( 'select 1 from ' . CGENOTIFDB );
	if ($notifDbExists === false) {
		$createNotifDb = 'create table ' . CGENOTIFDB . ' ( ';
		$createNotifDb .= 'id int not null auto_increment primary key, ';
		$createNotifDb .= 'game_id int, ';
		$createNotifDb .= 'user_id int, ';
		$createNotifDb .= 'table_name varchar(20), ';
		$createNotifDb .= 'trans_id int ';
		$createNotifDb .= ')';

		$notifDbCreated = $mysqli->query( $createNotifDb );
		if ($notifDbCreated === false) {
			return false;
		}
	}
	return true;
}

/*
Name: register_user
Input: username, pasword, display_name, email
Output: user id or false
*/
function register_user($username, $password, $display_name, $email) {
	global $mysqli;

	$result = $mysqli->query( 'select * from ' . CGEUSERDB . ' where user_name = "' . $username . '"');
	if ($result) {
		return true;
	} else {
		$query  = 'insert into ' . CGEUSERDB . ' SET ';
		$query .= 'user_name = "' . $username . '",';
		$query .= 'password = "' . $password . '",';
		$query .= 'display_name = "' . $display_name . '",';
		$query .= 'email = "' . $email . '"';
		$result = $mysqli->query($query);
		if ($result === false) {
			return $result;
		} else {
			$user = login_user($usename, $password);
			return $user;
		}
	}
	
}

/*
Name: login_user
Input: username, pasword
Output: user object or false
*/
function login_user($username, $password) {
	global $mysqli;
	$result = $mysqli->query( 'select * from ' . CGEUSERDB . ' where user_name = "' . $username . '"');
	if ($result) {
		$user = $result->fetch_object();
		return $user;
	} else {
		return $result;
	}
}

/*
Name: get_joinable_games
Input: none
Output: array of joinable games
*/
function get_joinable_games() {
	global $mysqli;
	$result = $mysqli->query( "select * from " . CGEGAMEDB );
	$games = array();
	if ($result) {
		while ($row = $result->fetch_object()) {
			$games[] = $row;
		}
	}
	return $games;

}

function get_my_games( $user_id ) {
	global $mysqli;

	$games = array();
	$result = $mysqli->query( "select distinct game_id from " . CGEPLAYERDB . " where user_id = " . $user_id  );

	if ($result) {
		while ($row = $result->fetch_object()) {
			$games[] = get_game_by_id( $row->game_id );
		}
	}

	return $games;
}

function get_game_by_id( $game_id ) {
	global $mysqli;
	$result = $mysqli->query( "select * from " . CGEGAMEDB . " where id = \"$game_id\"" );
	if ($result) {
		$game = $result->fetch_object();
		if ( $game->id ) {
			return $game;
		} else { 
			return 0;
		}
	}
	return $result;
}

function get_game_by_creator( $game_type_id, $user_id ) {
	global $mysqli;
	$result = $mysqli->query( "select id from " . CGEGAMEDB . " where game_type_id = \"$game_type_id\" and created_by = $user_id" );
	if ($result) {
		$game = $result->fetch_object();
		if ( $game->id ) {
			return $game->id;
		} else { 
			return 0;
		}
	}
	return $result;
}

function get_player_info( $user_id ) {
	global $mysqli;
	$result = $mysqli->query( "select game_id, latest_notif from " . CGEPLAYERDB . " where user_id = $user_id" );
	if ($result) {
		$player_info = $result->fetch_object();
		if ( $player_info->game_id ) {
			return $player_info;
		} else { 
			return 0;
		}
	}
	return $result;
}

function update_player_info( $game_id, $user_id, $notif_id ) {
	global $mysqli;

	// update latest notification
	$query  = 'update ' . CGEPLAYERDB . ' SET ';
	$query .= 'latest_notif = ' . $notif_id;
	$query .= ' where ';
	$query .= 'game_id = ' . $game_id . ' and ';
	$query .= 'user_id = ' . $user_id;
	$success = $mysqli->query($query);

	return $success;
}

function get_player_info_by_id( $trans_id ) {
	global $mysqli;
	$result = $mysqli->query( "select game_id, user_id, latest_notif from " . CGEPLAYERDB . " where id = $trans_id" );
	$player_info = $result->fetch_object();
	if ($result) {
		if ( $player_info->game_id ) {
			return $player_info;
		} else { 
			return 0;
		}
	}
	return $result;
}

function get_players( $game_id ) {
	global $mysqli;
	$players = array();
	$result = $mysqli->query( "select user_id from " . CGEPLAYERDB . " where game_id = " . $game_id );
	if ($result) {
		while ($row = $result->fetch_object()) {
			$players[] = $row->user_id;
		}
	}

	return $players;
}

function create_game( $game_type_id, $game_name, $user_id, $num_players_allowed ) {
	global $mysqli;

	// create game in db
	$query  = 'insert into ' . CGEGAMEDB . ' SET ';
	$query .= 'game_type_id = "' . $game_type_id . '",';
	$query .= 'game_name = "' . $game_name . '",';
	$query .= 'created_by = ' . $user_id . ',';
	$query .= 'num_players_allowed = ' . $num_players_allowed . ',';
	$query .= 'game_state = ' . CGESTARTING;

	$result = $mysqli->query($query);
	if ($result === false) {
		$insert_id = $result;
	} else {
		$insert_id =  $mysqli->insert_id;
	}

	return $insert_id;
}

function join_game( $game_id, $user_id ) {
	global $mysqli;

	$game_ids = array();
	$result = $mysqli->query( "select distinct game_id from " . CGEPLAYERDB . " where user_id = " . $user_id  );
	if ($result) {
		while ($row = $result->fetch_object()) {
			$game_ids[] = $row->game_id;
		}
	}
	if ( in_array( $game_id, $game_ids  ) ) {
		$result = $mysqli->query( "select id from " . CGEPLAYERDB . " where game_id = " . $game_id . " and user_id = " . $user_id  );
		if ($result) {
			$insert_id = $result->fetch_object()->id;
		}
	} else {

		// add player to player table in db
		$query  = 'insert into ' . CGEPLAYERDB . ' SET ';
		$query .= 'game_id = ' . $game_id . ',';
		$query .= 'user_id = ' . $user_id;
		$result = $mysqli->query($query);
		$insert_id =  $mysqli->insert_id;

	}

	return $insert_id;
}

function get_num_players( $game_id ) {
	// get current number of players
	$result = $mysqli->query( "select count(*) from " . CGEGAMEDB . " where game_id = $game_id" );
	if ($result) {
		$row = $result->fetch_all(MYSQLI_NUM);
		$num_players = $row[0];
		return $num_players;
	}
	return $result;
}

function record_transaction( $game_id, $user_id, $from_group_id, $to_group_id, $items ) {
	global $mysqli;
	
	// record transaction in db
	$query  = 'insert into ' . CGETRANSDB . ' SET ';
	$query .= 'game_id = ' . $game_id . ',';
	$query .= 'user_id = ' . $user_id . ',';
	$query .= 'from_group_id = ' . $from_group_id . ',';
	$query .= 'to_group_id = ' . $to_group_id . ',';
	$query .= 'items = "' . $items . '"';
	$result = $mysqli->query($query);
 
	$insert_id = $mysqli->insert_id;
	return $inset_id;
}

function pause_game( $game_id ) {
	global $mysqli;
	
	// mark game as paused
	$query  = 'update ' . CGEGAMEDB . ' SET ';
	$query .= 'game_state = ' . CGEPAUSED;
	$query .= ' where ';
	$query .= 'id = ' . $game_id;
	$success = $mysqli->query($query);

	return $success;
}

function resume_game( $game_id ) {
	global $mysqli;
	
	// mark game as playing
	$query  = 'update ' . CGEGAMEDB . ' SET ';
	$query .= 'game_state = ' . CGEPLAYING;
	$query .= ' where ';
	$query .= 'id = ' . $game_id;
	$success = $mysqli->query($query);

	return $success;
}

function end_game( $game_id ) {
	global $mysqli;
	
	// mark game as ending
	$query  = 'update ' . CGEGAMEDB . ' SET ';
	$query .= 'game_state = ' . CGEENDING;
	$query .= ' where ';
	$query .= 'id = ' . $game_id;
	$success = $mysqli->query($query);

	// @TODO: Inform players game has ended, then delete game info from db
	return $success;
}


function notify( $game_id, $user_id, $table_name, $trans_id ) {
	global $mysqli;
	
	$players = get_players( $game_id );

	// add entry to notification table for each player
	foreach ( $players as $player ) {

		$query  = 'insert into ' . CGENOTIFDB . ' SET ';
		$query .= 'game_id = ' . $game_id . ',';
		$query .= 'user_id = ' . $user_id . ',';
		$query .= 'table_name = "' . $table_name . '",';
		$query .= 'trans_id = ' . $trans_id;
		$result = $mysqli->query($query);
		if ($result) {
			return true;
		} else {
			return $result;
		}
	}
}

function get_transaction( $trans_id ) {
	global $mysqli;
	$result = $mysqli->query( "select * from " . CGETRANSDB . " where id=" . $trans_id );
	if ($result) {
		$trans = $result->fetch_object();
		return $trans;
	} 
	return $result;
}

function get_notifications( $game_id, $notif_id = 0 ) {
	global $mysqli;
	$notifs = array();
	$result = $mysqli->query( "select * from " . CGENOTIFDB . " where game_id=" . $game_id . " and id > " . $notif_id );
	if ($result) {
		while ($row = $result->fetch_object()) {
			$notifs[] = $row;
		}
		return $notifs;
	}
	return $result;
}

