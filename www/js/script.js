
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

        var root_path = "/android_asset/www/";
        var path = root_path + $(id).attr('src');

        function onError(error)
        {
            console.log("[ERROR] Failed to load/play \"" + path + "\".\n" + JSON.stringify(error));
        }
        $(id).data("media", new Media(path, undefined, onError));
    }
}

//Function supplied by Josh :-)
function searchFunction(info, id, value)
{
    if (value != $(id).data('search'))
    {
        //Array copy use .slice
        var vals = value.length ? info.filter(findValue("text", value)) : info; //.slice(0);
        $(id).data('search', value);
        $(id).megalist('setDataProvider', vals);
    }
}

//Megalist plugin Script to display list items
function loadDictionaryValues(id, info)
{
    $(document).one("pageshow", '.page:has(' + id + ')', function()
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
        return '<span data-id="' + item.id + '">' + item.text + '</span>' + '<span data-remove="true" class="ui-btn-icon-notext ui-icon-delete">x</span>';
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
    console.log("englishInit");
    
    loadDictionaryValues("#eng-list", global.dictionary.english);
}
//Wajarri Page Script   
function wajarriInit()
{
    console.log("wajarriInit");

    loadDictionaryValues("#waj-list", global.dictionary.wajarri);
}

function favouritesInit()
{
    console.log("favouritesInit");

    loadDictionaryValues("#fav-list", global.favourites.get());
}

function detailsInit()
{
    console.log("detailsInit");

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
    console.log("favouritesShow");

    $("#fav-list").megalist('setDataProvider', global.favourites.get());
}

function detailsShow()
{
    console.log("detailsShow");

    var id = $("#details-page").data("id");
    var info = global.dictionary.data[id];
    if (info)
    {
        $("#detail-wajarri").html(info.Wajarri);
        $("#detail-english").html(info.English);
        $("#detail-description").html(info.description);
        $("#detail-image").css("background-image", "url(" + info.image + ")");
        $("#detail-audio").attr("src", info.sound);

        checkAudio("#detail-audio");
    }
}

//pagecreate event for each page
//triggers only once
$(document).on("pagecreate", "#english-page", englishInit);
$(document).on("pagecreate", "#wajarri-page", wajarriInit);
$(document).on("pagecreate", "#details-page", detailsInit);
$(document).on("pagecreate", "#fav-page", favouritesInit);
//use pagebeforeshow
//DONT USE PAGEINIT! 
//the reason is you want this to happen every single time
//pageinit will happen only once
$(document).on("pageshow", "#fav-page", favouritesShow);
$(document).on("pagebeforeshow", "#details-page", detailsShow);

(function()
{
    function onReady()
    {
        console.log("onReady");
        global.init();

        //tap event for mobile devices All pages
        var pages = $(".page");
        pages.bind("tap", function (event)
        {
            $(event.target).addClass("tap");
        });

        for (var i = 0; i < pages.length; ++i)
        {
            $.mobile.loadPage("#" + pages[i].id,
            {
                showLoadMsg: false
            });
        }
    }

    if (typeof(window.cordova) !== 'undefined')
    {
        console.log("USING CORDOVA");

        function onDeviceReady()
        {
            onReady();
            navigator.splashscreen.hide();
        }
        document.addEventListener("deviceready", onDeviceReady);
    }
    else
    {
        $(document).ready(onReady);
    }
})();