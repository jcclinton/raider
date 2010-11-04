<?php
class GameLoop extends WebSocket{

	protected $_dt = 0;

	protected $_queue = array();
	protected static $_sendFlag = false;
	protected static $_reset = false;

	//protected $__unit = null;

	protected $_users = array();

	const SLEEP_TIME = 10000;
	const MIN_CYCLE_TIME = 0.1;

	public function run(){
		$time_end = microtime(true);
		$this->init();
		$delay = 1;
		while(true){
			if(self::$_reset){
				//$this->init();
			}
			$time_start = microtime(true);
			$this->_dt = $time_start - $time_end;
			$time_end = $time_start;

			$this->_queue = $this->getInput();
			$this->update();

			if(self::shouldSend()){

				$msg = $this->__unit->getResponse();
				$this->sendResponse($msg);
				self::setSendFlag(false);
			}

			if($this->_dt < self::MIN_CYCLE_TIME){
				usleep(self::SLEEP_TIME*$delay);
			}
		}
	}

	/**
	*
	* initializes gameloop
	*
	*/

	private function init($new_ws = true){
		$this->__unit = new Unit();
		self::$_reset = false;
	}

	public static function reset(){
		self::$_reset = true;
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


	public static function setSendFlag($flag = true){
		return self::$_sendFlag = $flag;
	}

	protected static function shouldSend(){
		return self::$_sendFlag;
	}
}
?>