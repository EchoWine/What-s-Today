/**
 * Main
 *
 * @var
 */
var WT = {};

/**
 * Pointer to setTimeout of next message
 *
 * @var
 */
WT.interval = false;

/**
 * List of messages that will be randomly displayed during searching
 *
 * @var
 */
WT.waiting = [
	"This is taking too long",
	"I'm searching the answer to the ultimate question of life, the universe, and everything",
    "The latest episode of Game of Thrones has just been released. A moment please",
    "I'm playing chess right now, wanna join me? <a href='https/it.lichess.org/'></a>",
    "OH YEAH! I WON 1,000,000$ !!! NOW I CAN WASTE ALL MY MONEY ON STEAM !!! Oh... I see.. it's just a scam...",
    "Oh, a free Ipad, guess I just need to download this exe file. OH GOD WHAT IS HAPPENING? A VIRUS? WHERE IS MY MLG ANTIVIRUS?",
    "FORNO, ACCENDERE",
    "Search and destroy, Search and destroy!",
    "AAAAAAAAMEN"
];

/**
 * Need to sto sync all operation?
 *
 * @var
 */
WT.stop_sync = true;

/**
 * Call API: discovery
 *
 * @param {string} database
 * @param {string} key
 * @param {closure} callback
 */
WT.discovery = function(database,key,callback){

	http.get(WT.url+"discovery/"+database+"/"+encodeURIComponent(key),{token:WT.token},callback);
};

/**
 * Call API: add
 *
 * @param {string} database
 * @param {int} id
 * @param {closure} callback
 */
WT.add = function(database,id,callback){

	http.post(WT.url+"discovery/"+database+"/"+id,{token:WT.token},callback);
};


/**
 * Call API: all
 *
 * @param {string} resource
 * @param {closure} callback
 */
WT.all = function(resource,callback){

	http.get(WT.url+resource,{token:WT.token},callback);
};

/**
 * Call API: get
 *
 * @param {string} resource
 * @param {int} id
 * @param {closure} callback
 */
WT.get = function(resource,id,callback){

	http.get(WT.url+resource+"/"+id,{token:WT.token},callback);
};

/**
 * Call API: sync
 *
 * @param {string} resource
 * @param {int} id
 * @param {closure} callback
 */
WT.sync = function(resource,id,callback){

	http.post(WT.url+resource+"/update/"+id,{token:WT.token},callback);
};

/**
 * Call API: remove
 *
 * @param {string} resource
 * @param {int} id
 * @param {closure} callback
 */
WT.remove = function(resource,id,callback){

	http.delete(WT.url+resource+"/"+id,{token:WT.token},callback);
};


/**
 * Get a random number between min and max
 *
 * @param {int} min
 * @param {int} max
 * 
 * @return {int}
 */
WT.random = function(min,max){

    return Math.floor(Math.random()*(max-min+1)+min);
};


/**
 * @Application
 *
 * @var
 */
WT.app = {}


/**
 * @Application
 * 
 * Discovery new resources
 *
 * @param {string} value
 */
WT.app.discovery = function(database,value){
	
	if(!value)
		return;

	// Set the searching mode to true
	WT.app.searching(true);

	// Set spinner
	$('.wt-search-spinner-container').html(template.get('wt-search-spinner'));

	// Send the request to "discovery"

	WT.discovery(database,val,function(response){

		var data = {'library':{'html':'','count':0},'thetvdb':{'html':'','count':0},'manga-fox':{'html':'','count':0}};

		// The response has sent, so set the "searching mode" to false
		WT.app.searching(false);

		$.map(response,function(service,key){
			$.map(service,function(resource){

				var part = (resource.user == 1) ? 'library' : key;

				data[part]['html'] += template.get('wt-search-result',{
					database:resource.database,
					resource_id:resource.resource.id,
					resource_type:resource.container.type,
					id:resource.id,
					title:resource.name,
					poster:resource.poster,
					user:resource.user ? 1 : 0,
					library:resource.library ? 1 : 0
				});

				data[part]['count']++;
			});
		});


		WT.app.addResultSearch('.wt-search-library',data['library']);

		WT.app.addResultSearch('.wt-search-thetvdb',data['thetvdb']);
		WT.app.addResultSearch('.wt-search-manga-fox',data['manga-fox']);
	});
};

