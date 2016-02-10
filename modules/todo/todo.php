<?php
/**
 * @package    TODO
 *
 * @copyright  Copyright (C) 2016 TODO Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later
 */
 
//echo '<pre>'.print_r($_REQUEST, true).'</pre>';

if ( file_exists( __DIR__ .'/'. $module .'_model.php') )
{
	require_once  __DIR__ .'/'. $module .'_model.php';
} 
else 
{
	die('No model file found');
}

$modelString = $module . 'Model';
$model = new $modelString;

$task = isset($_REQUEST['task']) ? filter_var($_REQUEST['task'], FILTER_SANITIZE_STRING) : '';		
$data = isset($_REQUEST['data']) ? filter_var($_REQUEST['data'], FILTER_SANITIZE_STRING) : '';
if($data){
	$data = preg_replace('/&#34;/i', '"', $data);
}
$id   = isset($_REQUEST['id']) ? filter_var($_REQUEST['id'], FILTER_SANITIZE_NUMBER_INT) : 0;
$update   = isset($_REQUEST['update']) ? filter_var($_REQUEST['update'], FILTER_SANITIZE_NUMBER_INT) : 2;
$params = array('id' => $id, 'update' => $update);

if( $task /*&& $data*/ )
{
	echo $model->$task($data, $params);
}

//  /server.php?module=todo&task=select_list  		   	- получить список названий заметок
//  /server.php?module=todo&task=select_item&id=123 	- получить заметку по id
// 	/server.php?module=todo&task=add_item&update=1 (0)  - изменить (добавить новую) запись 
//  /server.php?module=todo&task=del_item				- удалить заметку


