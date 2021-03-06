var modal = {};

modal.actual = null;
modal.opening = false;
modal.filterData = {};
modal.html = {};
modal.events = {};

/**
 * Open the modal
 *
 * @param {string} id
 * @param {object} data
 */
modal.open = function(id,data,events){

	modal.opening = true;


	if(!events){
		events = {};
	}

	if(!events.close){
		events.close = function(){};
	}

	modal.events[id] = {};
	modal.events[id]['close'] = events.close;


	modal.closeActual();

	var el = $('#'+id);
	html = el.html();
	modal.html[id] = html;

	// Replace all {vars}

	for(info in data){
		var value = data[info];
		var name = info.replace("data-modal-","");
		var re = new RegExp("{"+name+"}", 'gi');
		html = html.replace(re,value);
	}

	el.html($(html).first());

	el.addClass('modal-active');


	for(info in data){
		el.find('.'+info).html(data[info]);
	}

	for(info in data){
		el.find('['+info+']').attr(info,data[info]);
	}

	modal.exeDataTo(id,el,data);

	modal.actual = id;

	// Set body active
	$('body').addClass('body-modal-active');

	el.parent().addClass('modal-container');
};

/**
 * Add a callback to call when the modal is opened
 * 
 * @param {string} id
 * @param {object} el
 */
modal.on = function(id,callback){
	modal.filterData[id] = callback;
};

/**
 * Execute the callback given the id of modal
 *
 * @param {string} id
 * @param {object} el
 * @param {object} data
 */
modal.exeDataTo = function(id,el,data){

	var closure = modal.filterData[id];
	if(!closure)return null;

	closure(el,data);

};

/**
 * Get data param in modal
 *
 * @param {object} element
 *
 * @return {object} data
 */
modal.getDataModal = function(el){
	var data = el.dataByPrefix('modal');
	delete data['data-modal'];
	return data;
};

/**
 * Close the modal given the id
 * 
 * @param
 */
modal.close = function(id){
	$('#'+id).removeClass('modal-active');

	setTimeout(function(){
		$('#'+id).html(modal.html[id]);
   	},300);

	modal.actual = null;

	$('body').removeClass('modal-body-active');

	$('#'+id).parent().removeClass('modal-container');

	modal.events[id].close();

	modal.opening = false;
};

/**
 * Close actual modal
 */
modal.closeActual = function(){
	if(modal.actual != null){
		modal.close(modal.actual);
	}
};

/**
 * Open the modal when a specific element is clicked
 */
$('body').on('click','[data-modal]',function(){

	modal.open(
		$(this).data('modal'),
		modal.getDataModal($(this))
	);
});

/**
 * Close the modal when a specific element is clicked
 */
$('body').on('click','.modal-close',function(){
	var id = $(this).closest('.modal').attr('id');
	modal.close(id);
});

/**
 * Close the modal when outside is clicked
 */
$(document).on('mousedown',function(event){

	if(!$(event.target).closest('.modal-active').length || $(event.target).is('.modal')){
		modal.closeActual();
	}
	
	
});

/**
 * Get attribute with prefix
 */
$.fn.dataByPrefix = function( pr ){
	var data = this.get(0).attributes;
	var r = new RegExp("^"+'data-'+pr);
	var ob = {};
	$.each(data,function(k,attr){
		value = attr.nodeValue;
		attr = attr.nodeName;
		if(r.test(attr)) ob[attr] = value;
	});
	return ob;
};

/*
$(document).ready(function(){
	$.map($('.modal'),function(modal){

		var el = $('#'+id);
		el.html(modal.html[id]);

	});
});*/
