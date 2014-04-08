<?php

require('../src/cge-config.php');
require(CGEPATH . '/cge-database.php');

show_launch_link();

function show_launch_link() {

	echo '<html>
	<head><script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script></head>
	<body>';

	echo '<div id="cge">';
	echo '<div id="content">';
	echo '<div id="welcome">';
	echo 'Welcome to the ' . CGENAME;

	$userID = 3;;
	// Stop here if the user isn't logged in.
	if (!$userID) {
		echo '!  Please <a href="' . CGEPATH . '../webclient/login.php">log in</a> to play.';
		echo '</div>';
	} else {
		// OK, they're logged in, now make sure the database is initialized
		$dbinit = cge_db_init();
		if ($dbinit === false) {
			echo '. <div class="error">Unable to create database.</div>';
		} else {
			// now greet user by name and show launch link
			echo ', user #' . $userID . '!';
			echo '</div>';
			echo '<input type="hidden" id="sse-server" value="' . CGESSE . '" />';
			echo '<input type="hidden" id="ajaxUrl" value="' . CGEAJAX . '" />';
			echo '<script type="text/javascript" src="cge_client.js"></script>';
			echo '<div id="result">';
			echo '</div>';
			echo '<div id="cge_display">';
			echo '<div id="cge_header">';
			echo '	<div id="gameTypes"></div>';
			echo '	<div id="joinable"></div>';
			echo '	<div id="myGames"></div>';
			echo '</div>';
			echo '<div id="cge_window"></div>';
			echo '<div id="cge_footer"></div>';
			echo '</div>';
		}
	}
	echo '</div>';
	echo '</div>';
	echo '</body>';
	echo '</html>';
}

