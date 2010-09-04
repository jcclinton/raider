<?php
/**
 * WebSocketTrigger class of phpWebSockets
 *
 * In this class you can define a method for every recieved command.
 * The returned string of the function will be send to the client.
 *
 * @author Moritz Wutz <moritzwutz@gmail.com>
 * @version 0.1
 * @package phpWebSockets
 */

class socketWebSocketTrigger extends socketWebSocket
{
		function run($action){
			if( method_exists('socketWebSocketTrigger',$action) ){
				$msg = array('response' => 'sucess', 'text' => socketWebSocketTrigger::$action());
				$retval = json_encode($msg);
				$this->console('executing '.$action);
			}else{
				$msg = array('response' => 'cannot find', 'text'=> 'blank');
				$retval = json_encode($msg);
				$this->console('cannot find: '.$action);
			}
			
			return $retval;
		}
		
		function move(){
			
		}
		
		function hello()
		{
			$a = 'hello, how are you?';
			return $a;
		}
		
		function hi()
		{
			$a = 'hi there';
			return $a;
		}	
		
		function name()
		{
			$a = 'my name is Mr. Bot';
			return $a;
		}	
		
		function today()
		{
			return date('Y-m-d');
		}	
		
		function age()
		{
			return "Oh dear, I'm 152";
		}			

}

?>