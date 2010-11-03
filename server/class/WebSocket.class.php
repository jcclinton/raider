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

	public function __construct()
	{
		parent::__construct();

	}


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

					$this->console($client . ' CONNECTED with id:' . $socket_index . '!');
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
					foreach( $this->allsockets as $socket_temp ){
						# master socket changed means there is a new socket request
						if( $socket_temp != $this->master && $socket_temp != $socket){
							if($socket_index){
								$msg = array('response' => 'sucess', 'id' => $socket_index, 'command' => 'close', 'text' => 'user dropped');
								$this->sendResponse($msg);
							}
						}
					}

					$this->disconnected($socket);
				}
				# there is data to be read
				else
				{
					# this is a new connection, no handshake yet
					if( !isset($this->handshakes[$socket_index]) )
					{
						$this->doHandshake($buffer,$socket,$socket_index);

						$msg = array('response' => 'sucess', 'id' => $socket_index, 'command' => 'init', 'text' => 'id received');
						$this->sendResponse($msg, $socket_index);
						$msg = array('response' => 'sucess', 'id' => $socket_index, 'command' => 'create', 'text' => 'create new');
						$this->sendResponse($msg);


						foreach( $this->allsockets as $new_socket_index => $socket_temp ){
							# master socket changed means there is a new socket request
							if( $socket_temp != $this->master && $socket_temp != $socket){
								//$new_socket_index = array_search($socket_temp, $this->allsockets);
								if($new_socket_index){
									$msg = array('response' => 'sucess', 'id' => $new_socket_index, 'command' => 'create', 'text' => 'send other objects');
									$this->sendResponse($msg);
								}
							}
						}
					}
					# handshake already done, read data
					else
					{
						$action = substr($buffer,1,$bytes-2); // remove chr(0) and chr(255)

						$queue[] = array('id'=> $socket_index, 'action'=>$action);
						$this->console('receiving: ' . $action);

						//$msg = socketWebSocketTrigger::run($action);
						//$this->send($socket,$msg);
					}
				}
			}
		}// end foreach changed sockets

		return $queue;
	}


	public function sendResponse($msg, $index = null){
		//$msg = array('response' => 'sucess', 'text' => 'moving', 'x'=>$this->unit['x'], 'y'=>$this->unit['y']);
		$retval = json_encode($msg);

		if($index){
			$socket = $this->allsockets[$index];
			if( $socket!=$this->master ){
				$this->send($socket, $retval);
			}
		}else{
			foreach($this->allsockets as $socket){
				if( $socket!=$this->master ){
					$this->send($socket, $retval);
				}
			}
		}
	}




	public function doHandshake($buffer, $socket, $socket_index) {

        list($resource, $headers, $securityCode) = $this->handleRequestHeader($buffer);

        $securityResponse = '';
        if (isset($headers['Sec-WebSocket-Key1']) && isset($headers['Sec-WebSocket-Key2'])) {
            $securityResponse = $this->getHandshakeSecurityKey($headers['Sec-WebSocket-Key1'], $headers['Sec-WebSocket-Key2'], $securityCode);
        }

        if ($securityResponse) {
            $upgrade  = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
                "Upgrade: WebSocket\r\n" .
                "Connection: Upgrade\r\n" .
                "Sec-WebSocket-Origin: " . $headers['Origin'] . "\r\n" .
                "Sec-WebSocket-Location: ws://" . $headers['Host'] . $resource . "\r\n" .
                "\r\n".$securityResponse;
        } else {
            $upgrade  = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
                "Upgrade: WebSocket\r\n" .
                "Connection: Upgrade\r\n" .
                "WebSocket-Origin: " . $headers['Origin'] . "\r\n" .
                "WebSocket-Location: ws://" . $headers['Host'] . $resource . "\r\n" .
                "\r\n";
        }

		$this->handshakes[$socket_index] = true;

		socket_write($socket,$upgrade,strlen($upgrade));

		$this->console('Done handshaking...');
        return true;
    }

    private function handleSecurityKey($key) {
        preg_match_all('/[0-9]/', $key, $number);
        preg_match_all('/ /', $key, $space);
        if ($number && $space) {
            return implode('', $number[0]) / count($space[0]);
        }
        return '';
    }

    private function getHandshakeSecurityKey($key1, $key2, $code) {
        return md5(
            pack('N', $this->handleSecurityKey($key1)).
            pack('N', $this->handleSecurityKey($key2)).
            $code,
            true
        );
    }

    private function handleRequestHeader($request) {
        $resource = $code = null;
        preg_match('/GET (.*?) HTTP/', $request, $match) && $resource = $match[1];
        preg_match("/\r\n(.*?)\$/", $request, $match) && $code = $match[1];
        $headers = array();
        foreach(explode("\r\n", $request) as $line) {
            if (strpos($line, ': ') !== false) {
                list($key, $value) = explode(': ', $line);
                $headers[trim($key)] = trim($value);
            }
        }
        return array($resource, $headers, $code);
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
		$this->console($socket." disconnected! (index: {$index})");
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
	public function console($msg,$type='WebSocket')
	{
		parent::console($msg,$type);
	}
}

?>