/**
 * @Application
 * 
 * Add the result retrieved during discovery
 *
 * @param {string} selector
 * @param {string} html
 */
WT.app.addResultSearch = function(selector,results){

	html = results.html;

	html = $(html);
	
	html.find('img').on('error',function(){
		$(this).hide();
	});

	$(selector).html(html);

	WT.app.updateSearchCount();

};

WT.app.updateSearchCount = function(){
	
	$.map($('.wt-section-container-results'),function(container){

		container = $(container);
		count = container.find('.wt-search-result').length;
		container.attr('data-count',count);
		container.find('.wt-search-section-count').html(count);
	});
};

/**
 * @Application
 * 
 * Change message during searching
 *
 * @param {bool} state
 */
WT.app.searching = function(state){

	clearTimeout(WT.interval);

	if(state){

		$('.wt-section-container').attr('data-status',0);

		var waiting = WT.waiting[WT.random(0,WT.waiting.length - 1)];
		var html = template.get("wt-search-waiting",{waiting:waiting});
		$('.wt-search-waiting').html(html);

		WT.interval = setTimeout(function(){
			WT.app.searching(true);

		},5000);

	}else{
		$('.wt-section-container').attr('data-status',1);
	}
};



WT.app.add = function(database,id){

	var element = $("[wt-add='"+database+","+id+"']").first();

	WT.app.searching(true);

	WT.add(database,id,function(response){
		WT.app.searching(false);
		
		item.addAlert('alert-'+response.status,'.alert-global',response);

		if(response.status == 'success'){
			if(element){

				res = element.closest('.wt-search-result');
				res.attr('wt-status-user',1);
				res.find('[wt-remove]').attr('wt-remove',response.data.container.type+","+response.data.resource.id);
				res = res.closest('.wt-search-result-container');

				res.appendTo($('.wt-search-library'));

				WT.app.updateSearchCount();

			}
		}
	});

};

/**
 * Sync
 */
WT.app.sync = function(resource_type,resource_id,callback){

	WT.sync(resource_type,resource_id,function(response){

		callback();
		item.addAlert('alert-'+response.status,'.alert-global',response);
		modal.close("modal-wt-get");
	});

};

/**
 * @Application
 * 
 * Open a modal that contain all basic info
 *
 * @param {string} type
 * @param {int} id
 */
WT.app.info = function(type,id){

	WT.get(type,id,function(response){

		if(response.status == 'success'){
			/*
			// Group episode in season
			var seasons = [];
			for(var i in response.episodes){
				episode = response.episodes[i];

				if(typeof seasons[episode.season_n] == 'undefined')
					seasons[episode.season_n] = [];

				seasons[episode.season_n].push(episode);
			}


			// Templating seasons
			html_seasons = '';
			for(var i in seasons){
				var season = seasons[i];
				html_episodes = '';
				
				// Templating episodes
				for(e = 0; e < season.length; e++){
					episode = season[e];
					html_episodes += template.get('wt-get-episode',{
						number: episode.number,
						name: episode.name,
						season: episode.season_n,
						aired_at : episode.aired_at
					});

				}

				html_seasons += template.get('wt-get-season',{
					'number': i,
					'episodes': html_episodes,
				});

			}*/

			response = response.data;

			switch(response.status){
				case 'continuing': case 'Ongoing':
					status_type = 'primary';
				break;
				case 'ended':
					status_type = 'danger';
				break;
				default:
					status_type = 'default';
				break;
			}


			if(response.container.type == 'series'){

				content = template.get('wt-get-serie',{
					resource:response,
					status_type:status_type,
				});
			}

			if(response.container.type == 'manga'){

				content = template.get('wt-get-manga',{
					resource:response,
					status_type:status_type,
				});
			}


			modal.open('modal-wt-get',{"modal-wt-get-body":content});
		}else{
			console.log('Error:');
			console.log(response);
		}
	});
	

}


