

function checkAudio(id)
{
	if (typeof(Media) !== 'undefined') // FIX: Media UNDEFINED!
	{
		console.log("HAS MEDIA");

		if (!$(id).data("media"))
		{
			$(id)[0].play = function()
			{
				$(this).data("media").play();
			};
		}

        function getMediaURL(s)
        {
            if(device.platform.toLowerCase() === "android")
            {
                return "/android_asset/www/" + s;
            }
            return s;
        }

		var path = getMediaURL($(id).attr('src'));

		function onError(error)
		{
			console.log("[ERROR] Failed to load/play \"" + path + "\".\n" + JSON.stringify(error));
		}
		$(id).data("media", new Media(path, undefined, onError));
	}
}

function updateList(id, info, label)
{
	var collapsible = true;
	var collapsibleset = false;


	function make(item)
	{
		return '<li class="ui-btn" data-filtertext="' + item.text.toLowerCase() + '" data-id="' + item.id + '">' + label(item) + '</li>';
	}

	var list = $(id);
	list.hide();

	list.empty();

	if (collapsible)
	{
		list.attr("data-filter", true);
		list.attr("data-children", "> div, > div div ul li");
		list.attr("data-input", id + "-search");
		list.attr("data-inset", true);
		//list.attr("data-enhanced", true);

		for (var i = 0; i < info.length; i++)
		{
			var item = info[i];

			var alpha = item.text.slice(0, 1).toUpperCase();
			if (alpha.match(/[0-9]/))
			{
				alpha = '#';
			}

			var div = list.find("div[data-group='" + alpha + "']");
			var ul;

			if (div.length)
			{
				ul = div.find("ul");
			}
			else
			{
				div = $('<div />',
				{
					'data-role': 'collapsible',
					'data-filtertext': alpha.toLowerCase(),

					'data-collapsed': true,
					'data-inset': true,
					'data-collapsed-icon':"carat-d",
					'data-expanded-icon':"carat-u",
					'data-group': alpha
				});
				//div.attr("data-input", id + "-search");
				//div.attr("data-filter", true);
				var h3 = $('<h3 />').html(alpha);
				ul = $('<ul />',
				{
					'data-role': 'listview',
					'data-inset': false
				});
				//ul.attr("data-input", id + "-search");
				//ul.attr("data-filter", true);
				div.append(h3);
				div.append(ul);
				list.append(div);
			}
	
			var ftext = div.attr('data-filtertext') + ' ' + item.text.toLowerCase();
			div.attr('data-filtertext', ftext);

			ul.append(make(item));
		}

		list.find("[data-role='collapsible']").collapsible();
		list.find("[data-role='listview']").listview();
		if (collapsibleset)
		{
			list.attr("data-role", 'collapsible-set');
			list.collapsibleset();
		}
		list.filterable();

		list.show();
	}
	else
	{
		var ul = $('<ul />',
		{
			'data-role': 'listview',
			'data-inset': true,
			'data-input': id + "-search",
			'data-filter': true
		});
		list.append(ul);

		var data = '';
		for (var i = 0; i < info.length; i++)
		{
			data += make(info[i]);
		}

		ul.html(data);
		ul.listview();
	}

	list.show();
}

//Megalist plugin Script to display list items
function loadDictionaryValues(id, info, label, onchange)
{
	var list = $(id);

	list.addClass('new-list');

	updateList(id, info, label);

    list.on("click tap", "li", onchange);
}

function dictionaryLabel(item)
{
	return item.text;
}

function favouritesLabel(item)
{
	return dictionaryLabel(item) + '<span data-remove="true" class="new-list-remove ui-btn-icon-notext ui-icon-delete">x</span>';
}

function dictionaryOnChange(e)
{
   	//$("body").find(".ui-loader").css("display", "block !important");
	var item = $(e.target).closest("li");

	var child_id = item.data("id");
	var index = parseInt(child_id);

	//store the information in the next page's data
	$("#details-page").data("id", index);
	//change the page # to second page. 
	//Now the URL in the address bar will read index.html#details-page
	//where #details-page is the "id" of the second page
	//we're gonna redirect to that now using changePage() method
    $("body").pagecontainer("change", "#details-page")//, { data: { id: index } });
}

