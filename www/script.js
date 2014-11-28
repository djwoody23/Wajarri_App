function sortValue(id)
{
	return function(a, b)
	{
		return a[id].toLowerCase().localeCompare(b[id].toLowerCase());
	};
}

function findValue(id, value)
{
	return function(a)
	{
		return a[id].toLowerCase().match(value.toLowerCase());
	};
}

var global =
{
	dictionary:
	{
		data: [],
		english: [],
		wajarri: [],
		
		init: function()
		{
			//ajax call to Json Database
			$.ajax({
				type:'GET',
				dataType:'json',
				async: false,
				url: "wajarriDic201114.json",
				success: this.setData,
				error: function(err) { console.log("It's broke: " + err); }
			});
		},
		
		setData: function(data)
		{
			console.log("loadDictionary");//: " + data);
			global.dictionary.data = data;
			for (var i = 0; i < global.dictionary.data.length; ++i)
			{
				var inf = global.dictionary.data[i];
				inf.id = i;
				
				global.dictionary.wajarri.push({ id: inf.id, text: inf.Wajarri });
				global.dictionary.english.push({ id: inf.id, text: inf.English });
			}

			global.dictionary.wajarri.sort(sortValue("text"));
			global.dictionary.english.sort(sortValue("text"));
		}
	},
	
	favourites:
	{
		items: [],
		
		init: function()
		{
			this.load();
		},
		
		load: function()
		{
			var data = window.localStorage.getItem("favourites");
			this.items = (data && data != "") ? JSON.parse(data) : [];
			console.log("Saved Favourites: " + JSON.stringify(this.items));
		},
		
		save: function()
		{
			window.localStorage.setItem("favourites", JSON.stringify(this.items));
		},

		clear: function()
		{
			window.localStorage.setItem("favourites", "[]");
			this.items = [];
		},
		
		add: function(index)
		{
			if (this.items.indexOf(index) == -1)
			{
				this.items.push(index);
			}
			
			this.save();
		},
		
		remove: function(index)
		{
			var id = this.items.indexOf(index);
			if (id != -1)
			{
				this.items.splice(id, 1);
			}
			
			this.save();
		},
		
		get: function()
		{
			var values = [];
			var items = this.items;
			
			for (var i = 0; i < items.length; ++i)
			{
				var inf = global.dictionary.data[items[i]];
				values.push({ id: inf.id, text: inf.Wajarri });
			}

			values.sort(sortValue("text"));
			
			return values;
		}
	},
		
	init: function()
	{
		this.dictionary.init();
		this.favourites.init();
	}
};

//Function supplied by Josh :-)
function searchFunction(info, id, value)
{
	if (value != $(id).data('search'))
	{
		//Array copy use .slice
		var vals = value.length ? info.filter(findValue("text", value)) : info;//.slice(0);
		
		$(id).data('search', value);
		$(id).megalist('setDataProvider', vals);
	}
}




//Megalist plugin Script to display list items	
function loadDictionaryValues(id, info)
{
	$(document).one("pageshow", '.page:has(' + id + ')', function ()
	{
		$(id).megalist('updateLayout');
	});
	
	function itemActivation(e)
	{
		$(id).megalist('clearSelectedIndex', e.selectedIndex);

		var item = $(e.srcElement.get());
		var child_id = item.find("span[data-id]").data("id");
		var index = parseInt(child_id);
		
		var target = $(e.originalEvent.target);
		if (target.data("remove"))
		{
			global.favourites.remove(index);
			favouritesShow();
		}
		else
		{
			//store the information in the next page's data
			$("#details-page").data("id", index);
			//change the page # to second page. 
			//Now the URL in the address bar will read index.html#details-page
			//where #details-page is the "id" of the second page
			//we're gonna redirect to that now using changePage() method
			$.mobile.changePage("#details-page");
		}
	}
	
	function listItemLabelFunction(item)
	{
		return 	'<span data-id="' + item.id + '">' + item.text + '</span>' +
				'<span data-remove="true" class="ui-btn-icon-notext ui-icon-delete">x</span>';
	}
	
	$(id).megalist();
	$(id).megalist('setLabelFunction', listItemLabelFunction);
	if (info)
	{
		$(id).megalist('setDataProvider', info);
	}

	//Change Event for list items to go to details page
	$(id).on("change", itemActivation);
	
	$(id).focus();
}

//English Page Script
function englishInit()
{
	loadDictionaryValues("#eng-list", global.dictionary.english);
	console.log("englishInit");
}

//Wajarri Page Script	
function wajarriInit()
{
	loadDictionaryValues("#waj-list", global.dictionary.wajarri);
	console.log("wajarriInit");
}

function favouritesInit()
{
	loadDictionaryValues("#fav-list", global.favourites.get());
	console.log("favouritesInit");
}

function favouritesShow()
{
	$("#fav-list").megalist('setDataProvider', global.favourites.get());
	console.log("favouritesShow");
}

function detailsInit()
{
	function nextprevious(diff)
	{
		var id = $("#details-page").data("id") + diff;
		if (id >= 0 && id < global.dictionary.data.length)
		{
			$("#details-page").data("id", id);
			detailsShow();
		}
	}
	
	function next()
	{
		nextprevious(1);
	}
	function previous()
	{
		nextprevious(-1);
	}

	function addFavourite()
	{
		global.favourites.add($("#details-page").data("id"));
	}
	
	$("#next").click(next);
	$("#prev").click(previous);
   	$("#detail-favourites-add").click(addFavourite);
}

function detailsShow()
{
    var id = $("#details-page").data("id");
    var info = global.dictionary.data[id];
	
	if (info == undefined)
		return;
	
   	$("#detail-audio").attr("src", info.sound);
   	$("#detail-wajarri").html(info.Wajarri);
    $("#detail-english").html(info.English);
    $("#detail-description").html(info.description);
    $("#detail-image").css("background-image", "url(" + info.image + ")");
	
	if (typeof(Media) !== 'undefined')	// FIX: Media UNDEFINED!
	{
		console.log("HAS MEDIA");

		var root_path = "/android_asset/www/";
		var path = root_path + $("#detail-audio").attr('src');
	
		function onError(error)
		{
			console.log("FAILED: " + path);
			console.log(JSON.stringify(error));
		}
		
		$("#detail-audio").data("media", new Media(path, undefined, onError));
		// Replaces the audio play function
		$("#detail-audio")[0].play = function () { $(this).data("media").play(); };
	}
}


//pagecreate event for each page
//triggers only once
$(document).on("pagecreate", "#english-page", englishInit);
$(document).on("pagecreate", "#wajarri-page" , wajarriInit);
$(document).on("pagecreate", "#details-page", detailsInit);
$(document).on("pagecreate", "#fav-page", favouritesInit);

//use pagebeforeshow
//DONT USE PAGEINIT! 
//the reason is you want this to happen every single time
//pageinit will happen only once
$(document).on("pageshow", "#fav-page" , favouritesShow);
$(document).on("pagebeforeshow", "#details-page", detailsShow);

//tap event for mobile devices All pages
$(function()
{
	function tapHandler(event)
	{
		$(event.target).addClass("tap");
	}

	global.init();
	
	var pages = $(".page");

	pages.bind("tap", tapHandler);

	for (var i = 0; i < pages.length; ++i)
	{
		$.mobile.loadPage("#" + pages[i].id, { showLoadMsg: false } );
	}
});