/**
 * Return a date object given string
 *
 * @param String date
 * 
 * @return Date
 */
WT.app.date = function(date){
   	parts = date.split(' ');
    time = parts[1].split(':');
    date = parts[0].split('-');
    return new Date(date[0], parseInt(date[1], 10) - 1, date[2], time[0], time[1], time[2]);
};

/**
 * @Application
 *
 * Sync all the resources
 */
WT.app.syncAll = function(){

	modal.open('modal-wt-sync-all',{},{"close":function(){
		console.log("Stopping...");
		WT.stop_sync = true;
	}});


	
	var status = $('.wt-sync-current-status');
	var progress = $('.wt-sync-current-progress');
	var bar = $('.wt-sync-current-bar');

	var manager = function(results,i,attempt,length){

		if(attempt > 3){
			manager(results,i+1,1,length);
			return;
		}


		if(WT.stop_sync)
			return;

		if(i >= length){
			status.html("Completed");
			progress.html("100%");
			bar.find('span').css('width',"100%");
			return;
		}

		resource = results[i];

		
		attempt_text = attempt == 0 ? '' : ' #'+(attempt)+'';
		status.html(resource.name+attempt_text);
		p = (i + 1) * (100 / length);
		p = parseFloat(p).toFixed(2);
		progress.html(p+"%");
		bar.find('span').css('width',p+"%");

		if(((new Date) - WT.app.date(resource.updated_at)) < (1000*60*45)){
			manager(results,i+1,1,length);
			return;
		}

		WT.sync(resource.type,resource.id,function(response){
			if(response.status == 'success'){
				manager(results,i+1,1,length);
			}else if(response.status == 'error'){
				console.log(response);
				manager(results,i,attempt + 1,length);
			}
		});
			
	};

	// Retrieve all resources
	WT.all('all',function(response){
		length = 0;
		for(i in response){
			length++;
		}

		WT.stop_sync = false;

		manager(response,0,1,length);
	});
};

/**
 * @Event
 * 
 * Discovery new resources on submit
 */
$('.wt-search-form').on('submit',function(e){
	e.preventDefault();

	// Retrieve key searched
	val = $(this).find('.wt-search-key').val();

	WT.app.discovery($(this).find("[name='resource_type']").val(),val);
});

/**
 * @Event
 * 
 * Add a resource on click
 */
$('body').on('click','[wt-add]',function(e){

	var info = $(this).attr('wt-add').split(",");
	var database = info[0];
	var id = info[1];

	WT.app.add(database,id);
});

/**
 * @Event
 * 
 * Remove a resource on click
 */
$('body').on('click','[wt-remove]',function(e){
	WT.app.searching(true);
	var element = $(this);
	info = $(this).attr('wt-remove').split(",");

	WT.remove(info[0],info[1],function(response){
		WT.app.searching(false);


		item.addAlert('alert-'+response.status,'.alert-global',response);

		if(response.status == 'success'){

			res = element.closest('.wt-search-result');
			res.attr('wt-status-user',0);
			res = res.closest('.wt-search-result-container');
			res.appendTo($('.wt-search-'+response.data.container.database_name));

			WT.app.updateSearchCount();
		}
	
	});

});

/**
 * @Event
 * 
 * Sync on click
 */
$('body').on('click','[wt-sync]',function(e){
	
	if(Action.is($(this)))
		return;

	var info = $(this).attr('wt-sync').split(",");
	var resource_type = info[0];
	var resource_id = info[1];

	Action.start($(this));

	WT.app.sync(resource_type,resource_id,function(){

		Action.end($(this));
	});
});


/**
 * @Event 
 * 
 * Display a modal that contains info about a resource on click
 */
$('body').on('click','[wt-info]',function(e){
	info = $(this).attr('wt-info').split(",");

	WT.app.info(info[0],info[1],info[2]);
});

/**
 * @Event 
 * 
 * Sync all on click
 */
