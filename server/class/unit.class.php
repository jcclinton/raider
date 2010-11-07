<?php

class unit
{

	private $unit = array();

	protected $_pid;
	protected $_id;

	public function __construct($pid, $id, $data)
	{
		$unit = array();
		$unit['speed'] = 250; //pixels per second
		$unit['x'] = $data['x'];
		$unit['y'] = $data['y'];
		$unit['dx'] = null;
		$unit['dy'] = null;
		$unit['status'] = 'stopped';
		$unit['command'] = 'stop';

		$this->unit = $unit;

		$this->_pid = $pid;
		$this->_id = $id;
	}

	public function getX(){
		return $this->unit['x'];
	}

	public function getY(){
		return $this->unit['y'];
	}

	public function update($dt, $data = null){
		if(!empty($data)){
			if(method_exists($this, $data['action'])){
				$this->$data['action']($data['x'], $data['y']);
				gameloop::setSendFlag(true);
			}else{
				console::log('*****    method: '.$data['action'].' does not exist   *****');
			}
		}

		//$this->updatePosition($dt);
	}

	public function getResponse(){
		$msg = array('response' => 'sucess', 'command'=>$this->unit['command'], 'text' => $this->unit['status'], 'x'=>$this->unit['dx'], 'y'=>$this->unit['dy'], 'pid' => $this->_pid, 'id' => $this->_id);
		return $msg;
	}

	/*protected function updatePosition($dt){
		if(!is_null($this->unit['dx'] ) || !is_null($this->unit['dy'])){
			$diffx = $this->unit['dx'] - $this->unit['x'];
			$diffy = $this->unit['dy'] - $this->unit['y'];
					console::log('diffs: '.$diffx . ', '.$diffy);

			if(($diffx == 0 && $diffy == 0) || ($this->unit['x'] < 20 || $this->unit['y'] < 20 || $this->unit['x'] > 380 || $this->unit['y'] > 380)){
				$this->unit['dx'] = null;
				$this->unit['dy'] = null;
				console::log('not moving');
			}else if(abs($diffx) < 1 && abs($diffy) < 1){
				$this->unit['x'] = $this->unit['dx'];
				$this->unit['y'] = $this->unit['dy'];
				console::log('snapping shut');
			}else{
				$denom = sqrt(pow($diffx,2) + pow($diffy,2));
				$sign = (($diffx < 0 && $diffy >= 0) || ($diffx >= 0 && $diffy < 0))?1:-1;
				$rads = asin($diffy/$denom);

					console::log('currently at: '.$this->unit['x'].','.$this->unit['y']);
				$this->unit['x'] += $this->unit['speed'] * $dt * cos($rads);
				$this->unit['y'] += $this->unit['speed'] * $dt * sin($rads);
				console::log('moving with speed: '.$this->unit['speed'] . ' and dt: '.$dt . ' and cos,sin: '.cos($rads) . ', '. sin($rads) . ' and denom/rads: ' . $denom . ', ' . $rads );
					console::log('now at: '.$this->unit['x'].','.$this->unit['y']);
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
	}*/






	protected function move($x, $y){
		$this->unit['dx'] = $x;
		$this->unit['dy'] = $y;
		$this->unit['status'] = 'moving';
		$this->unit['command'] = 'move';
		console::log('currently at: '.$this->unit['x'].','.$this->unit['y'].'. going to '.$this->unit['dx'] . ', '.$this->unit['dy']);
	}

	protected function arrived($x, $y){
		$this->unit['x'] = $x;
		$this->unit['y'] = $y;
		$this->unit['dx'] = null;
		$this->unit['dy'] = null;
		$this->unit['status'] = 'stopped';
		$this->unit['command'] = 'stop';
		console::log('arrived at: '.$this->unit['x'].','.$this->unit['y']);
	}
}

?>