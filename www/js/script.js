
var loading =
{
	showing: true,
	id: "#loading",
	container: undefined,
	show: function()
	{
		loading.showing = true;
		$(loading.id).show();
	},
	hide: function()
	{
		$(loading.id).hide();
		loading.showing = false;
	},
	init: function(id)
	{
    	this.container = $(id);

    	function pre(e, data)
		{
			if (loading.showing) { return; }

		    var to = data.toPage;

		    if (typeof to === 'string')
		    {
	            e.preventDefault();
                e.stopPropagation();

	        	loading.show();

		        var u = $.mobile.path.parseUrl(to);
		        var page_id = u.hash || "#";//u.pathname;

				if (page_id)
			    {
			    	var container = loading.container;
					//console.log("Loading: " + page_id);
					setTimeout(function()
					{
						//console.log(data);
						//$.mobile.navigate(page_id);
						container.pagecontainer("change", page_id, data.options);
					}, 5);
				}
		    }
		}

		function post(e, data)
	    {
		    /*var page_id = loading.container.pagecontainer("getActivePage")[0].id;
		    if (page_id)
		    {
			    console.log("Loaded:  #" + page_id);
			}*/

	    	loading.hide();
	    }

		this.container.on('pagebeforechange', pre);

		this.container.on('pagechange', post);
	}
};


function changepage(id, data, opts)
{
    $("body").pagecontainer("change", id + (data ? "?" + $.param(data) : ""), opts);
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

	function onChange(e)
	{
		var target = $(e.target);
		var item = target.closest("li");

		if (target.data("remove"))
		{
			var index = parseInt(item.data("id"));
			info.remove(index);
			favouritesShow();
		}
		else
		{
	        changepage("#details-page", { id: item.data("index"), dictionary: info.id });
		}
	}

    list.on("click tap", "li", onChange);

	updateList(id, info.get(), label, collapsible);
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
	loadDictionaryValues("#fav-list", global.dictionary.favourites, favouritesLabel);
}

function favouritesShow()
{
	updateList("#fav-list", global.dictionary.favourites.get(), favouritesLabel);
}


var handlers =
{
	"details-page":
	{
		_update: function(history)
		{
			var details = $("#details-page");

			var iterator = details.data("iterator");
			if (iterator)
			{
				var id = iterator.current().id;
				var info = global.dictionary.data[id];
				if (info)
				{
					$("#detail-audio").attr("src", global.directories.audio(info.sound));

					details.find("#detail-wajarri").html(info.Wajarri);
					details.find("#detail-english").html(info.English);
					details.find("#detail-description").html(info.description);
					details.find("#detail-image").css("background-image", "url(\"" + global.directories.image_dictionary(info.image) + "\")");
				}
				details.find('.ui-btn-active').removeClass('ui-btn-active');

				if (!history)
				{
					$.mobile.navigate.navigator.squash("#details-page?id=" + id + "&dictionary=" + details.data("dictionary"));
				}
			}
		},

		pagecreate: function(url, hash, query, data)
		{
			var self = handlers["details-page"];

			function iteratorCheck(cb)
			{
				return function ()
				{
					var iterator = $("#details-page").data("iterator");
					if (iterator)
					{
						cb(iterator);
					}
				};
			}

			function next(iterator)
			{
				if (iterator.next())
				{
					self._update(false);
				}
			}
			function previous(iterator)
			{
				if (iterator.previous())
				{
					self._update(false);
				}
			}
			function addFavourite(iterator)
			{
				if (iterator.current())
				{
					global.dictionary.favourites.add(iterator.current().id);
				}
			}

			$("#next").click(iteratorCheck(next));
			$("#prev").click(iteratorCheck(previous));
			$("#detail-favourites-add").click(iteratorCheck(addFavourite));
		},
		pagebeforeshow: function(url, hash, query, data)
		{
			if (!query.dictionary)
			{
				alert("ERROR");
				return;
			}

			var details = $("#details-page");
			var iterator = details.data("iterator");
			if (!iterator || details.data("dictionary") != query.dictionary)
			{
				var index = parseInt(query.id);

				var dict = global.dictionary[query.dictionary];
				var iterator = dict.iterator(index);

				details.data("dictionary", query.dictionary);
				details.data("iterator", iterator);
			}

			handlers["details-page"]._update(true);
		},
		pagebeforehide: function(url, hash, query, data)
		{
			var details = $("#details-page");
			details.data("iterator", null);
			$("#detail-audio")[0].pause();
		}
	}
};

function createHandlerRegex(id)
{
	return "^#" + id + "([/][^?]*)?[?]?(.*)?$";
};

function createHandler(id)
{
	var page_handler = handlers[id];
	if (!page_handler)
	{
		console.log("[DEFAULT] Missing Page Handler: " + id);
		return function () { console.log("[DEFAULT] Missing Page Handler: " + id); };
	}

	return function (type, match, ui, page, e)
	{
		var handler = page_handler[type];
		if (handler)
		{
			//console.log(match);
			var url = match[0];
			var hash = match[1];
			var query = match[2];
			
			if (hash)
			{
				hash = hash.split('/');
			}

			if (query)
			{
				query = query.split('&').reduce(
					function(o, v, i)
					{
						var items = v.split('=');
						o[items[0]] = items[1];
						return o;
					},
					{}
				);
			}

			handler(url, hash, query, { type: type, match: match, ui: ui, page: page, e: e });
		}
		else
		{
			console.log("[DEFAULT] Missing Event Handler: " + id + "." + type);
		}
	};
};

var routers = {};

routers[createHandlerRegex("details-page")] =
{
	handler: createHandler("details-page"),
	events: "c,bs,bh"
};


$(document).ready(
	function()
	{
		var $pages = $("body");
		loading.init($pages);

		function onReady()
		{
	        global.dictionary.get(
	        	function ()
				{
				    $pages.pagecontainer({ defaults: true });

				    //pagecreate event for each page (triggers only once)
				    $pages.on("pagecreate", "#english-page", englishInit);

				    $pages.on("pagecreate", "#wajarri-page", wajarriInit);

				    $pages.on("pagecreate", "#fav-page", favouritesInit);
				    $pages.on("pagebeforeshow", "#fav-page", favouritesShow);

				    //$pages.on("pagecreate", "#details-page", detailsInit);
				    //$pages.on("pagebeforeshow", "#details-page", detailsShow);
				    //$pages.on("pagebeforehide", "#details-page", detailsHide);

					var router = new $.mobile.Router(routers);

			        var pages = $(".page");

					console.log("[DEFAULT] Loading Pages");
			        pages.each(function(i, el) { $.mobile.loadPage("#" + el.id, { showLoadMsg: false }); });
					console.log("[DEFAULT] Loaded " + pages.length + " pages");

					$.mobile.initializePage();

			    	loading.hide();
				}
			);
		}

	    document.addEventListener("deviceready", onReady, false);
	}
);