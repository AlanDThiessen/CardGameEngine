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

define( 'CGEUSERDB', 'cge_users' );
define( 'CGEGAMEDB', 'cge_games' );
define( 'CGEPLAYERDB', 'cge_players' );
define( 'CGETRANSDB', 'cge_transactions' );
define( 'CGENOTIFDB', 'cge_notifications' );

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
