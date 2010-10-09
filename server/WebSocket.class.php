<?php
/**
 * WebSocket extension class of phpWebSockets
 *
 * @author Moritz Wutz <moritzwutz@gmail.com>
 * @version 0.1
 * @package phpWebSockets
 */

class WebSocket extends socket
{
	private $clients = array();
	private $handshakes = array();

	//private $unit = array();
	private $queue = array();

	//private $dt = 0;

	public function __construct()
	{
		parent::__construct();

		//$this->run();
	}

	/**
	 * Runs the while loop, wait for connections and handle them
	 */
	/*private function run()
	{
		$time_end = microtime(true);
		$this->init();
		while(true)
		{
			$time_start = microtime(true);
			$this->dt = $time_start - $time_end;
			$time_end = $time_start;

			$this->getInput();
			$this->update();
			$this->sendResponse();
			if($this->dt < .1){
				usleep(10000);
			}
		}// end game loop
	}*/

	/*private function init(){
		$unit = array();
		$unit['speed'] = 250; //pixels per second
		$unit['x'] = 200;
		$unit['y'] = 200;
		$unit['dx'] = null;
		$unit['dy'] = null;
		$unit['status'] = 'stopped';
		$this->unit = $unit;

		$this->queue = array();
	}*/

	public function getInput(){

		$queue = array();

		# because socket_select gets the sockets it should watch from $changed_sockets
		# and writes the changed sockets to that array we have to copy the allsocket array
		# to keep our connected sockets list
		$changed_sockets = $this->allsockets;

		# blocks execution if timeout is set to null
		$num_sockets = socket_select($changed_sockets,$write=NULL,$exceptions=NULL, $timeout = 0);

		# foreach changed socket...
		foreach( $changed_sockets as $socket )
		{
			# master socket changed means there is a new socket request
			if( $socket==$this->master )
			{
				# if accepting new socket fails
				if( ($client=socket_accept($this->master)) < 0 )
				{
					console('socket_accept() failed: reason: ' . socket_strerror(socket_last_error($client)));
					continue;
				}
				# if it is successful push the client to the allsockets array
				else
				{
					$this->allsockets[] = $client;

					# using array key from allsockets array, is that ok?
					# i want to avoid the often array_search calls
					$socket_index = array_search($client,$this->allsockets);
					$this->clients[$socket_index] = new stdClass;
					$this->clients[$socket_index]->socket_id = $client;

					$this->console($client . ' CONNECTED!');
				}
			}
			# client socket has sent data
			else
			{
				$socket_index = array_search($socket,$this->allsockets);

				# the client status changed, but theres no data ---> disconnect
				$bytes = @socket_recv($socket,$buffer,2048,0);
				if( $bytes === 0 )
				{
					$this->disconnected($socket);
				}
				# there is data to be read
				else
				{
					# this is a new connection, no handshake yet
					if( !isset($this->handshakes[$socket_index]) )
					{
						$this->do_handshake($buffer,$socket,$socket_index);
						//$this->init();
					}
					# handshake already done, read data
					else
					{
						$action = substr($buffer,1,$bytes-2); // remove chr(0) and chr(255)

						$queue[] = $action;

						//$msg = socketWebSocketTrigger::run($action);
						//$this->send($socket,$msg);
					}
				}
			}
		}// end foreach changed sockets

		return $queue;
	}

	/*private function update(){
		if(!empty($this->queue)){
			foreach($this->queue as $action){
				$data = json_decode($action, true);
				if($data['action'] == 'move' && isset($data['x']) && isset($data['y'])){
					$this->unit['dx'] = $data['x'];
					$this->unit['dy'] = $data['y'];
					$this->console('currently at: '.$this->unit['x'].','.$this->unit['y'].'. going to '.$this->unit['dx'] . ', '.$this->unit['dy']);
				}
			}
			$this->queue = array();
		}

		$this->updatePosition();
	}*/

	public function sendResponse($msg){
		//$msg = array('response' => 'sucess', 'text' => 'moving', 'x'=>$this->unit['x'], 'y'=>$this->unit['y']);
		$retval = json_encode($msg);
		$this->console('Sending: '.$retval);

		foreach($this->allsockets as $socket){
			if( $socket!=$this->master ){
				$this->send($socket, $retval);
			}
		}
	}

	/*private function updatePosition(){
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
				$rads = asin($diffy/$denom);

					$this->console('currently at: '.$this->unit['x'].','.$this->unit['y']);
				$this->unit['x'] += $this->unit['speed'] * $this->dt * cos($rads)*(-1);
				$this->unit['y'] += $this->unit['speed'] * $this->dt * sin($rads);
				$this->console('moving with speed: '.$this->unit['speed'] . ' and dt: '.$this->dt . ' and cos,sin: '.cos($rads) . ', '. sin($rads) . ' and denom/rads: ' . $denom . ', ' . $rads );
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
	}*/

	/**
	 * Manage the handshake procedure
	 *
	 * @param string $buffer The received stream to init the handshake
	 * @param socket $socket The socket from which the data came
	 * @param int $socket_index The socket index in the allsockets array
	 */
	private function do_handshake($buffer,$socket,$socket_index)
	{
		$this->console('Requesting handshake...');

		list($resource,$host,$origin) = $this->getheaders($buffer);

		$this->console('Handshaking...');

		$upgrade  = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
				"Upgrade: WebSocket\r\n" .
				"Connection: Upgrade\r\n" .
				"WebSocket-Origin: {$origin}\r\n" .
				"WebSocket-Location: ws://{$host}{$resource}\r\n\r\n" . chr(0);

		$this->handshakes[$socket_index] = true;

		socket_write($socket,$upgrade,strlen($upgrade));

		$this->console('Done handshaking...');
	}

	/**
	 * Extends the socket class send method to send WebSocket messages
	 *
	 * @param socket $client The socket to which we send data
	 * @param string $msg  The message we send
	 */
	protected function send($client,$msg)
	{
		$this->console(">>>{$msg}");

		parent::send($client,chr(0).$msg.chr(255));
	}

	/**
	 * Disconnects a socket an delete all related data
	 *
	 * @param socket $socket The socket to disconnect
	 */
	private function disconnected($socket)
	{
		$index = array_search($socket, $this->allsockets);
		if( $index >= 0 )
		{
			unset($this->allsockets[$index]);
			unset($this->clients[$index]);
			unset($this->handshakes[$index]);
		}

		socket_close($socket);
		$this->console($socket." disconnected!");
	}

	/**
	 * Parse the handshake header from the client
	 *
	 * @param string $req
	 * @return array resource,host,origin
	 */
	private function getheaders($req)
	{
		$req  = substr($req,4); /* RegEx kill babies */
		$res  = substr($req,0,strpos($req," HTTP"));
		$req  = substr($req,strpos($req,"Host:")+6);
		$host = substr($req,0,strpos($req,"\r\n"));
		$req  = substr($req,strpos($req,"Origin:")+8);
		$ori  = substr($req,0,strpos($req,"\r\n"));

		return array($res,$host,$ori);
	}

	/**
	 * Extends the parent console method.
	 * For now we just set another type.
	 *
	 * @param string $msg
	 * @param string $type
	 */
	protected function console($msg,$type='WebSocket')
	{
		parent::console($msg,$type);
	}
}

?>