<?php

// Global Configuration for Card Game Engine
define( 'CGENAME', 'Card Game Engine' );
define( 'CGEURL', '//www2.sleepypenguin.net/cards/cge/server');
define( 'CGEAJAX', CGEURL . '/cge.php');
define( 'CGESSE', CGEURL . '/cge-sse.php');
define( 'CGEPATH', dirname(__FILE__));

define( 'CGEDB', 'card_game_engine' );
define( 'CGEDBUSER', 'cgeuser' );
define( 'CGEDBPWD', 'cgepwd!' );

define( 'CGEGAMEDB', 'cge_game' );
define( 'CGEPLAYERDB', 'cge_player' );
define( 'CGETRANSDB', 'cge_transaction' );
define( 'CGENOTIFDB', 'cge_notification' );

define( 'CGESTARTING', 0 );
define( 'CGEPLAYING', 1 );
define( 'CGEPAUSED', 2 );
define( 'CGEENDING', 3 );

// easily print out arrays/objects for debugging
function print_r_pre($item) {
	echo '<pre>';
	print_r($item);
	echo '</pre>';
}
