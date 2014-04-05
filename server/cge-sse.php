<?php
// send event-stream header to client
header( 'Content-Type: text/event-stream' );
header( 'Cache-Control: no-cache' );

// load wp config so we can access user info
require( '../../../../wp-load.php' );
include_once( 'cge-database.php' );

$user = wp_get_current_user();
$player_info = get_player_info( $user->ID );

if ( $player_info === 0 ) {
	exit;
}

$notifs = get_notifications( $player_info->game_id, $player_info->latest_notif );

foreach ( $notifs as $notif ) {
	$event_type = '';
	$data = '';
	switch ( $notif->table_name ) {
		case CGETRANSDB:
			$event_type = 'transaction';
			$data = get_transaction( $notif->trans_id );
			break;
		case CGEPLAYERDB:
			$player_info = get_player_info_by_id( $notif->trans_id );
			if ( $player_info->user_id != 0 ) {
				$event_type = 'playerJoined';
				$data = $player_info->user_id;
			}
			break;
		case CGEGAMEDB:
			$event_type = 'gameState';
			$data = get_game_by_id( $notif->trans_id );
			break;
	}

	if (isset($event_type)) {
		$data->notif_id = $notif->id;
		//error_log($event_type . '::' . $data->notif_id);
		echo "event: " . $event_type . "\n";
		echo "data: " . json_encode( $data ) . "\n\n";
		flush();
	}
}

