

function checkAudio(id)
{
	if (typeof(Media) !== 'undefined') // FIX: Media UNDEFINED!
	{
		//console.log("HAS MEDIA");

		var audio = $(id)[0];
		if (!$(id).data("media"))
		{
			audio.play = function()
			{
				//console.log("Playing " + $(this).data("media").src);
				$(this).data("media").play();
			};

			audio.pause = function()
			{
				//console.log("Pausing " + $(this).data("media").src);
				$(this).data("media").pause();
			};

			/*audio.stop = function()
			{
				//console.log("Stopping " + $(this).data("media").src);
				$(this).data("media").stop();
			};*/
		}
		else
		{
			audio.pause();
		}

        function getMediaURL(s)
        {
            if (device.platform.toLowerCase() === "android")
            {
                return "/android_asset/www/" + s;
            }
            return s;
        }

		var path = getMediaURL($(id).attr('src'));


		function onError(error)
		{
			if (error && error.code)
			{
				console.log("[ERROR] Failed to load/play \"" + path + "\" (" + error.code + ").");
			}
		}

		function onStatus(value)
		{
			console.log("Status update \"" + path + "\". " + JSON.stringify(value));
		}

		console.log("Audio: \"" + path + "\"");
		$(id).data("media", new Media(path, undefined, onError));
	}
}

function updateList(id, info, label, collapsible)
{
	var collapsibleset = false;
	collapsible = (collapsible == undefined) ? false : collapsible;

	function make(item)
	{
		return '<li \
			class="ui-btn" \
			data-filtertext="' + item.text.toLowerCase() + '" \
			data-id="' + item.id +	'" \
			data-index="' + item.index + '">' +
				label(item) +
			'</li>';
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
				var h3 = $('<h3 />').html(alpha);
				ul = $('<ul />',
				{
					'data-role': 'listview',
					'data-inset': false
				});
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
function loadDictionaryValues(id, info, label, collapsible)
{
	var list = $(id);

	list.addClass('new-list');

	updateList(id, info.get(), label, collapsible);

	function onChange(e)
	{
		var item = $(e.target).closest("li");

		if ($(e.target).data("remove"))
		{
			var index = parseInt(item.data("id"));
			info.remove(index);
			favouritesShow();
		}
		else
		{
			var index = parseInt(item.data("index"));
			//store the information in the next page's data
			$("#details-page").data("iterator", info.iterator(index));
			//change the page # to second page. 
			//Now the URL in the address bar will read index.html#details-page
			//where #details-page is the "id" of the second page
			//we're gonna redirect to that now using changePage() method
	        $("body").pagecontainer("change", "#details-page");//, { data: { id: index } });
		}
	}

    list.on("click tap", "li", onChange);
}

function dictionaryLabel(item)
{
	return item.text;
}

function favouritesLabel(item)
{
	return dictionaryLabel(item) +
		'<span data-remove="true" class="new-list-remove ui-btn-icon-notext ui-icon-delete">x</span>';
}


//English Page Script
function englishInit()
{
	loadDictionaryValues("#eng-list", global.dictionary.english, dictionaryLabel, global.settings.collapsible_list);
}

//Wajarri Page Script
function wajarriInit()
{
	loadDictionaryValues("#waj-list", global.dictionary.wajarri, dictionaryLabel, global.settings.collapsible_list);
}


function favouritesInit()
{
	loadDictionaryValues("#fav-list", global.favourites, favouritesLabel);
}

function favouritesShow()
{
	updateList("#fav-list", global.favourites.get(), favouritesLabel);
}


function detailsInit()
{
	function next()
	{
		var iterator = $("#details-page").data("iterator");
		if (iterator && iterator.next())
		{
			detailsShow();
		}
	}
	function previous()
	{
		var iterator = $("#details-page").data("iterator");
		if (iterator && iterator.previous())
		{
			detailsShow();
		}
	}
	function addFavourite()
	{
		var iterator = $("#details-page").data("iterator");
		if (iterator && iterator.current())
		{
			global.favourites.add(iterator.current().id);
		}
	}

	$("#next").click(next);
	$("#prev").click(previous);
	$("#detail-favourites-add").click(addFavourite);
}

function detailsShow()
{
	var details = $("#details-page");
	var iterator = details.data("iterator");
	if (iterator)
	{
		var id = iterator.current().id;
		var info = global.dictionary.data[id];
		if (info)
		{
			details.find("#detail-audio").attr("src", global.directories.audio(info.sound));
			checkAudio("#detail-audio");

			details.find("#detail-wajarri").html(info.Wajarri);
			details.find("#detail-english").html(info.English);
			details.find("#detail-description").html(info.description);
			details.find("#detail-image").css("background-image", "url(" + global.directories.image_dictionary(info.image) + ")");
		}
		details.find('.ui-btn-active').removeClass('ui-btn-active');
	}
}

function detailsHide()
{
	$("#detail-audio")[0].pause();
}


var loading =
{
	showing: true,
	id: "#loading",
	show: function(page_id)
	{
		this.showing = true;
		$(this.id).show();
		if (page_id)
	    {
			//console.log("Loading: " + page_id);
			setTimeout(function()
			{
				$("body").pagecontainer("change", page_id);
			}, 50);
		}
	},
	hide: function()
	{
	    var page_id = $("body").pagecontainer("getActivePage")[0].id;
	    if (page_id)
	    {
		    console.log("Loaded:  #" + page_id);
		}
		$(this.id).hide();
		this.showing = false;
	}
};




$(document).ready(function()
{
    $.mobile.defaultPageTransition = 'none';
    $.mobile.defaultDialogTransition = 'none';


    var $pages = $("body");
    $pages.pagecontainer({ defaults: true });


	$pages.on('pagebeforechange', function(e, data)
	{
	    var to = data.toPage;

	    if (typeof to === 'string' && !loading.showing)
	    {
            e.preventDefault();

	        var u = $.mobile.path.parseUrl(to);
	        to = u.hash || u.pathname;

        	loading.show(to);
	    }
	});

	$pages.on("pagechange", function(e, data)
    {
    	loading.hide();
    });

    //pagecreate event for each page (triggers only once)
    $pages.on("pagecreate", "#english-page", englishInit);

    $pages.on("pagecreate", "#wajarri-page", wajarriInit);

    $pages.on("pagecreate", "#fav-page", favouritesInit);
    $pages.on("pagebeforeshow", "#fav-page", favouritesShow);

    $pages.on("pagecreate", "#details-page", detailsInit);
    $pages.on("pagebeforeshow", "#details-page", detailsShow);
    $pages.on("pagebeforehide", "#details-page", detailsHide);

	function onReady()
	{
		console.log("onReady");

        var pages = $(".page");
        for (var i = 0; i < pages.length; ++i)
        {
        	var id = "#" + pages[i].id;
        	console.log("Initializing: " + id);
            $.mobile.loadPage(id, { showLoadMsg: false });
        }

    	loading.hide();
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
