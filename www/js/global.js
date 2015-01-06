
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



var global =
{
    directories:
    {
        audio: function(audio) { return "audio/" + audio; },
        image: function(image) { return "images/" + image; },
        image_dictionary: function(image) { return this.image("dictionary/" + image); }
    },
    settings:
    {
        collapsible_list: true
    },
    dictionary:
    {
        data: [],
        wajarri:
        {
            data: [],

            set: function(data)
            {
                var values = [];

                for (var i = 0; i < data.length; ++i)
                {
                    var inf = data[i];
                    values.push(
                    {
                        id: inf.id,
                        text: inf.Wajarri
                    });
                }

                values.sort(sortText());

                for (var i = 0; i < values.length; ++i)
                {
                    values[i].index = i;
                }

                this.data = values;
            },
            get: function()
            {
                return this.data;
            },
            iterator: function(index)
            {
                return new Iterator(this.get(), index);
            }
        },
        english:
        {
            data: [],

            set: function(data)
            {
                var values = [];

                for (var i = 0; i < data.length; ++i)
                {
                    var inf = data[i];
                    values.push(
                    {
                        id: inf.id,
                        text: inf.English
                    });
                }

                values.sort(sortText());

                for (var i = 0; i < values.length; ++i)
                {
                    values[i].index = i;
                }

                this.data = values;
            },
            get: function()
            {
                return this.data;
            },
            iterator: function(index)
            {
                return new Iterator(this.get(), index);
            }
        },
        init: function()
        {
            //ajax call to Json Database
            $.ajax(
            {
                type: 'GET',
                dataType: 'json',
                mimeType: "application/json",
                async: false,
                url: "wajarriDic06012015.json",
                success: function(data) { global.dictionary.set(data); },
                error: function(err)
                {
                    console.log("Can't Load JSON: " + err);
                }
            });
        },
        set: function(data)
        {
            for (var i = 0; i < data.length; ++i)
            {
                data[i].id = i;
            }

            this.data = data;
            this.wajarri.set(this.data);
            this.english.set(this.data);
            
            console.log("Loaded Dictionary");
        }
    },
    favourites:
    {
        items: [],
        data: [],

        init: function()
        {
            this.load();
            //this.clear();
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
            if (index == 0 || index)
            {
                if (this.items.indexOf(index) == -1)
                {
                    this.items.push(index);
                }
                this.save();
            }
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
        update: function(data)
        {
            var values = [];
            var items = this.items;

            for (var i = 0; i < items.length; ++i)
            {
                var inf = data[items[i]];
                values.push(
                {
                    id: inf.id,
                    text: inf.Wajarri// + " - " + inf.English
                });
            }

            values.sort(sortText());

            for (var i = 0; i < values.length; ++i)
            {
                values[i].index = i;
            }

            this.data = values;
        },
        get: function()
        {
            this.update(global.dictionary.data);
            return this.data;
        },
        iterator: function(index)
        {
            return new Iterator(this.get(), index);
        }
    },
    init: function()
    {
        this.dictionary.init();
        this.favourites.init();
    }
};

$(document).ready(function()
{
    global.init();
});