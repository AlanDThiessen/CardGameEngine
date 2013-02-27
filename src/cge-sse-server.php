<?php
// send event-stream header to client
header( 'Content-Type: text/event-stream' );
header( 'Cache-Control: no-cache' );

// load wp config so we can access user info
require( '../../../../wp-load.php' );
$user = wp_get_current_user();


//@TODO: poll database for messages and updates

// send events to client
$time = date('r');
echo "event: message\n";
echo "data: The server time is: {$time}\n\n";
flush();
echo "event: userJoined\n";
echo "data: $user->display_name\n\n";
flush();
echo "event: update\n";
echo 'data: ' . json_encode( $user->ID ) . "\n\n";
flush();

