<?php

// Global Configuration for Card Game Engine
define( 'CGENAME', 'Card Game Engine' );
define( 'CGEPATH', plugin_dir_path(__FILE__) );

define( 'CGEGAMEDB', 'cge_game' );
define( 'CGEPLAYERDB', 'cge_player' );
define( 'CGETRANSDB', 'cge_transaction' );

// easily print out arrays/objects for debugging
function print_r_pre($item) {
	echo '<pre>';
	print_r($item);
	echo '</pre>';
}
