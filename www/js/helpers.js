

var Iterator = function(values, index)
{
    this.values = values || [];
    this.index = index == undefined ? 0 : index;
    this.length = this.values.length;
};
Iterator.prototype.current = function()
{
    return this.values[this.index];
};
Iterator.prototype.set = function(index)
{
    this.index = index == undefined ? 0 : index;
};
Iterator.prototype.next = function()
{
    if (this.index < this.values.length - 1)
    {
        this.index++;
        return this.current();
    }
    return undefined;
};
Iterator.prototype.previous = function()
{
    if (this.index > 0)
    {
        this.index--;
        return this.current();
    }
    return undefined;
};



function parseHash(url)
{
    url = url ? (new URL(url)).hash : location.hash;
    var parts = url.split('?');
    var hash = parts[0];
    var query = parts[1];
    
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

    return { url: url, hash: hash, query: query };
}



function sortValue(id)
{
    return function(a, b)
    {
        return a[id].toLowerCase().localeCompare(b[id].toLowerCase());
    };
}

function sortText()
{
    return function(a, b)
    {
        //return a.text.localeCompare(b.text);
        var at = a.text.toLowerCase();
        var bt = b.text.toLowerCase();
        return (at < bt ? -1 : (at > bt ? 1 : 0));
    };
}

function findValue(id, value)
{
    return function(a)
    {
        return a[id].toLowerCase().match(value.toLowerCase());
    };
}

function insertSort(arr)
{
	var len = arr.length;
    for (var i = 1; i < len; ++i)
    {
        var tmp = arr[i], j = i;
        while (arr[j - 1] > tmp)
        {
            arr[j] = arr[j - 1];
            --j;
        }
        arr[j] = tmp;
    }
    return arr;
}

function findFirstItemContains(value, list)
{
    for (var key in list)
    {
        if (value.indexOf(key) != -1)
        {
            return key;
        }
    }
    return undefined;
}

function findItemContains(value, list, cb)
{
    for (var key in list)
    {
        if (value.indexOf(key) != -1)
        {
            cb(list[key]);
        }
    }
    return undefined;
}

function alertFunction(msg)
{
    return function () { alert(msg); };
}

function empty() { return function () { }; }



function newEvent(id)
{
    var e = document.createEvent('Events'); 
    e.initEvent(id, true, false);
    return e;
}

function triggerEvent(id)
{
    console.log ("Triggering Event: " + id);
    document.dispatchEvent(newEvent(id));
}


function getBaseOperatingSystem()
{
    var data =
    {
        windows:    "Win",
        macintosh:  "Mac",
        unix:       "X11",
        linux:      "Linux"
    };
    

    var agent = navigator.userAgent;
    for (var key in data)
    {
        data[key] = agent.indexOf(data[key]) != -1;
    }

    return data;
    
    /*var data =
    {
        windows:    /Win/i,
        macintosh:  /Mac/i,
        unix:       /X11/i,
        linux:      /Linux/i,
        android:    /Android/i,
        ios:        /iPad|iPhone|iPod/i
    };
    

    var agent = navigator.userAgent;
    for (var key in data)
    {
        var match = agent.match(data[key]);
        data[key] = match;
    }*/
}

function parse_userAgent()
{
    var str = navigator.appVersion.match(/[^\(\)]+(?=\))/i);
    if (!str || str.length == 0) { return; }

    var vars = str.split(";");
    for (var v in vars)
    {
        var found = v.trim().match(/(?:Win|Mac|iP.|Android).*(?:[0-9][_.])*[0-9]/i);

        if (found && found.length > 0)
        {
            found = found[0];

            break;
        }
    }

    agent

    var data =
    {
        windows:    "Win",
        macintosh:  "Mac",
        unix:       "X11",
        linux:      "Linux"
    };
    

    for (var key in data)
    {
        data[key] = agent.indexOf(data[key]) != -1;
    }

    return data;
    
    /*var data =
    {
        windows:    /Win/i,
        macintosh:  /Mac/i,
        unix:       /X11/i,
        linux:      /Linux/i,
        android:    /Android/i,
        ios:        /iPad|iPhone|iPod/i
    };
    

    var agent = navigator.userAgent;
    for (var key in data)
    {
        var match = agent.match(data[key]);
        data[key] = match;
    }*/
}

var helpers =
{
    browser:
    {
        init: function () 
        {
            var browserNames =
            {
                "Chrome":   "Chrome",
                "MSIE":     "Internet Explorer",
                "Firefox":  "Firefox",
                "Safari":   "Safari",
                "Opera":    "Opera",
                "Other":    "Other"
            };

            function searchVersion(data, id)
            {
                var index = data.indexOf(id);
                return (index != -1) && parseFloat(data.substring(index + id.length + 1));
            }

            var data = { };

            data.id = findFirstItemContains(navigator.userAgent, browserNames) || "Other";
            data.version = searchVersion(navigator.userAgent, data.id) || searchVersion(navigator.appVersion, data.id) || "Unknown";
            data.name = browserNames[data.id];
            data.text = data.name + ' ' + data.version;

            data.init = function() { return this; };

            helpers.browser = data;

            return data;
        }
    },

    user_data:
    {
    	enabled: undefined,
    	length: function () { return 0; },
    	key: function (id) { },
    	get: function (key) { },
    	set: function (key, value) { },
    	remove: function (key) { },
    	clear: function () { },
    	getJSON: function (key, no_warning)
    	{
    		var data = this.get(key);
    		if (data && data != "")
    		{
    			return JSON.parse(data);
    		}
    		if (!no_warning) console.log("WARNING: Unable to load " + key + ".");
    		return null;
    	},
    	setJSON: function (key, value)
    	{
    		this.set(key, JSON.stringify(value));
    	},
    	init: function()
    	{
    		this.enabled = typeof(Storage) !== "undefined" && !!window.localStorage;
    		
    		if (this.enabled)
    		{
    			this.length = function ()
    			{
    				return window.localStorage.length;
    			};
    			this.key = function (id)
    			{
    				return window.localStorage.key(id);
    			};
    			this.get = function (key)
    			{
    				return window.localStorage.getItem(key);
    			};
    			this.set = function (key, value)
    			{
    				return window.localStorage.setItem(key, value);
    			};
    			this.remove = function (key)
    			{
    				return window.localStorage.removeItem(key);
    			};
    			this.clear = function ()
    			{
    				return window.localStorage.clear();
    			};
    		}
    		else
    		{
    			console.log ("WARNING: No Web Storage support...");
    		}
    		
    		this.init = undefined;
    	}
    },

    warning:
    {
        warning_html:
            '<div class="warning">' +
                '<span class="warning_text">Warning: Your browser (<span></span>) is unsupported. Upgrade! <a href="http://www.microsoft.com/en-au/download/internet-explorer-9-details.aspx">Link</a></span>' +
                '<span class="warning_x" onclick="global.warning.hide()">x</span>' +
            '</div>',
        show: function()
        {
            $('.warning').css('visibility', 'visible');
            $('body').css('top', $('.warning').height() + 'px');
        },
        hide: function()
        {
            $('.warning').css('visibility', 'hidden');
            $('body').css('top', '0');
        },
        init: function()
        {
            if (helpers.browser.id == 'MSIE' && helpers.browser.version < 9)
            {
                $('body').append(this.warning_html);
                $('.warning_text').find("span").html(helpers.browser.text);
                this.show();
            }
        }
    },

    init: function()
    {
        this.browser.init();
        this.user_data.init();
        this.warning.init();
    }
};

$(document).ready(function() { helpers.init(); });
