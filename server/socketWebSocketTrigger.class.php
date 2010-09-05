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
			$data = json_decode($action, true);
			$action = isset($data['action'])?$data['action']:$action;
			//$this->console(print_r($action, true));
			if( method_exists('socketWebSocketTrigger',$action) ){
				$msg = array('response' => 'sucess', 'text' => socketWebSocketTrigger::$action($data));
				$retval = json_encode($msg);
				$this->console('executing '.$action);
			}else{
				$msg = array('response' => 'cannot find', 'text'=> 'blank');
				$retval = json_encode($msg);
				$this->console('cannot find: '.$action);
			}
			
			return $retval;
		}
		
		function move($data){
			$retval = array('action'=>'move');
			if(isset($data['x']))
				$retval['x'] = $data['x'];
			if(isset($data['y']))
				$retval['y'] = $data['y'];
			return $retval;
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