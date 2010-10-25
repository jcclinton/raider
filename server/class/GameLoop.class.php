<?php
class GameLoop{

	protected $_dt = 0;

	protected $_webSocket = null;
	protected $_queue = array();
	protected static $_sendFlag = false;
	protected static $_reset = false;

	protected $__unit = null;

	protected $_users = array();

	const SLEEP_TIME = 10000;
	const MIN_CYCLE_TIME = 0.1;

	public function run(){
		$time_end = microtime(true);
		$this->init();
		while(true){
			if(self::$_reset){
				//$this->init();
			}
			$time_start = microtime(true);
			$this->_dt = $time_start - $time_end;
			$time_end = $time_start;

			$this->getInput();
			$this->update();
			$this->sendResponse();

			if($this->_dt < self::MIN_CYCLE_TIME){
				usleep(self::SLEEP_TIME);
			}
		}
	}

	/**
	*
	* initializes gameloop
	*
	*/

	private function init($new_ws = true){
		$this->_webSocket = new WebSocket();

		$this->__unit = new Unit($this->_webSocket);
		self::$_reset = false;
	}

	public static function reset(){
		self::$_reset = true;
	}

	/**
	*
	* get input from all connected clients
	*
	*/

	private function getInput(){
		$this->_queue = $this->_webSocket->getInput();
	}

	/**
	*
	* run AI, move units, resolve collisions
	*
	*/
	private function update(){
		if(!empty($this->_queue)){
			foreach($this->_queue as $action_array){
				$action = $action_array['action'];
				$id = $action_array['id'];
				$this->__unit->update($this->_dt, $action, $id);
			}
			$this->_queue = array();
		}
	}

	/**
	*
	* sends response to clients
	*
	*/
	private function sendResponse(){
		if(self::shouldSend()){
			//$msg = array('response' => 'sucess', 'text' => 'moving', 'x');
			$msg = $this->__unit->getResponse();
			$this->_webSocket->sendResponse($msg);
			self::setSendFlag(false);
		}
	}


	public static function setSendFlag($flag = true){
		return self::$_sendFlag = $flag;
	}

	protected static function shouldSend(){
		return self::$_sendFlag;
	}
}
?>