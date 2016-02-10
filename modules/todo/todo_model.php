<?php 
/**
 * @package    TODO
 *
 * @copyright  Copyright (C) 2016 TODO Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later
 */
 
/**
 * Model Class of Todo Module
 */
class todoModel
{
	/**
	 * Module name.
	 * @var string Module
	 */
	public $_module = 'todo';

	
	/**
	 * Method add item
	 *
	 * @param string $json  New record in json-string format
	 * @param array $params  Extra options
	 * @return  boolean  True on success, false otherwise
	 */
	public function add_item($json, $params)   // {"title":"Заметка 1","text":"текст 1","created":1454267603694,"updated":1454267603694}
	{
		if( isset($params["update"]) && $params["update"] == 1 ){
			$this->update($json, $params);
			return;
		}		
		$dataArr = json_decode($json, true);
		global $db;	
		if( $db->add( $dataArr, 'content' ) )
		{
			return true;
		}
		return false;
	}
	
	/**
	 * Method update item
	 *
	 * @param string $json  Updating record in json-string format
	 * @param array $params  Extra options
	 * @return  boolean  True on success, false otherwise
	 */
	public function update($json, $params)
	{
		$dataArr = json_decode($json, true);
		$whereArr = array(
				"id" => $dataArr['id']
			);
		global $db;	
		if( $db->update( $dataArr, $whereArr, 'content' ) )
		{
			return true;
		}
		return false;
	}
	
	/**
	 * Method delete item
	 *
	 * @param string $json  Deleting record in json-string format
	 * @param array $params  Extra options
	 * @return  boolean  True on success, false otherwise
	 */
	public function del_item($json, $params)
	{
		$dataArr = json_decode($json, true);
		$whereArr = array(
				"id" => $dataArr['id']
			);
		global $db;	
		if( $db->delete( $whereArr, 'content' ) )
		{
			return true;
		}
		return false;
	}
	
	/**
	 * Method select item
	 *
	 * @param string $json  Selecting data in json-string format
	 * @param array $params  Extra options
	 * @return  string  Record in json-string format
	 */
	public function select_item($json = '', $params = array())
	{
		$dataArr = isset($params["id"]) ? array($params["id"]) : array();
		// $dataArr = [
		// 	0 -> получить все записи
		//  111111 -> получить запись с id=111111 
		// ];
		global $db;	
		$result = $db->select( $dataArr, 'content' );
		$data = array();
		if( is_array($result) && !empty($result) ){
			$data = array( 
						"id" => $result[0]["id"],
						"title" => $result[0]["title"],
						"text" => $result[0]["text"],
						"created" => $result[0]["created"],
						"updated" => $result[0]["updated"]
				);
		}
		$data_json = json_encode($data);
		return $data_json;
	}

	
	/**
	 * Method select list
	 *
	 * @param string $json  Selecting data in json-string format
	 * @param array $params  Extra options
	 * @return  string  Records in json-string format
	 */
	public function select_list($json = '', $params = array())
	{
		$dataArr = array(0);
		// $dataArr = [
		// 	0 -> получить все записи
		//  111111 -> получить запись с id=111111 
		// ];
		global $db;	
		$result = $db->select( $dataArr, 'content' );;
		$data = array();
		if( is_array($result) && !empty($result) ){
			foreach( $result as $key => $val ){
				$data[$val["id"]] = array( "id" => $val["id"], "title" => $val["title"] );
			}
		}
		$data_json = $data ? json_encode($data) : '';
		return $data_json;
	}
	
}
