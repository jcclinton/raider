<?php

//define('LOCAL', TRUE);
define('LOCAL', FALSE);

if(LOCAL){
	define('BASE_PATH', 'D:\xampp\xampplite\htdocs\php2d');
	define('AUTOLOADER_PATH', BASE_PATH . '\server\class');
	define('IP_ADDRESS', 'localhost');
	define('BASE_URL', 'http://'.IP_ADDRESS.'/php2d');
}else{
	define('BASE_PATH', '/home/public_html/65.49.73.225/public');
	define('AUTOLOADER_PATH', BASE_PATH . '/server/class');
	define('IP_ADDRESS', '65.49.73.225');
	define('BASE_URL', 'http://'.IP_ADDRESS);
}

define('PORT', 8000);

require BASE_PATH . '/server/autoloader.php';

autoloader::init();

?>