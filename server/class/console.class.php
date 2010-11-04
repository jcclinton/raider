<?php
/**
 * debugging console
 *
 * @author Jamie Clinton
 * @version 0.1
 * @package phpWebSockets
 */

class Console
{

	/**
	 * Log a message
	 * @param string $msg The message
	 * @param string $type The type of the message
	 */
	public static function log($msg, $type = 'WebSocket'){
		$msg = explode("\n",$msg);
		foreach( $msg as $line ){
			echo date('Y-m-d H:i:s') . " {$type}: {$line}\n";
		}
	}
}