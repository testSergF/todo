/**
 * @package    TODO
 *
 * @copyright  Copyright (C) 2016 TODO Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later
 */

// библиотека для работы с localStorage
var fromLS = (function(window, document) {
	'use strict';
	return {
	
		storagePrefix : 'todo-',
		expirationLS : 315360000000,  //10 years
		
		// support Local Storage?
		supportsLocalStorage : function(){
			try{
				return 'localStorage' in window && window['localStorage'] !== null;
			} catch(e) {
				return false;
			}
		},

		addLocalStorage : function( key, storeObj ) {			
			var now = +new Date(),
				tempObj = {
					data : storeObj,
					stamp : now,
					expire : now + this.expirationLS
				};
			try {
				localStorage.setItem( this.storagePrefix + key, JSON.stringify( tempObj ) );
				return true;
			} catch( e ) {
				if ( e.name.toUpperCase().indexOf('QUOTA') >= 0 ) {
					alert('Локальное хранилище переполнено. Пожалуйста, удалите устаревшие записи.');
					return false;
				} else {
					return false;
				}
			}
		},
		
		removeLocalStorage : function( key ) {
			try {
				localStorage.removeItem( this.storagePrefix + key );
				return true;
			} catch( e ) {
				return false;
			}
		},
		
		getLocalStorage : function( key ) {
			var item = localStorage.getItem( this.storagePrefix + key ),
				now = +new Date();
			// устаревшие данные удалим, не возвращая их
			if( item && item.expire <= now ){
				this.removeLocalStorage(key);
				item = false;
			}
			try	{
				var itemParse = JSON.parse( item || 'false' );
				if( itemParse ){
					return itemParse.data;;
				}
			} catch( e ) {
				return false;
			}
		},
		
		getData : function(key, callback){		
			if( this.supportsLocalStorage() ){
				var data = this.getLocalStorage(key);
				if( callback ){
					callback( data );
				}
				if( !data ){			
//					this.getDataAjax(key, callback);
				}
			} else {
//				this.getDataAjax(url, callback);
			}
		},
			
		getDataAjax : function(url, callback){	
			var that = this;
			var xhr = new XMLHttpRequest();
			xhr.open('get', url, true);
			xhr.responseType = 'json';
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4){
					if (xhr.status >= 200 && xhr.status <300 || xhr.status == 304){
						if( that.supportsLocalStorage() ){					
							//that.addLocalStorage(url, xhr.responseText);
						}
						if( typeof xhr.response != 'undefined' ){
							callback( xhr.response );
						}
					}
				}
			};
			xhr.send(null);
		}

	}
})(this, document);


