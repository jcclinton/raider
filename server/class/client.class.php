<?php

class client extends user
{
	protected $_socket;
	protected $_id;

	protected static $units = array();

    public function __construct(&$socket, $id)
    {
		parent::__construct();

		$this->_socket = $socket;
		$this->_id = $id;

		self::$units[$id] = new Unit($id);
    }

	public function __destruct() {
		unset(self::$units[$this->_id]);
		console::log('destroying socket: ' . $this->_id);
	}

	public function getId(){
		return $this->_id;
	}

    public function destroy(){
    	unset($this);
    }

    public static function getUnit($id){
    	return self::$units[$id];
    }

    public function createNewUnit($clients){
    	$socket_index = $this->_id;
    	$response = array();
		$msg = array('response' => 'sucess', 'id' => $socket_index, 'command' => 'init', 'text' => 'id received', 'x' => 200, 'y' => 200);
		//$this->sendResponse($msg, $socket_index);
		$response[] = array('msg' => $msg, 'index' => $socket_index);


		//send out the existing ids to all the sockets so they are updated with all existing information
		foreach($clients as $new_socket_index => $client_obj ){
			# master socket changed means there is a new socket request
			$msg = array('response' => 'sucess', 'id' => $new_socket_index, 'command' => 'create', 'text' => 'send other objects', 'x' => 200, 'y' => 200);
			//$this->sendResponse($msg);
			$response[] = array('msg' => $msg);
		}
		return $response;
    }
}

?>