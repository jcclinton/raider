<?php
class GameLoop{

	protected $_dt = 0;

	protected $_webSocket = null;
	protected $_queue = array();
	protected $_sendFlag = false;

	const SLEEP_TIME = 10000;
	const MIN_CYCLE_TIME = 0.1;

	public function run(){
		$time_end = microtime(true);
		$this->init();
		while(true){
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

	private function init(){
		$this->_webSocket = new WebSocket();
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
	}

	/**
	*
	* sends response to clients
	*
	*/
	private function sendResponse(){
		if($this->shouldSend()){
			$msg = array('response' => 'sucess', 'text' => 'moving');
			$this->_webSocket->sendResponse($msg);
		}
	}


	protected function setSendFlag($flag = true){
		return $this->_sendFlag = $flag;
	}

	protected function shouldSend(){
		return $this->_sendFlag;
	}
}
?>