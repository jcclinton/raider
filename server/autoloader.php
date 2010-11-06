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
        $new_path = get_include_path().PATH_SEPARATOR.AUTOLOADER_PATH;
        set_include_path($new_path);
        $ret = spl_autoload_extensions('.class.php');
        //echo $new_path . '/' . $class . $ret;
        spl_autoload($class);
    }

}

?>