<?php
class gameloop extends websocket{

	protected $_dt = 0;

	protected $_queue = array();
	protected static $_sendFlag = false;
	protected static $_reset = false;

	const SLEEP_TIME = 10000;
	const MIN_CYCLE_TIME = 0.1;


	public function __construct()
	{
		parent::__construct();
	}

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

			$this->update();

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

	private function init(){
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
		$action_array = $this->getInput();
		if(!empty($action_array)){
			foreach($action_array as $action){
				//$action = $action_array['action'];
				$action = json_decode($action, true);
				$id = $action['id'];
				$unit = client::getUnit($id);

				//$unit will be null if the client disconnects
				if($unit instanceof unit){
					$unit->update($this->_dt, $action);
				}

				if(self::shouldSend()){
					$msg = $unit->getResponse();
					$this->sendResponse($msg);
					self::setSendFlag(false);
				}
			}
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