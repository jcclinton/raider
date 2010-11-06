<?php

//define('LOCAL', TRUE);
define('LOCAL', FALSE);

if(LOCAL){
	define('BASE_PATH', 'D:\xampp\xampplite\htdocs\php2d');
	define('AUTOLOADER_PATH', BASE_PATH . '\server\class');
	define('BASE_URL', 'http://localhost/php2d');
}else{
	define('BASE_PATH', '/home/public_html/65.49.73.225/public');
	define('AUTOLOADER_PATH', BASE_PATH . '/server/class');
	define('BASE_URL', 'http://65.49.73.225');
}

require BASE_PATH . '/server/autoloader.php';

autoloader::init();

?>