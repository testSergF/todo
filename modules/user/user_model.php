<?php 
/**
 * @package    TODO
 *
 * @copyright  Copyright (C) 2016 TODO Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later
 */
 
/**
 * Model Class of User Module
 */
class userModel
{
	/**
	 * Module name.
	 * @var string
	 */
	public $_module = 'user';
	
	
	/**
	 * Method update
	 * update of user config
	 *
	 * @param string $json  Updating record in json-string format
	 * @return  boolean  True on success
	 */
	public function update($json)   // add == update
	{
		//see todo_model.php
		return true;
	}
	
	/**
	 * Method delete
	 * delete of user config
	 *
	 * @param string $json  Deleting record in json-string format
	 * @return  boolean  True on success, false otherwise
	 */
	public function delete($json)   
	{
		//see todo_model.php
		return true;
	}
	
	/**
	 * Method select
	 * select data of user config
	 *
	 * @param string $json  Selecting record in json-string format
	 * @return  boolean  True on success, false otherwise
	 */
	public function select($json)   
	{
		//see todo_model.php
		return true;
	}
	
}