function favouritesOnChange(e)
{
   	//$("body").find(".ui-loader").css("display", "block !important");
	var item = $(e.target).closest("li");
	var target = $(e.target);

	var child_id = item.data("id");
	var index = parseInt(child_id);

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
        $("body").pagecontainer("change", "#details-page");//, { data: { id: index } });
	}
}

//English Page Script
function englishInit()
{
	loadDictionaryValues("#eng-list", global.dictionary.english, dictionaryLabel, dictionaryOnChange);
}
//Wajarri Page Script   
function wajarriInit()
{
	loadDictionaryValues("#waj-list", global.dictionary.wajarri, dictionaryLabel, dictionaryOnChange);
}

function favouritesInit()
{
	loadDictionaryValues("#fav-list", global.favourites.get(), favouritesLabel, favouritesOnChange);
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

	function next() { nextprevious(1); }
	function previous() { nextprevious(-1); }

	function addFavourite()
	{
		global.favourites.add($("#details-page").data("id"));
	}

	$("#next").click(next);
	$("#prev").click(previous);
	$("#detail-favourites-add").click(addFavourite);
}


function favouritesShow()
{
	updateList("#fav-list", global.favourites.get(), favouritesLabel);
}

function detailsShow()
{
	var id = $("#details-page").data("id");
	var info = global.dictionary.data[id];
	if (info)
	{
		$("#detail-wajarri").html(info.Wajarri);
		$("#detail-english").html(info.English);
		$("#detail-description").html(info.description);
		$("#detail-image").css("background-image", "url(" + "images/dictionary/" + info.image + ")");
		$("#detail-audio").attr("src", "audio/" + info.sound);

		checkAudio("#detail-audio");
	}
}



$(document).ready(function()
{
    $.mobile.defaultPageTransition = 'none';
    $.mobile.defaultDialogTransition = 'none';


    var $pages = $("body");
    $pages.pagecontainer({ defaults: true });

    /*$pages.on("pagecreate pagebeforehide pagehide pagebeforechange pagechange pagebeforeshow pageshow", function(event, ui)
    {
        console.log(event.type + ": " + event.target.id);
    });*/

    $pages.on("pagecreate", ".page", function(event, ui)
    {
        console.log(event.type + ": " + event.target.id);
    });

    $pages.on("pagebeforechange", function(event, ui)
    {
        console.log(event.type + ": " + event.target.id);
        //if (navigator.splashscreen)
		//	navigator.splashscreen.show();
    	$("#loading").show();
    });

    $pages.on("pagechange", function(event, ui)
    {
        console.log(event.type + ": " + event.target.id);
    	$("#loading").hide();
    	//if (navigator.splashscreen)
		//	navigator.splashscreen.hide();
    });

    //pagecreate event for each page
    //triggers only once
    $pages.on("pagecreate", "#english-page", englishInit);
    $pages.on("pagecreate", "#wajarri-page", wajarriInit);
    $pages.on("pagecreate", "#details-page", detailsInit);
    $pages.on("pagecreate", "#fav-page", favouritesInit);
    //use pagebeforeshow
    //DONT USE PAGEINIT! 
    //the reason is you want this to happen every single time
    //pageinit will happen only once
    $pages.on("pagebeforeshow", "#fav-page", favouritesShow);
    $pages.on("pagebeforeshow", "#details-page", detailsShow);

	function onReady()
	{
		console.log("onReady");
        var pages = $(".page");
        for (var i = 0; i < pages.length; ++i)
        {
            $.mobile.loadPage("#" + pages[i].id,
            {
                showLoadMsg: false
            });
        }

		$("#loading").hide();
	}

	if (typeof(window.cordova) !== 'undefined')
	{
		console.log("USING CORDOVA");

		function onDeviceReady()
		{
	        if (device.platform.toLowerCase() === "ios")
	        {
	           	StatusBar.overlaysWebView(false);
	            StatusBar.styleLightContent();
	           	StatusBar.backgroundColorByName("black");
	        }

			onReady();
			navigator.splashscreen.hide();
		}
		document.addEventListener("deviceready", onDeviceReady);
	}
	else
	{
		$(document).ready(onReady);
	}
});