$('body').on('click','[wt-sync-all]',function(e){
	
	WT.app.syncAll();

});

/**
 * @Event
 *
 * 
 */
$('body').on('click','[data-wt-consume]',function(e){
	var ids = $(this).attr("data-wt-consume");
	ids = ids.split(";");

	var consumed = {};
	for(id in ids){
		consumed[ids[id]] = 1;
	}

	WT.Resource.consume($(this).attr('data-wt-resource'),consumed,function(){
		console.log('Updated');
	});

	$(this).remove();
});


// ----------------------------------------------------------------
// 
// 	DASHBOARD
//
// ----------------------------------------------------------------


/**
 * @Event 
 * 
 * Show a season on click
 */
$('body').on('click','.wt-get-season',function(){
	var status = $(this).closest('.wt-get-season-container').attr('data-active') == "1";
	$(this).closest('.wt-get-season-container').attr('data-active',status == "1" ? "0" : "1");
});


/**
 * 

 */
WT.dashboard = {};
WT.dashboard.params = {};
WT.dashboard.params.sort = {};
WT.dashboard.params.sort.field = 'new';
WT.dashboard.params.sort.direction = 'desc';
WT.dashboard.params.filter = '';


WT.dashboard.call = function(){


	WT.dashboard.resources = {};
	WT.dashboard.resources.index = 0;
	WT.dashboard.resources.data = [];


	var params = {};
	params.token = WT.token;
	params.sort_field = WT.dashboard.params.sort.field;
	params.sort_direction = WT.dashboard.params.sort.direction;
	params.filter = WT.dashboard.params.filter;

	if(WT.dashboard.request)
		WT.dashboard.request.abort();

	WT.dashboard.request = http.get(WT.url+'all',params,function(response){

		$("[cw-container='dashboard']").html('');

		var series = 0;
		var manga = 0;

		$.map(response,function(resource,id){


			if(resource.type == 'series')
				series++;

			if(resource.type == 'manga')
				manga++;

			WT.dashboard.resources.data.push(resource);
			
		});

		$('#wt-library-count-all').html(series + manga);
		$('#wt-library-count-series').html(series);
		$('#wt-library-count-manga').html(manga);
		

		WT.dashboard.load();
		WT.dashboard.checkScroll();
	});



};

$('[wt-library-filter]').on('keyup',function(){
	WT.dashboard.params.filter = $(this).val();
	WT.dashboard.call();
});

$('[wt-library-sort]').on('click',function(){

	var direction = 'asc';

	if(WT.dashboard.params.sort.field == $(this).attr('wt-library-sort'))
		direction = WT.dashboard.params.sort.direction == 'asc' ? 'desc' : 'asc';

	WT.dashboard.params.sort.field = $(this).attr('wt-library-sort');
	WT.dashboard.params.sort.direction = direction;

	WT.dashboard.call();
});

WT.dashboard.updateHTML = function(){

	// Update HTML
	$('.wt-library-sort').hide();
	
	$("[wt-library-sort='"+WT.dashboard.params.sort.field+"']").find("[wt-library-sort-direction='"+WT.dashboard.params.sort.direction+"']").show();

}

WT.dashboard.checkScroll = function(){

	var win = $(window);

    if($(document).height() - win.height() - win.scrollTop() <= 600){

		WT.dashboard.loadData(WT.dashboard.resources);
	}
};


WT.dashboard.load = function(){

	var win = $(window);

	win.scroll(function(){

		WT.dashboard.checkScroll();
	});
	
	WT.dashboard.loadData(WT.dashboard.resources);

	WT.dashboard.updateHTML();

};

WT.dashboard.loadData = function(collection,max = 20){

	for(var i = collection.index, y = 0; i < collection.data.length && y < max; i++, y++){

		record = collection.data[i];

		if(typeof record !== "undefined" && record){

			var html = template.get("wt-dashboard-element",{
				resource:record
			});

			$("[cw-container='dashboard']").append(html);

			collection.index++;

		}

	};
};



$(document).ready(function(){

	WT.dashboard.call();
	

});