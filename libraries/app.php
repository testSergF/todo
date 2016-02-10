<?php 
/**
 * @package    TODO
 *
 * @copyright  Copyright (C) 2016 TODO Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later
 */
 
/**
 * Base class for a TODO Web application.
 */
class Application 
{

	/**
	 * Storage class object
	 * @var object
	 */
	public $_storage;
	
	/**
	 * Initialise the application.
	 *
	 * @return  boolean  True on success
	 */
	public function init()
	{
		if ( file_exists(PATH_CONFIGURATION . '/config.php') )
		{
			require_once PATH_CONFIGURATION . '/config.php';
		} 
		else 
		{
			die('No configuration file found');
		}
		
		$config = new Config;
		$storage = $config->storage_type;
		unset($config);
		
		if ( file_exists(PATH_LIBRARIES . '/' . $storage . '_storage.php') )
		{
			require_once PATH_LIBRARIES . '/' . $storage . '_storage.php';
		} 
		else 
		{
			die('No lib storage found');
		}
		
		$appStorage_string = $storage . 'Storage';
		$this->_storage = new $appStorage_string;
		
		return true;
	}

}
