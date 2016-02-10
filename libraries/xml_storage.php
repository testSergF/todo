<?php 
/**
 * @package    TODO
 *
 * @copyright  Copyright (C) 2016 TODO Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later
 */
 
/**
*  XML storage class.
*/
class xmlStorage
{
	
	/**
	 * Path to the xml-files.
	 * @var string Path
	 */
	private $_path = PATH_BASE . '/storage/';	
	
	
	/*
	* Method json to xml
	*
	* @param string $json Data for conversion
	* @return data in XML format
	*/
	private function json2xml( $json )
	{
		if( is_array($json) )
		{
			$array = $json;
		}
		else
		{
			$array = json_decode($json, true);
		}
		$xml = new SimpleXMLElement('<?xml version="1.0"?><data></data>');
		$this->array_to_xml($array,$xml);
		return $xml;
	}
	
	/*
	* Method xml to json
	*
	* @param string $xml_string Data for conversion
	* @return string in json format
	*/
	private function xml2json( $xml_string )
	{
		$xml = simplexml_load_string($xml_string);
		$json_string = json_encode($xml);
		return $json_string;
	}
	
	/*
	* Method array to xml
	*
	* @param array $data Data for conversion
	* @param $xml_Data XML-root
	* @return data in xml format
	*/
	private function array_to_xml( $data, $xml_data ) {
		foreach( $data as $key => $value ) {
			if( is_array($value) ) {
				if( is_numeric($key) ){
					$key = 'item'.$key; 
				}
				$subnode = $xml_data->addChild($key);
				array_to_xml($value, $subnode);
			} else {
				$xml_data->addChild("$key",htmlspecialchars("$value", ENT_COMPAT, 'UTF-8'));
			}
		 }
	}
	
	/*
	* Method add record
	*
	* @param array $queryArr Request's data (ассоц.массив поле=>значение)
	* @return  boolean  True on success
	*/
	public function add( $queryArr = array() )
	{
		$xml = $this->json2xml($queryArr);
		$xml->asXML( $this->_path . $queryArr['id'] . '.xml');  
		return true;
	}
	
	/*
	* Method select records
	*
	* @param array $whereArr Request's data - массив значений id получаемых записей (0 - получить все записи)
	* @return  string  Records in json-string format on success, false otherwise
	*/
	public function select( $whereArr = array() )
	{
		$xmlAll = array();
		if( is_array($whereArr) && !empty($whereArr) )
		{
			if (in_array(0, $whereArr)) 
			{
				$allXmlFiles_arr = glob( $this->_path . '*.xml');
				if( $allXmlFiles_arr && !empty($allXmlFiles_arr) )
				{
					$xml_arr = $allXmlFiles_arr;
				}
			}
			else
			{
				$xml_arr = $whereArr;
			}
			
			foreach( $xml_arr as $val ){
				if (file_exists( $this->_path . $val . '.xml' )) {
					$xml = (array)simplexml_load_file( $this->_path . $val . '.xml' ); 
					$xmlAll[$xml['id']] = $xml;
				}
			}
		}
		
		if( !empty($xmlAll) )
		{
			$json_string = json_encode($xmlAll);
			return $json_string;
		}
		
		return false;
	}
	
	/*
	* Method delete record
	*
	* @param array $data Request's data (ассоц.массив поле=>значение)
	* @return  boolean  True on success
	*/
	public function delete($data = array())
	{
		$filename = $this->_path . $data['id'] . '.xml';
		if (file_exists($filename)) {
			unlink($filename);
		}
		return true;
	}
	
	/*
	* Method update record
	*
	* @param array $queryArr Request's data (ассоц.массив поле=>значение)
	* @return  boolean  True on success
	*/
	public function update( $queryArr = array() )
	{
		if( $this->add( $queryArr ) )
		{
			return true;
		}
		return false;
	}
	
	
}
