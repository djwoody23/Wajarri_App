
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
        return (a.text < b.text ? -1 : (a.text > b.text ? 1 : 0));
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
    dictionary:
    {
        data: [],
        english: [],
        wajarri: [],

        init: function()
        {
            //ajax call to Json Database
            $.ajax(
            {
                type: 'GET',
                dataType: 'json',
                mimeType: "application/json",
                async: false,
                url: "wajarriDic201114.json",
                success: this.setData,
                error: function(err)
                {
                    console.log("It's broke: " + err);
                }
            });
        },
        setData: function(data)
        {
            console.log("Loaded Dictionary");

            //data = data.data;
            var waj = [];
            var eng = [];

            for (var i = 0; i < data.length; ++i)
            {
                var inf = data[i];
                inf.id = i;
                waj.push(
                {
                    id: inf.id,
                    text: inf.Wajarri
                });
                eng.push(
                {
                    id: inf.id,
                    text: inf.English
                });
            }

            console.log("Sorting Wajarri Started");
            waj.sort(sortText());
            console.log("Sorting Wajarri Ended");
            console.log("Sorting English Started");
            eng.sort(sortText());
            console.log("Sorting English Ended");

            global.dictionary.data = data;
            global.dictionary.wajarri = waj;
            global.dictionary.english = eng;
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
            var data = global.dictionary.data;
            for (var i = 0; i < items.length; ++i)
            {
                var inf = data[items[i]];
                values.push(
                {
                    id: inf.id,
                    text: inf.Wajarri
                });
            }
            values.sort(sortText());
            return values;
        }
    },
    init: function()
    {
        this.dictionary.init();
        this.favourites.init();
    }
};

(function()
{
    //global.init();
})();