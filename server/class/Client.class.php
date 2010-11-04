<?php

class Client extends User
{
	protected $socket;
	protected $id;

	protected static $units = array();

    public function __construct(&$socket, $id)
    {
		parent::__construct();

		$this->socket = $socket;
		$this->id = $id;

		self::$units[$id] = new Unit($id);
    }

    public static function getUnit($id){
    	return self::$units[$id];
    }
}

?>