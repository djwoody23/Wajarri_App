
var loading =
{
	showing: true,
	id: "loading",
	container: undefined,
	show: function()
	{
		loading.showing = true;
		$('#' + loading.id).show();
	},
	hide: function()
	{
		$('#' + loading.id).hide();
		loading.showing = false;
	},
	install: function()
	{
		if ($(this.id).length == 0)
		{
        	$('body').prepend('<div id="' + this.id + '" class="fixed-dock"><div class="ui-icon-loading dock"></div></div>');
		}
	},
	init: function(id)
	{
    	this.container = $(id);

    	function pre(e, data)
		{
			//if (loading.showing) { return; }

        	loading.show();

			/*setTimeout(function()
			{
	        	loading.show();
			}, 5);

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
		    }*/
		}

		function post(e, data)
	    {
		    /*var page_id = loading.container.pagecontainer("getActivePage")[0].id;
		    if (page_id)
		    {
			    console.log("Loaded:  #" + page_id);
			}*/

	    	setTimeout(function()
			{
	        	loading.hide();
			}, 5);
	    }

		this.container.on('pagebeforechange', pre);
		this.container.on('pageshow', post);
	}
};

$(document).ready(function () { loading.install(); });



var ListPage = function(list_id, dictionary, opts)
{
	this.actions = {};
	this.opts =
	{
		collapsible: false,
		collapsibleset: false,
		label: function (item) { return item.text; }
	};
	$.extend(this.opts, opts);

	this.list_id = list_id;
	this.dictionary = dictionary;
};

ListPage.prototype.onSelect = function (item, target)
{
	var action = target.data("action");
	var action_func = (action && this.actions[action]) || this.actions.default || empty();
	action_func(item, target, this);
};

ListPage.prototype.onChange = function (e)
{
	var target = $(e.target);
	var item = target.closest("li");
	this.onSelect(item, target);
};

ListPage.prototype.initialize = function(update)
{
	var self = this;

	this.list = $(this.list_id);
	this.list.addClass('new-list');
    this.list.on("tap", "li", this.onChange.bind(this));

    if (update)
    {
		this.update();
    }
};

ListPage.prototype.update = function ()
{
	var label = this.opts.label || empty();
	var collapsibleset = this.opts.collapsibleset;
	var collapsible = this.opts.collapsible;

	function make(item)
	{
		return '<li \
			class="ui-btn" \
			data-filtertext="' + item.text.toLowerCase() + '" \
			data-id="' + item.id + '">' +
				label(item) +
			'</li>';
	}

	var list = this.list;
	//list.hide();

	list.empty();

	if (collapsible)
	{
		function separateAlpha(array)
		{
			var items = {};
			for (var i = 0; i < array.length; i++)
			{
				var item = array[i];

				var alpha = item.text.slice(0, 1).toUpperCase();
				if (alpha.match(/[0-9]/))
				{
					alpha = '#';
				}

				if (!items[alpha])
				{
					items[alpha] = [];
				}

				items[alpha].push(i);
			}
			return items;
		}

		function createCollapsibleListGroup(alpha, ftext, items)
		{
			var div = '<div \
				data-role="collapsible" \
				data-collapsed=true \
				data-inset=true \
				data-collapsed-icon="carat-d" \
				data-expanded-icon="carat-u" \
				data-filtertext="' + (alpha.toLowerCase() + ftext) + '" ' +
				"data-group='" + alpha + "''>" +
					'<h3>' + alpha + '</h3>' +
					'<ul data-role="listview" data-inset=false>' +
						items +
					'</ul>' +
				"</div>";

			return div;
		}

		function createCollapsibleListHtml(info)
		{
			var items = separateAlpha(info);
			var html = "";

			for (var alpha in items)
			{
				var items_a = items[alpha];
				var ftext = "";
				var list_html = "";

				for (var i = 0; i < items_a.length; i++)
				{
					var item = info[items_a[i]];
					ftext += ' ' + item.text.toLowerCase();
					list_html += make(item);
				}

				html += createCollapsibleListGroup(alpha, ftext, list_html);
			}

			return html;
		}

		var html = createCollapsibleListHtml(this.dictionary.get());

		list.attr(
		{
			'data-role': collapsibleset ? 'collapsible-set' : undefined,
			'data-children': '> div, > div div ul li',
			'data-input': this.list_id + "-search",
			'data-inset': true,
			'data-filter': true
		});

		list.html(html);
		//list.enhanceWithin();
		//list.find("[data-role='listview']").listview();
		//list.find("[data-role='collapsible']").collapsible();
		//list.filterable();
	}
	else
	{
		var ul = $('<ul />',
		{
			'data-role': 'listview',
			'data-children': '> ul li',
			'data-input': this.list_id + "-search",
			'data-inset': true,
			'data-filter': true
		})
		.html(this.dictionary.get().reduce(function(p, c) { return p + make(c); }, ""));
		//.listview();
		list.append(ul);
	}

	//list.show();
}


