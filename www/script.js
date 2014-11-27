$( document ).on( "mobileinit", function() {
  $.mobile.loader.prototype.options.text = "loading";
  $.mobile.loader.prototype.options.textVisible = true;
  $.mobile.loader.prototype.options.theme = "a";
  $.mobile.loader.prototype.options.html = "";
});

var global =
{
	dictionary:
	{
		data: [],
		english: [],
		wajarri: [],
		
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
			
			function sort(a, b)
			{
				return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
			}

			global.dictionary.wajarri.sort(sort);
			global.dictionary.english.sort(sort);
		},
		
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
		}
	},
	
	favourites:
	{
		items: [],
		
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
		
		init: function()
		{
			this.load();
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
		
		get: function()
		{
			var values = [];
			var items = this.items;
			
			for (var i = 0; i < items.length; ++i)
			{
				var inf = global.dictionary.data[items[i]];
				values.push({ id: inf.id, text: inf.Wajarri });
			}

			values.sort(function(a, b)
			{
				return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
			});
			
			return values;
		}
	},
	
	/*recent:
	{
		maxlength: 20,
		items: [],
		
		load: function()
		{
			var data = window.localStorage.getItem("recent");
			this.items = (data && data != "") ? JSON.parse(data) : [];
		},
		
		save: function()
		{
			window.localStorage.setItem("recent", JSON.stringify(this.items));
			console.log(window.localStorage.getItem("recent"));
		},
		
		init: function()
		{
			this.load();
			console.log(window.localStorage.getItem("recent"));
		},
		
		add: function(index)
		{
			this.load();
			
			if (this.items.length >= this.maxlength)
			{
				this.items = this.items.slice(1, global.favourites.maxlength);
			}
			
			this.items.push(index);
			
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

			values.sort(function(a, b)
			{
				return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
			});
			
			return values;
		}
	},*/
		
	init: function()
	{
		this.dictionary.init();
		this.favourites.init();
	}
};

//Function supplied by Josh :-)
function searchFunction(info, id, value)
{
	if (value == $(id).data('search'))
		return;
	
	var func = function (i)
	{
		return i.text.toLowerCase().match(value.toLowerCase());
	};
	
	//Array copy use .slice
	var vals = value.length ? info.filter(func) : info;//.slice(0);
	
	$(id).data('search', value);
	$(id).megalist('setDataProvider', vals);
}




//Megalist plugin Script to display list items	
function loadDictionaryValues(info, page, id)
{
	$(document).on("pageshow", page, function ()
	{
		$(id).megalist('updateLayout');
	});
		
	function itemActivation(e)
	{
		var item = $(e.srcElement.get());
		var child = item.find("span[data-id]").data("id");
		var index = parseInt(child);
		
		var target = $(e.originalEvent.target);
		if (target.data("remove"))
		{
			console.log("REMOVE - " + index);
		}
		else
		{
			//store the information in the next page's data
			var data = global.dictionary.data[index];
			$("#details-page").data("info", data);
			//change the page # to second page. 
			//Now the URL in the address bar will read index.html#details-page
			//where #details-page is the "id" of the second page
			//we're gonna redirect to that now using changePage() method
			$(id).megalist('clearSelectedIndex', e.selectedIndex);
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
	$(id).megalist('setDataProvider', info);

	//Change Event for list items to go to details page
	$(id).on("change", itemActivation);
	
	$(id).focus();
}

//English Page Script
function englishInit()
{
	loadDictionaryValues(global.dictionary.english, "#english-page", "#eng-list");
	console.log("englishInit");
}

//Wajarri Page Script	
function wajarriInit()
{
	loadDictionaryValues(global.dictionary.wajarri, "#wajarri-page", "#waj-list");
	console.log("wajarriInit");
}

function favouritesShow()
{
	loadDictionaryValues(global.favourites.get(), "#fav-page", "#fav-list");
	console.log("favouritesShow");
}

function detailsInit()
{
	function nextprevious(diff)
	{
		var id = $("#details-page").data("info").id + diff;
		if (id >= 0 && id < global.dictionary.data.length)
		{
			var data = global.dictionary.data[id];
			
			$("#details-page").data("info", data);
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
		global.favourites.add($("#details-page").data("info").id);
	}
	
	$("#next").click(next);
	$("#prev").click(previous);
   	$("#detail-favourites-add").click(addFavourite);

   	$("#detail-audio").data("media", "");
}

function detailsShow()
{
    var info = $("#details-page").data("info");
	
	if (info == undefined)
		return;
	
   	$("#detail-audio").attr("src", info.sound);
   	$("#detail-wajarri").html(info.Wajarri);
    $("#detail-english").html(info.English);
    $("#detail-description").html(info.description);
    $("#detail-image").css("background-image", "url(" + info.image + ")");
	
	var Media = window.Media;
	if (typeof(Media) !== 'undefined')	// FIX: Media UNDEFINED!
	{
		var root_path = "/android_asset/www/";
		var path = root_path + $("#detail-audio").attr('src');
	
		function onSuccess()
		{
			console.log("PLAYING: " + path);
		}  
		function onError(error)
		{
			console.log("FAILED: " + path);
			console.log(JSON.stringify(error));
		}
		
		$("#detail-audio").data("media", new Media(path, onSuccess, onError));

		/*$("#play").on("click", function(e)
		{
			e.preventDefault();
			console.log("PLAY PRESSED");
			$("#detail-audio").data("media").play();
			return false;
		});*/

		$("#play")[0].click = function(e)
		{
			console.log("PLAY PRESSED");
			$("#detail-audio").data("media").play();
		};
	}
	
	//console.log(JSON.stringify(play.offset()) + " - " + play.width() + " x " + play.height());
}


//pagecreate event for each page
//triggers only once
$(document).on("pagecreate", "#english-page", englishInit);
$(document).on("pagecreate", "#wajarri-page" , wajarriInit);
$(document).on("pagecreate", "#details-page", detailsInit);

//use pagebeforeshow
//DONT USE PAGEINIT! 
//the reason is you want this to happen every single time
//pageinit will happen only once
$(document).on("pagebeforeshow", "#fav-page" , favouritesShow);
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




