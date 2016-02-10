<?php 
/**
 * @package    TODO
 *
 * @copyright  Copyright (C) 2016 TODO Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later
 */
 
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

if( $task /*&& $data*/ )
{
	echo $model->$task($data);
}

// /server.php?module=user&task=update