function label_default(item)
{
	return item.text + '<span class="new-list-go ui-btn-icon-notext ui-icon-carat-r">\></span>';
};

function label_remove(item)
{
	return '<span data-action="remove" class="new-list-remove ui-btn-icon-notext ui-icon-delete">x</span>' + label_default(item);
};

function list_action_default(item, target, list)
{
	changePage("#details-page", { id: item.data("id"), dictionary: list.dictionary.id });
}

function list_action_remove(item, target, list)
{
	//item.remove();	// ISSUE: Doesn't update ui-first-child/ui-last-child for border rounding
	list.dictionary.remove(parseInt(item.data("id")));
	list.update();
}


var WajarriList = new ListPage("#waj-list", global.dictionary.wajarri, { collapsible: true, label: label_default });
WajarriList.actions.default = list_action_default;


var EnglishList = new ListPage("#eng-list", global.dictionary.english, { collapsible: true, label: label_default });
EnglishList.actions.default = list_action_default;

var FavouriteList = new ListPage("#fav-list", global.dictionary.favourites, { collapsible: false, label: label_remove });
FavouriteList.actions.default = list_action_default;
FavouriteList.actions.remove = list_action_remove;


var InfoPage = function(id)
{
	this.id = id;
	this.iterator = null;
	this.dictionary = null;
};

InfoPage.prototype.uninitialize = function ()
{
	this.iterator = null;
	this.dictionary = null;
	var audio = this.page.find("#detail-audio")[0];
	audio.pause && audio.pause();
};

InfoPage.prototype.initialize = function()
{
	this.page = $(this.id);
	var self = this;

	function iteratorCheck(cb)
	{
		return function ()
		{
			var iterator = self.iterator;
			if (iterator && iterator instanceof Iterator)
			{
				cb(iterator);
			}
		};
	}

	function next(iterator)
	{
		if (iterator.next())
		{
			self.update(false);
		}
	}
	function previous(iterator)
	{
		if (iterator.previous())
		{
			self.update(false);
		}
	}
	function addFavourite(iterator)
	{
		if (iterator.current())
		{
			global.dictionary.favourites.add(iterator.current().id);
		}
	}

	this.page.find("#next").on("tap", iteratorCheck(next));
	this.page.find("#prev").on("tap", iteratorCheck(previous));
	this.page.find("#detail-favourites-add").on("tap", iteratorCheck(addFavourite));

	this.page.find("#detail-audio-play").on("tap",
		function ()
		{
			var audio = self.page.find("#detail-audio")[0];
			audio.play && audio.play();
		}
	);
};

