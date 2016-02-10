<?php
/**
 * @package    TODO
 *
 * @copyright  Copyright (C) 2016 TODO Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later
 */

define('PATH_BASE', __DIR__);
define('PATH_CONFIGURATION', PATH_BASE);
define('PATH_LIBRARIES',     PATH_BASE . '/libraries');	

if ( file_exists(PATH_LIBRARIES . '/app.php') )
{
	require_once PATH_LIBRARIES . '/app.php';
} 
else 
{
	die('No application file found');
}

$app = new Application;
$app->init();
$db = $app->_storage;

$module = isset($_REQUEST['module']) ? filter_var($_REQUEST['module'], FILTER_SANITIZE_STRING) : '';	// 	/server.php?module=todo&task=add

if ( file_exists(PATH_BASE . '/modules/'.$module.'/'.$module.'.php') )
{
	require_once PATH_BASE . '/modules/'.$module.'/'.$module.'.php';
} 
else 
{
	die('No module file found');
}

