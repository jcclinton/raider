<?php
class autoloader {

    public static $loader;

    public static function init()
    {
        if (self::$loader == NULL)
            self::$loader = new self();

        return self::$loader;
    }

    public function __construct()
    {
        spl_autoload_register(array($this,'class_load'));
    }

    public function class_load($class)
    {
        set_include_path(get_include_path().PATH_SEPARATOR.'/class/');
        spl_autoload_extensions('.class.php');
        spl_autoload($class);
    }

}

?>