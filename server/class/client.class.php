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

    public function update($dt, $action, $clients){
		$id = $action['id'];
		$unit = client::getUnit($id);
		$msg = '';
		if($action['action'] == 'add'){
			$msg = $this->createNewUnit($clients);
		}else if($unit instanceof unit){
			//$unit will be null if the client disconnects
			$unit->update($dt, $action);

			$msg = $unit->getResponse();
		}
		return $msg;
    }

    public function createNewUnit($clients){

    	$pid = $this->_pid;

    	$modulo = ($pid % 2) == 0;

    	$max = 400;

    	$dx = $modulo?50:0;
    	$dy = $modulo?0:50;
    	$base = 20;
    	$x = $base + $dx * self::$_unitIndex;
    	$y = $base + $dy * self::$_unitIndex;

    	if($x > $max){
    		$tx = $x;
	    	$x -= floor($tx / $max)*$max;
	    	console::log('changing ' . $tx . ' to ' . $x. ' with mod ' . ($tx % $max) . ' and calced ' . (($tx % $max)*$max) . ' with max ' . $max);
	    }
	    if($y > $max){
	    	$y -= floor($y / $max)*$max;
	    }


    	$team = $modulo?'light':'dark';

    	$data = array('x' => $x, 'y' => $y, 'team' => $team);

    	$id = self::addNewUnit($pid, $data);
    	$this->m_units[] = $id;



    	$response = array();
		//$msg = array('response' => 'sucess', 'pid' => $pid, 'id' => $id, 'command' => 'init', 'text' => 'init new', 'x' => $x, 'y' => $y);
		//$this->sendResponse($msg, $pid);
		//$response[] = array('msg' => $msg, 'index' => $pid);


		//send out the existing ids to all the sockets so they are updated with all existing information
		foreach($clients as $new_pid => $client_obj ){
			$is_me = ($new_pid == $pid)?1:0;
			# master socket changed means there is a new socket request
			$msg = array();
			$msg['response'] = 'sucess';
			$msg['pid'] = $pid;
			$msg['id'] = $id;
			$msg['command'] = 'create';
			$msg['text'] = 'create new object';
			$msg['x'] = $x;
			$msg['y'] = $y;
			$msg['is_me'] = $is_me;
			$msg['team'] = $team;
			//$this->sendResponse($msg);
			$response[] = array('msg' => $msg, 'index' => $new_pid);
		}
			gameloop::setSendFlag(true);
		return $response;
    }

    protected static function addNewUnit($pid, $data){
		self::$_unitIndex++;
		self::$_units[self::$_unitIndex] = new Unit($pid, self::$_unitIndex, $data);

		return self::$_unitIndex;
    }
}

?>