<?php 
/**
 * @package    TODO
 *
 * @copyright  Copyright (C) 2016 TODO Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later
 */

// ****************************************************************** переделать на mysqli 

 
/**
 * Mysql storage class.
 */
class mysqlStorage
{
	/**
	 * Host name.
	 * @var string Hostname
	 */
	private $_hostname;
	/**
	 * User name.
	 * @var string Username
	 */
	private $_username;
	/**
	 * Password of database.
	 * @var string Password
	 */
	private $_password;
	/**
	 * Database name.
	 * @var string Dbname
	 */
	private $_dbname;
	
	/**
	 * Class constructor.
	 */
	public function __construct()
	{
		require_once PATH_CONFIGURATION . '/config.php';
		$config = new Config;
		$this->_hostname = $config->hostname;
		$this->_username = $config->username;
		$this->_password = $config->password;
		$this->_dbname = $config->dbname;
		unset($config);
	}
	
	/*
	* Method add record
	*
	* @param array $queryArr Request's data (ассоц.массив поле=>значение)
	* @param string $table Table name of database
	* @return  boolean  True on success
	*/
	public function add( $queryArr = array(), $table = '' )
	{
		$queryStr = '';
		if( is_array($queryArr) && !empty($queryArr) )
		{
			foreach( $queryArr as $key => $val ){
				$queryStr .= "`".$key."`='".$val."',";
			}
			if(  strlen($queryStr) > 1 ){
				$queryStr = mb_substr($queryStr, 0, -1, 'UTF-8');
			}
		}
		mysql_connect($this->_hostname, $this->_username, $this->_password) or die ("Не могу создать соединение");
		mysql_select_db($this->_dbname) or die (mysql_error());
		$query = "INSERT INTO `$table` SET $queryStr";
		mysql_query($query) or die(mysql_error());
		mysql_close();
		return true;
	}
	
	/*
	* Method select records
	*
	* @param array $whereArr Request's data - массив значений id получаемых записей (0 - получить все записи из таблицы)
	* @param string $table Table name of database
	* @return  array  Records
	*/
	public function select( $whereArr = array(), $table = '')
	{
		$whereStr = '';
		if( is_array($whereArr) && !empty($whereArr) )
		{
			foreach( $whereArr as $val ){
				if( (int)$val == 0 )
				{
					$whereStr = '';
					break;
				}
				$whereStr .= "'" . $val . "',";
			}
			if(  strlen($whereStr) > 1 ){
				$whereStr = mb_substr($whereStr, 0, -1, 'UTF-8');
			}
		}
		$where = $whereStr ? " AND id IN(" . $whereStr . ")" : "";
		
		mysql_connect($this->_hostname, $this->_username, $this->_password) or die ("Не могу создать соединение");
		mysql_select_db($this->_dbname) or die (mysql_error());
		$query = "SELECT * FROM `$table` $where";
		$res = mysql_query($query) or die(mysql_error());
		
		$data = array();
		if( $res )
		{
			$i = 0;
			while ($row = mysql_fetch_array($res)) {
				$data[$i] = $row;
				$i++;
			}	
		}
		mysql_close();
		return $data;
	}
	
	/*
	* Method delete record
	*
	* @param array $whereArr Request's data (ассоц.массив поле=>значение)
	* @param string $table Table name of database
	* @return  boolean  True on success
	*/
	public function delete( $whereArr = array(), $table = '')
	{
		$whereStr = '';
		if( is_array($whereArr) && !empty($whereArr) )
		{
			foreach( $whereArr as $key => $val ){
				$whereStr .= "`".$key."`=".$val." AND ";
			}			
			if(  strlen($whereStr) > 5 ){
				$whereStr = mb_substr($whereStr, 0, -5, 'UTF-8');
			}
		}
		$where = $whereStr ? "WHERE " . $whereStr : '';

		mysql_connect($this->_hostname, $this->_username, $this->_password) or die ("Не могу создать соединение");
		mysql_select_db($this->_dbname) or die (mysql_error());
		$query = "delete from `$table` $where";
		mysql_query($query) or die(mysql_error());
		mysql_close();
		return true;
	}
	
	/*
	* Method update record
	*
	* @param array $queryArr Request's data (ассоц.массив поле=>значение)
	* @param array $whereArr Request's data (ассоц.массив поле=>значение)
	* @param string $table Table name of database
	* @return  boolean  True on success
	*/
	public function update($queryArr = array(), $whereArr = array(), $table = '')
	{
		$queryStr = '';
		if( is_array($queryArr) && !empty($queryArr) )
		{
			foreach( $queryArr as $key => $val ){
				$queryStr .= "`".$key."`='".$val."',";
			}
			if(  strlen($queryStr) > 1 ){
				$queryStr = mb_substr($queryStr, 0, -1, 'UTF-8');
			}
		}

		$whereStr = '';
		if( is_array($whereArr) && !empty($whereArr) )
		{
			foreach( $whereArr as $key => $val ){
				$whereStr .= "`".$key."`='".$val."' AND ";
			}
			$whereStr = mb_substr($whereStr, 0, -4, 'UTF-8');
		}
		$where = $whereStr ? " WHERE " . $whereStr : '';
		
		mysql_connect($this->_hostname, $this->_username, $this->_password) or die ("Не могу создать соединение");
		mysql_select_db($this->_dbname) or die (mysql_error());
		$query = "UPDATE `$table` SET $queryStr $where";
		mysql_query($query) or die(mysql_error());
		mysql_close();
		return true;
	}
	
}
