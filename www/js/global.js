
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
    },

    dictionary:
    {
        data: [],
        loading: true,

        wajarri:
        {
            id: "wajarri",
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
                        text: inf.Wajarri || ""
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
            getId: function(index)
            {
                return this.data[index].id;
            },
            getIndex: function(id)
            {
                return this.data.findFirstIndexKV("id", id);
            },
            iterator: function(index)
            {
                return new Iterator(this.get(), index);
            }
        },

        english:
        {
            id: "english",
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
                        text: inf.English || ""
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
            getId: function(index)
            {
                return this.data[index].id;
            },
            getIndex: function(id)
            {
                return this.data.findFirstIndexKV("id", id);
            },
            iterator: function(index)
            {
                return new Iterator(this.get(), index);
            }
        },

        favourites:
        {
            id: "favourites",
            items: [],
            data: [],

            init: function()
            {
                this.load();
            },
            load: function()
            {
                this.items = helpers.user_data.getJSON("favourites") || this.items;
    			console.log("[FAVOURITES] Loaded: " + JSON.stringify(this.items));
            },
            save: function()
            {
    			helpers.user_data.setJSON("favourites", this.items);
            },
            clear: function()
            {
    			this.items = [];
    			this.save();
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
                return this.data;
            },
            get: function()
            {
                return this.update(global.dictionary.data);
            },
            getId: function(index)
            {
                return this.data[index].id;
            },
            getIndex: function(id)
            {
                return this.data.indexOf(id);
            },
            iterator: function(index)
            {
                return new Iterator(this.get(), index);
            }
        },

        init: function()
        {
            //console.log("[DICTIONARY] Loading");
            this.set();
            this.loading = true;
            //ajax call to Json Database
            $.ajax(
            {
                type: 'GET',
                dataType: 'json',
                mimeType: "application/json",
                //async: false,
                url: "wajarriDic19052015.min.json",
                success: function(data)
                {
                    global.dictionary.set(data);
                    global.dictionary.loading = false;
                    console.log("[DICTIONARY] Loaded " + data.length + " entries");
                },
                error: function(err)
                {
                    global.dictionary.loading = false;
                    console.log("[DICTIONARY] WARNING: Can't Load JSON: " + err);
                }
            });

            this.favourites.init();
        },

        get: function(cb, timeout)
        {
            if (!global.dictionary.loading)
            {
                cb(global.dictionary.data);
                return;
            }

            var interval = 50;
            var total = timeout || 0;

            var int_var = setInterval(check, 50);

            function check()
            {
                if (global.dictionary.loading && (!timeout || total > 0))
                {
                    total -= interval;
                }
                else
                {
                    clearInterval(int_var);
                    cb(global.dictionary.data);
                }
            }
        },

        set: function(data)
        {
            data = data || [];

            for (var i = 0; i < data.length; ++i)
            {
                data[i].id = i;
            }

            this.data = data;
            this.wajarri.set(this.data);
            this.english.set(this.data);
        },

        iterator: function(index)
        {
            return new Iterator(this.data, index);
        }
    },

    init: function()
    {
        this.dictionary.init();
    }
};

global.init();
