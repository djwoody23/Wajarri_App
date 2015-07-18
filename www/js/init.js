// FIX FOR INTERNET EXPLORER
if (typeof console == "undefined")
{
    this.console = { log: function (msg) { /*alert(msg);*/ } };
}

//FIX FOR BUTTON HIGHLIGHTING
$(document).on('mobileinit',
    function()
    {
        $.mobile.activeBtnClass = undefined;
        $.mobile.autoInitializePage = false;
        $.mobile.defaultPageTransition = 'none';
        $.mobile.defaultDialogTransition = 'none';
    }
);