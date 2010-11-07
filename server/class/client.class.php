<?php

class client extends user
{
	protected $_socket;
	protected $_pid;
	protected $m_units = array();

	protected static $_units = array();
	protected static $_unitIndex = 0;

    public function __construct(&$socket, $pid)
    {
		parent::__construct();

		$this->_socket = $socket;
		$this->_pid = $pid;
    }

	public function __destruct() {
		foreach($this->m_units as $key){
			unset(self::$_units[$key]);
		}
		console::log('destroying socket: ' . $this->_pid);
	}

	public function getPid(){
		return $this->_pid;
	}

    public function destroy(){
    	unset($this);
    }

    public static function getUnit($id){
    	return self::$_units[$id];
    }

    public function getMemberUnitIds(){
    	return $this->m_units;
    }

    public function createNewUnit($clients){

    	$pid = $this->_pid;

    	$x = ($pid % 2 == 0)?200:100;
    	$y = 200;

    	$data = array('x' => $x, 'y' => $y);

    	$id = self::addNewUnit($pid, $data);
    	$this->m_units[] = $id;

    	$response = array();
		$msg = array('response' => 'sucess', 'pid' => $pid, 'id' => $id, 'command' => 'init', 'text' => 'init new', 'x' => $x, 'y' => $y);
		//$this->sendResponse($msg, $pid);
		$response[] = array('msg' => $msg, 'index' => $pid);


		//send out the existing ids to all the sockets so they are updated with all existing information
		foreach($clients as $new_pid => $client_obj ){
			# master socket changed means there is a new socket request
			$msg = array('response' => 'sucess', 'pid' => $pid, 'id' => $id, 'command' => 'create', 'text' => 'create other objects', 'x' => $x, 'y' => $y);
			//$this->sendResponse($msg);
			$response[] = array('msg' => $msg);
		}
		return $response;
    }

    protected static function addNewUnit($pid, $data){
		self::$_unitIndex++;
		self::$_units[self::$_unitIndex] = new Unit($pid, self::$_unitIndex, $data);

		return self::$_unitIndex;
    }
}

?>