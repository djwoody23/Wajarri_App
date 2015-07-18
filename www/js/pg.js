
(function (window)
{
    var phonegap = 
    {
        enabled: false,

        platform:
        {
            id: "",
            android: false,
            ios: false,
            init: function()
            {
                this.id = window.device.platform.toLowerCase();
                this.android = this.id == "android";
                this.ios = this.id == "ios";
                console.log("[PHONEGAP] Platform: " + this.id);
            }
        },

        mediaPath: function(src)
        {
            if (phonegap.platform.android && src)
            {
                return "file:///android_asset/www/" + src;
            }
            return src;
        },

        openUrlExternal: function (address)
        {
            console.log("[PHONEGAP] openUrlExternal: " + address);
            if (phonegap.platform.ios)
            {
                window.open(address, '_system');//, 'location=no');
            }
            else
            {
                navigator.app.loadUrl(address, { openExternal: true });
            }
        },

        fixAudio: function ()
        {
            if (typeof(Media) !== 'undefined') // FIX: Media UNDEFINED!
            {
                function audio_media(value)
                {
                    var $this = $(value);
                    var media = $this.data("media");
                    var src = phonegap.mediaPath($this.attr("src"));

                    if (media == undefined || src != media.src)
                    {
                        //console.log("Audio: \"" + src + "\"");
                        media = new Media(src, undefined, function (error) { console.log("[ERROR] Failed to load/play \"" + src + "\" (" + (error ? error.code : "Unknown") + ")."); });
                        $this.data("media", media);
                    }

                    return media;
                };
                
                HTMLAudioElement.prototype.play = function ()
                {
                    var media = audio_media(this);

                    //console.log("Playing " + media.src);
                    if (media != undefined)
                    {
                        media.play();
                    }
                };

                HTMLAudioElement.prototype.pause = function ()
                {
                    var media = audio_media(this);

                    //console.log("Pausing " + media.src);
                    if (media != undefined)
                    {
                        media.pause();
                    }
                };
            }
            else
            {
                if (HTMLAudioElement.prototype.play == undefined)
                {
                    HTMLAudioElement.prototype.play = alertFunction("Browser cannot play audio!");
                }
                if (HTMLAudioElement.prototype.pause == undefined)
                {
                    HTMLAudioElement.prototype.pause = empty;
                }
            }
        },

        onDeviceReady: function ()
        {
            if (!phonegap.enabled)
            {
                return;
            }

            console.log("[PHONEGAP] Device Ready");

            phonegap.platform.init();

            if (phonegap.platform.ios && typeof(StatusBar) !== 'undefined')
            {
                StatusBar.overlaysWebView(false);
                StatusBar.styleLightContent();
                StatusBar.backgroundColorByName("black");
            }

            $(document).on('click tap', "a[target='_blank']", 
                function(e)
                {
                    e.preventDefault();
                    e.stopPropagation();
                    var val = $(e.currentTarget).attr('href');
                    phonegap.openUrlExternal(val);
                    return false;
                }
            );

            phonegap.fixAudio();

            navigator.splashscreen.hide();
        },

        init: function()
        {
            document.addEventListener("deviceready", function () { phonegap.onDeviceReady(); }, false);
            
            $(document).ready(function()
            {
                phonegap.enabled = typeof(window.cordova) !== 'undefined';
                console.log("[PHONEGAP] Enabled: " + phonegap.enabled);
                if (!phonegap.enabled)
                {
                    $(document).ready(function () { triggerEvent("deviceready"); });
                }
            });
        }
    }

    phonegap.init();
} (this));