(function(){
	'use strict';
		
	// получение из localStorage "состояния страницы"
	var pageState = pageState || {};
	fromLS.getData('pageState', function(data){		
			pageState.scrollX = (typeof data != 'undefined' && typeof data.scrollX != 'undefined') ? data.scrollX : 0;		// скролл по Х	
			pageState.scrollY = (typeof data != 'undefined' && typeof data.scrollY != 'undefined') ? data.scrollY : 0;		// скролл по Y
			pageState.editItem = (typeof data != 'undefined' && typeof data.editItem != 'undefined') ? data.editItem : 0;	// id редактируемой существующей заметки
			// tempItem - объект {title:title, text:text} создаваемой новой заметки ИЛИ редактируемой уже существующей
			// при создании / редактировании запись автоматич.сохраняется в temp - временная запись только в localStorage; 
			// под id сохранение происходит только после клика юзера на "Сохранить" - в localStorage и на сервере (если разрешено)
			pageState.tempItem = (typeof data != 'undefined' && typeof data.tempItem != 'undefined') ? data.tempItem : {};  
		});	
	
	// получение из localStorage "конфига юзера" (где хранить данные) - "server" OR "browser"
	var userConfig = userConfig || {};
	fromLS.getData('userConfig', function(data){
			if(data){
				userConfig.storage = (typeof data != 'undefined' && typeof data.storage != 'undefined') ? data.storage : 'server';	// где хранить данные (сервер/браузер)
				if(typeof data != 'undefined' && typeof data.storage != 'undefined'){
					document.getElementById(data.storage).checked = true;
				}
			} else {
				// с сервера получить? - нет, нужна проверка "userConfig.storage == 'server'" , а userConfig нет 
			}
		});

	
	// клик по радио
	function settingClick(e){
		var target = e.target; 
		if (target.tagName != 'INPUT'){
			return false;
		}
		userConfig.storage = target.id;
		fromLS.addLocalStorage( 'userConfig' , userConfig );
		// сохраним на сервере (если в настройках разрешено)
		if( userConfig.storage == 'server' ){
			if (navigator.onLine) {
				postToServer('/server.php?module=user&task=update', JSON.stringify(userConfig) );
			} else {
				var offlineData = {};
				offlineData.time = +new Date();
				offlineData.url = '/server.php?module=user&task=update';
				offlineData.data = userConfig;
				addRequestInQueue(offlineData);
			}
		}
		return true;
	}
	document.getElementById('setting').addEventListener('click', settingClick);
	
	
	// кнопка "Добавить запись"
	function addItemClick(){
		document.getElementById('editor_area').style.display = 'block';
		document.getElementById('addItem').style.display = 'none';
		document.getElementById('saveItem').style.display = 'inline';
		document.getElementById('cancelItem').style.display = 'inline';
	}
	document.getElementById('addItem').addEventListener('click', addItemClick);
	
	// кнопка "Отменить запись"
	function cancelItemClick(){
		document.getElementById('editor_area').style.display = 'none';
		document.getElementById('saveItem').style.display = 'none';
		document.getElementById('cancelItem').style.display = 'none';
		document.getElementById('addItem').style.display = 'inline';
		document.getElementById('namenote').value = '';
		document.getElementById('textnote').value = '';
		// удалим из localStorage temp-запись создаваемой заметки
		pageState.tempItem = {};
		pageState.editItem = 0;
		fromLS.addLocalStorage( 'pageState' , pageState );
	}
	document.getElementById('cancelItem').addEventListener('click', cancelItemClick);
	
	// кнопка "Сохранить запись"
	function saveItemClick(){
		var namenote = stripHtml( document.getElementById('namenote').value ),
			textnote = stripHtml( document.getElementById('textnote').value );
		namenote = trim(namenote);
		textnote = trim(textnote);	
		if( !namenote ){
			alert('Заполните поле "название заметки"');
			return false;
		}
		if( !textnote ){
			alert('Заполните поле "текст заметки"');
			return false;
		}
		var now = +new Date(),
			item = {};
		item.title = namenote;
		item.text = textnote;
		item.created = now;
		item.updated = now;
		var updateItem = 0;
		// если это редактирование существующей записи, сохраним старое время ее создания
		if( pageState.editItem ){
			updateItem = 1;
			var itemUpd = fromLS.getData('item-' + pageState.editItem, function(data){
				if( data ){
					item.created = data.created;
				}
			});	
		}
		fromLS.addLocalStorage( 'item-' + item.created , item );
		
		// удалим из localStorage temp-запись создаваемой заметки
		pageState.tempItem = {};
		pageState.editItem = 0;
		fromLS.addLocalStorage( 'pageState' , pageState );
		
		document.getElementById('namenote').value = '';
		document.getElementById('textnote').value = '';
		document.getElementById('editor_area').style.display = 'none';
		document.getElementById('saveItem').style.display = 'none';
		document.getElementById('cancelItem').style.display = 'none';
		document.getElementById('addItem').style.display = 'inline';
		// обновим список
		if( !updateItem ){  // добавить новую запись
			var ul = document.getElementById('todolist'),
				li = document.createElement('li');
			li.innerHTML = '<div class="todoItemName">' + item.title + '</div>' + '<button class="todoitemDel" id="'+ item.created +'_del">Удалить</button>';
			li.setAttribute('data-itemid', item.created);
			li.classList.add('todolist-item');
			ul.appendChild(li);
		} else if( updateItem == 1 ){	// изменить старую запись
			var liUpd,
				lis = document.querySelectorAll('ul > li'),
				liDataId;
			for (var i = 0, len = lis.length; i < len; i++) {
				liDataId = lis[i].getAttribute('data-itemid');
				if ( liDataId == item.created ) {
					liUpd = lis[i];
					break;
				}
			}
			liUpd.getElementsByTagName('div')[0].textContent = item.title;
		}
		// сохраним на сервере (если в настройках разрешено)
		if( userConfig.storage == 'server' ){
			item.id = item.created;
			if (navigator.onLine) {
				postToServer('/server.php?module=todo&task=add_item&update=' + updateItem, JSON.stringify(item) );
			} else {
				var offlineData = {};
				offlineData.time = +new Date();
				offlineData.url = '/server.php?module=todo&task=add_item&update=' + updateItem;
				offlineData.data = item;
				addRequestInQueue(offlineData);
			}
		}
	}
	document.getElementById('saveItem').addEventListener('click', saveItemClick);
	
	// клик по UL (удалить запись ИЛИ читать/редактировать
	function todolistClick(e){
		e.preventDefault();
		var target = e.target; 
		if (target.tagName != 'BUTTON'){
			// читать/редактировать запись
			if( target.classList.contains('todoItemName') ){
				var el = target.parentNode;
			} else {
				var el = target;
			}
			var id = el.getAttribute('data-itemid');
			selectItemAndInsertInArea(id);
		}
		if( target.classList.contains('todoitemDel') ){
			// удалить запись
			todoitemDel(target);
		}
	}
	document.getElementById('todolist').addEventListener('click', todolistClick);
	
	// получение записи и вставка в редактор
	function selectItemAndInsertInArea(id){
		var item = fromLS.getData('item-' + id, function(data){
			if( data ){
				addItemClick();
				document.getElementById('namenote').value = data.title;
				document.getElementById('textnote').value = data.text;
				pageState.editItem = data.created; // id редактируемой записи
				pageState.tempItem.title = data.title;
				pageState.tempItem.text = data.text;
			} else {
				// с сервера получим (если в настройках разрешено)
				if( userConfig.storage == 'server' ){
					if (navigator.onLine) {
						var dataServer = fromLS.getDataAjax('/server.php?module=todo&task=select_item&id=' + id, function(data){
								var dataJson = JSON.parse( data );
								if( dataJson ){
									addItemClick();
									document.getElementById('namenote').value = dataJson.title;
									document.getElementById('textnote').value = dataJson.text;
									pageState.editItem = dataJson.created; // id редактируемой записи
									pageState.tempItem.title = dataJson.title;
									pageState.tempItem.text = dataJson.text;
								}
							});
					}
				}
			}
			fromLS.addLocalStorage( 'pageState' , pageState );
		});
		return true;
	}
	
	
	// удалить запись
	function todoitemDel(el){
		var id = el.id.split('_')[0];
		fromLS.removeLocalStorage('item-' + id);
		// обновим список
		el.parentNode.parentNode.removeChild(el.parentNode);
		// удалим на сервере 
		if( userConfig.storage == 'server' ){
			var item = {};
			item.id = parseInt(id);
			if (navigator.onLine) {
				postToServer('/server.php?module=todo&task=del_item', JSON.stringify(item) );
			} else {
				var offlineData = {};
				offlineData.time = +new Date();
				offlineData.url = '/server.php?module=todo&task=del_item';
				offlineData.data = item;
				addRequestInQueue(offlineData);
			}
		}
		cancelItemClick();
		return true;
	}
	
	// POST на сервер
	function postToServer(url, jsonStringData){
		var xhr = new XMLHttpRequest(),
			form = new FormData;
		form.append('data', jsonStringData);
		xhr.open('POST', url, true);		
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4){
				if (xhr.status >= 200 && xhr.status <300 || xhr.status == 304){
					console.log( xhr.response );
				}
			}
		};
		xhr.send(form);
	}
	
	
	// получение из localStorage списка (только названия) сохраненных там заметок
	var listTodoFromLS = function(){
			var item, itemTemp, curItem,
				tempLocalItems = [];
			for ( item in localStorage ) {
				if ( item.indexOf( fromLS.storagePrefix + 'item' ) === 0 ) {
					itemTemp = JSON.parse( localStorage[ item ] );
					curItem = {
							title: itemTemp.data.title,
							id: itemTemp.data.created,
							stamp: itemTemp.stamp
						};
					tempLocalItems.push( curItem );
				}
			}
			if ( tempLocalItems.length ) {
				tempLocalItems.sort(function( a, b ) {
					return a.stamp - b.stamp;
				});
			}
			return tempLocalItems; // массив объектов
        };
	
	// построение списка заметок
	var listTodo = listTodoFromLS() || [],
		listTodoObj = {};						// Объект "Список заметок"  (используем в дальнейшем его)
	if( listTodo.length ) {
		listTodo.forEach(function(item, i, arr) {
			listTodoObj[item.id] = { id:item.id, title:item.title };
		});		
		fillList(listTodoObj);
	} else {
		// с сервера получим (если в настройках разрешено)
		if( userConfig.storage == 'server' ){
			if (navigator.onLine) {
				listTodoObj = fromLS.getDataAjax('/server.php?module=todo&task=select_list', function(data){
						var dataJson = JSON.parse( data );
						if( dataJson ){
							fillList(dataJson);
						}
					});
			}
		}
	}
	
	// функция заполнения UL списком заметок
	function fillList(data){
		var ul = document.getElementById('todolist');
		for ( var item in data){
			if( data.hasOwnProperty( item ) ) {
				var li = document.createElement('li');
				li.innerHTML = '<div class="todoItemName">' + data[item]['title'] + '</div>' + '<button class="todoitemDel" id="'+ data[item]['id'] +'_del">Удалить</button>';
				li.setAttribute('data-itemid', data[item]['id']);
				//li.contentEditable = 'true';
				li.classList.add('todolist-item');
				ul.appendChild(li);
			}
		}
		return true;
	}
	

	// отображение при загрузке страницы запомненного "состояния юзера" (если оно есть)
	window.onload = function() {		
		if( /*pageState.scrollX &&*/ pageState.scrollY ){					// скролл
			window.scrollTo(0,pageState.scrollY);		
		}
		// вернуться к прерванному созданию/редактированию заметки
		if( typeof pageState.tempItem.title != 'undefined' || typeof pageState.tempItem.text != 'undefined' ){	
			addItemClick();
			if( typeof pageState.tempItem.title != 'undefined' ){
				document.getElementById('namenote').value = pageState.tempItem.title;
			}
			if( typeof pageState.tempItem.text != 'undefined' ){ 
				document.getElementById('textnote').value = pageState.tempItem.text;
			}
		}
	};
	
	
	// автоматич.сосхранение создаваемой/редактируемой заметки в pageState.tempItem
	// сохранение: по клику на Enter, по blur input/textarea, по паузе после keyup > 5сек.
	/*
	var timeKeyup = 0;
	function autoSave(){
		var namenote = stripHtml( document.getElementById('namenote').value ),
			textnote = stripHtml( document.getElementById('textnote').value );
		namenote = trim(namenote);
		textnote = trim(textnote);	
		if( namenote ){
			pageState.tempItem.title = namenote;
		}
		if( textnote ){
			pageState.tempItem.text = textnote;
		}
		fromLS.addLocalStorage( 'pageState' , pageState );
	}
	function keydownAutoSave(e){
		if(e.keyCode==13) {		// Enter
			autoSave();
		}
	}
	function keyupAutoSave(){
		var now = +new Date();
		if( now - timeKeyup > 5 ){
			timeKeyup = now;
			autoSave();
		}
	}
	document.getElementById('namenote').addEventListener('keydown', keydownAutoSave);
	document.getElementById('textnote').addEventListener('keydown', keydownAutoSave);
	document.getElementById('namenote').addEventListener('blur', autoSave);
	document.getElementById('textnote').addEventListener('blur', autoSave);
	document.getElementById('namenote').addEventListener('keyup', keyupAutoSave);
	document.getElementById('textnote').addEventListener('keyup', keyupAutoSave);
	*/
	
	// автоматич.сосхранение создаваемой/редактируемой заметки в pageState.tempItem
	// сохранение: по focus input/textarea, через каждые 5сек. ; по blur - отмена автосохранения
	var intervalAutoSave;
	function autoSave(){
		intervalAutoSave = window.setInterval(function() {
			var namenote = stripHtml( document.getElementById('namenote').value ),
				textnote = stripHtml( document.getElementById('textnote').value );
			namenote = trim(namenote);
			textnote = trim(textnote);	
			if( namenote ){
				pageState.tempItem.title = namenote;
			}
			if( textnote ){
				pageState.tempItem.text = textnote;
			}
			fromLS.addLocalStorage( 'pageState' , pageState );
		}, 5000);
	}
	function cancelAutoSave(){
		clearInterval(intervalAutoSave);
	}
	document.getElementById('namenote').addEventListener('focus', autoSave);
	document.getElementById('textnote').addEventListener('focus', autoSave);
	document.getElementById('namenote').addEventListener('blur', cancelAutoSave);
	document.getElementById('textnote').addEventListener('blur', cancelAutoSave);
	

	// Запоминание "состояния юзера" (скролл)
	window.onscroll = function() {
		pageState.scrollY = window.pageYOffset || document.documentElement.scrollTop;  //px по Y
		fromLS.addLocalStorage( 'pageState' , pageState );
	}
	

	// работа в оффлайн                *********************** переделать на  Service Workers **********************
	// manifest работает -    FF Developer Edition, Chrome, Opera
	// manifest не работает - FF("обычный"), на локалке не проверять
	/*
	if (window.applicationCache!=undefined){
		if (applicationCache.status==applicationCache.UNCACHED){
			console.log( 'Первая загрузка страницы, или файл манифеста недоступен' );
		}
	}
	*/
	
	window.addEventListener('load', function(e) {
		if (navigator.onLine) {
			var requestsQueue = getRequestsQueue();
			if( requestsQueue ){
				sendRequestsQueue(requestsQueue);
			}
		} 
	}, false);

	window.addEventListener('online', function(e) {
		var requestsQueue = getRequestsQueue();
		if( requestsQueue ){
			sendRequestsQueue(requestsQueue);
		}
	}, false);
	
	//window.addEventListener('offline', function(e) {}, false);
	
	// получение из localStorage очереди сохраненных при работе в offline запросов к серверу
	function getRequestsQueue(){
		fromLS.getData('requestsQueue', function(data){
			if(data){
				return data; // объект
			} else {
				return false;
			}
		});
	}
	
	// передача на сервер запросов из очереди
	function sendRequestsQueue(requestsQueue){
		// отсортировать по порядку - по времени создания запроса
		var requests = [];
		for ( var item in requestsQueue ) {
			if( requestsQueue.hasOwnProperty( item ) ) {
				requests.push( item );
			}
		}
		if ( requests.length ) {
			requests.sort(function( a, b ) {
				return a.time - b.time;
			});
		}
		requests.forEach(function(item, i, arr) {
			postToServer(item.url, JSON.stringify(item.data) );
		});		
		return true;
	}
	
	// добавление запроса в очередь при разрыве соединения
	function addRequestInQueue(data){
		// data == {"time":time, "url":"url", "data":obj}
		var requestsQueue = getRequestsQueue();
		if( !requestsQueue ){
			requestsQueue = {};
		}
		requestsQueue[data.time] = data;							// добавить запрос в очередь
		fromLS.addLocalStorage('requestsQueue', requestsQueue);		// запись очереди в localStorage
		return true;
	}

	
	// служебные функции очистки строк
	function stripHtml(value) {
		// remove html tags and space chars
		return value.replace(/<.[^<>]*?>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ');
		// remove punctuation
		//.replace(/[(),;:!?%#$\'"+=\/]*/g,'');
	}
	function trim(value){
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		return value == null ? '' : ( value + '' ).replace( rtrim, '' );
	}

})();
