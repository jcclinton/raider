<?php

class Unit extends User
{

	private $unit = array();
	private $websocket = null;

	public function __construct(&$websocket)
	{
		parent::__construct();

		$this->websocket = $websocket;
		$this->init();
	}

	public function init(){
		$unit = array();
		$unit['speed'] = 250; //pixels per second
		$unit['x'] = 200;
		$unit['y'] = 200;
		$unit['dx'] = null;
		$unit['dy'] = null;
		$unit['status'] = 'stopped';
		$this->unit = $unit;
	}

	protected function console($msg){
		$this->websocket->console($msg);
	}

	public function update($dt, $action = null){
		if($action){
			$data = json_decode($action, true);
			if(method_exists($this, $data['action'])){
				$this->$data['action']($data['x'], $data['y']);
				GameLoop::setSendFlag(true);
			}else{
				$this->console('method: '.$data['action'].' does not exist');
			}



			/*if($data['action'] == 'move' && isset($data['x']) && isset($data['y'])){
				$this->unit['dx'] = $data['x'];
				$this->unit['dy'] = $data['y'];
				$this->console('currently at: '.$this->unit['x'].','.$this->unit['y'].'. going to '.$this->unit['dx'] . ', '.$this->unit['dy']);
			}*/
		}

		//$this->updatePosition($dt);
	}

	public function getResponse(){
		$msg = array('response' => 'sucess', 'text' => $this->unit['status'], 'x'=>$this->unit['dx'], 'y'=>$this->unit['dy']);
		return $msg;
	}

	protected function updatePosition($dt){
		if(!is_null($this->unit['dx'] ) || !is_null($this->unit['dy'])){
			$diffx = $this->unit['dx'] - $this->unit['x'];
			$diffy = $this->unit['dy'] - $this->unit['y'];
					$this->console('diffs: '.$diffx . ', '.$diffy);

			if(($diffx == 0 && $diffy == 0) || ($this->unit['x'] < 20 || $this->unit['y'] < 20 || $this->unit['x'] > 380 || $this->unit['y'] > 380)){
				$this->unit['dx'] = null;
				$this->unit['dy'] = null;
				$this->console('not moving');
			}else if(abs($diffx) < 1 && abs($diffy) < 1){
				$this->unit['x'] = $this->unit['dx'];
				$this->unit['y'] = $this->unit['dy'];
				$this->console('snapping shut');
			}else{
				$denom = sqrt(pow($diffx,2) + pow($diffy,2));
				$sign = (($diffx < 0 && $diffy >= 0) || ($diffx >= 0 && $diffy < 0))?1:-1;
				$rads = asin($diffy/$denom);

					$this->console('currently at: '.$this->unit['x'].','.$this->unit['y']);
				$this->unit['x'] += $this->unit['speed'] * $dt * cos($rads);
				$this->unit['y'] += $this->unit['speed'] * $dt * sin($rads);
				$this->console('moving with speed: '.$this->unit['speed'] . ' and dt: '.$dt . ' and cos,sin: '.cos($rads) . ', '. sin($rads) . ' and denom/rads: ' . $denom . ', ' . $rads );
					$this->console('now at: '.$this->unit['x'].','.$this->unit['y']);
			}

			if($this->unit['status'] != 'moving'){
				$this->unit['status'] = 'moving';
			}

		}else{
			if($this->unit['status'] == 'moving'){
				$this->unit['status'] = 'stopped';
			}
		}


		if($this->unit['status'] == 'moving'){
			//GameLoop::setSendFlag(true);
		}else{
		GameLoop::setSendFlag(false);
		}
	}






	protected function move($x, $y){
		$this->unit['dx'] = $x;
		$this->unit['dy'] = $y;
		$this->unit['status'] = 'moving';
		$this->console('currently at: '.$this->unit['x'].','.$this->unit['y'].'. going to '.$this->unit['dx'] . ', '.$this->unit['dy']);
	}

	protected function arrived($x, $y){
		$this->unit['x'] = $x;
		$this->unit['y'] = $y;
		$this->unit['dx'] = null;
		$this->unit['dy'] = null;
		$this->unit['status'] = 'stopped';
		$this->console('arrived at: '.$this->unit['x'].','.$this->unit['y']);
	}
}

?>