InfoPage.prototype.setId = function (id)
{
	var details = this.page;

	var info = global.dictionary.data[id];
	if (info)
	{
		details.find("#detail-audio").attr("src", global.directories.audio(info.sound));
		details.find("#detail-wajarri").html(info.Wajarri);
		details.find("#detail-english").html(info.English);
		details.find("#detail-description").html(info.description);
		details.find("#detail-image").css("background-image", "url(\"" + global.directories.image_dictionary(info.image) + "\")");
	}
	details.find('.ui-btn-active').removeClass('ui-btn-active');
}

InfoPage.prototype.update = function (use_query)
{
	var details = this.page;

	var updateQuery = false;

	if (use_query || !this.iterator)
	{
		var query = parseHash().query || {};
		if (!query.dictionary || !global.dictionary[query.dictionary])
		{
			query.dictionary = "wajarri";
			updateQuery = true;
		}
		if (!query.id)
		{
			query.id = 0;
			updateQuery = true;
		}
		else
		{
			query.id = parseInt(query.id);
		}

		if (this.dictionary != query.dictionary)
		{
			this.dictionary = query.dictionary;
			var dict = global.dictionary[query.dictionary];
			this.iterator = dict.iterator(dict.getIndex(query.id));

			if (this.iterator.current().id != query.id)
			{
				updateQuery = true;
			}
		}
		else if (this.iterator.current().id != query.id)
		{
			this.iterator.set(query.id);
		}
	}
	else
	{
		updateQuery = true;
	}

	var id = this.iterator.current().id;
	var dictionary = this.dictionary;
	
	if (updateQuery)
	{
		replacePage(this.id, { id: id, dictionary: dictionary });
	}

	this.setId(id);
}

var DetailPage = new InfoPage("#details-page");


var handlers =
{
	".page":
	{
		pagebeforecreate: function(e)
		{
			loadDelayedImages(e.currentTarget);
		}
	},
	"#wajarri-page":
	{
		pagebeforecreate: function()
		{
			WajarriList.initialize(true);
		}
	},
	"#english-page":
	{
		pagebeforecreate: function()
		{
			EnglishList.initialize(true);
		}
	},
	"#fav-page":
	{
		pagebeforecreate: function()
		{
			FavouriteList.initialize();
		},
		pagebeforeshow: function()
		{
			FavouriteList.update();
		}
	},
	"#details-page":
	{
		pagebeforecreate: function()
		{
			DetailPage.initialize();
		},
		pagebeforeshow: function()
		{
			DetailPage.update(true);
		},
		pagebeforehide: function()
		{
			DetailPage.uninitialize();
		}
	}
};



function addPageEvents(pagecontainer, handlers)
{
	var $pages = $(pagecontainer);

    function createPageEvent(id, event)
    {
    	if (event.substring(0, 1) !== "_")
    	{
	    	var handler = handlers[id]
	    	$pages.on(event, id, handler[event].bind(handler));
			//console.log("Binding: " + id + ": " + event);
    	}
    }

	for (var page_id in handlers)
	{
		var page = handlers[page_id];
		for (var event_id in page)
		{
			createPageEvent(page_id, event_id);
		}
	}
}


$(document).ready(
	function()
	{
		var $pages = $("body").pagecontainer({ defaults: true });

		addPageEvents($pages, handlers);

	    //$pages.on("pageinit pagebeforeload pageload pagebeforecreate pagecreate pagebeforechange pagechange pagebeforeshow pageshow pagebeforehide pagehide pageremove", function (e) { console.log(e.target.id + ": " + e.type + " (" + location.hash + ")"); });

        global.dictionary.get(
        	function ()
			{
				//console.log("[DEFAULT] Initializing Page");
				$.mobile.initializePage();

				$(document).ready(
					function ()
					{
				        var pages = $(".page");

						//console.log("[DEFAULT] Loading Pages");
				        pages.each(function(i, el) { $.mobile.loadPage("#" + el.id, { showLoadMsg: false }); });
						//console.log("[DEFAULT] Loaded " + pages.length + " pages");

				    	loading.hide();
				    	loading.init($pages);
					}
				);
			}
		);
	}
);