
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
        },

        fixStatusBar: function ()
        {
            if (phonegap.platform.ios && typeof(StatusBar) !== 'undefined')
            {
                StatusBar.overlaysWebView(false);
                StatusBar.styleLightContent();
                StatusBar.backgroundColorByName("black");
                StatusBar.show();
            }
        },

        fixExternalLinks: function ()
        {
            $(document).on('tap', "a[target='_blank']", 
                function(e)
                {
                    e.preventDefault();
                    e.stopPropagation();
                    var val = $(e.currentTarget).attr('href');
                    phonegap.openUrlExternal(val);
                    return false;
                }
            );
        },

        fixClickDelay: function ()
        {
            $.event.special.tap =
            {
                // Abort tap if touch moves further than 10 pixels in any direction
                distanceThreshold: 10,
                // Abort tap if touch lasts longer than half a second
                timeThreshold: 500,
                setup: function()
                {
                    var self = this, $self = $(self);

                    // Bind touch start
                    $self.on('touchstart',
                        function(startEvent)
                        {
                            // Save the target element of the start event
                            var target = startEvent.target,
                            touchStart = startEvent.originalEvent.touches[0],
                            startX = touchStart.pageX,
                            startY = touchStart.pageY,
                            threshold = $.event.special.tap.distanceThreshold,
                            timeout;

                            function removeTapHandler()
                            {
                                clearTimeout(timeout);
                                $self.off('touchmove', moveHandler).off('touchend', tapHandler);
                            };

                            function tapHandler(endEvent)
                            {
                                removeTapHandler();

                                // When the touch end event fires, check if the target of the
                                // touch end is the same as the target of the start, and if
                                // so, fire a click.
                                if (target == endEvent.target)
                                {
                                    $.event.simulate('tap', self, endEvent);
                                }
                            };

                            // Remove tap and move handlers if the touch moves too far
                            function moveHandler(moveEvent)
                            {
                                var touchMove = moveEvent.originalEvent.touches[0],
                                moveX = touchMove.pageX,
                                moveY = touchMove.pageY;

                                if (Math.abs(moveX - startX) > threshold || Math.abs(moveY - startY) > threshold)
                                {
                                    removeTapHandler();
                                }
                            };

                            // Remove the tap and move handlers if the timeout expires
                            timeout = setTimeout(removeTapHandler, $.event.special.tap.timeThreshold);

                            // When a touch starts, bind a touch end and touch move handler
                            $self.on('touchmove', moveHandler).on('touchend', tapHandler);
                        }
                    );
                }
            };
        },

        onDeviceReady: function ()
        {
            console.log("[PHONEGAP] Device Ready");

            phonegap.platform.init();

            phonegap.fixStatusBar();
            phonegap.fixExternalLinks();
            phonegap.fixAudio();
            //phonegap.fixClickDelay();

            navigator.splashscreen.hide();
        },

        init: function()
        {
            $.cachedScript("cordova.js").always(
                function(data, status, err)
                {
                    phonegap.enabled = status == "success" && typeof(window.cordova) !== 'undefined';
                    if (phonegap.enabled)
                    {
                        console.log("[PHONEGAP] Enabled: " + phonegap.enabled);
                        document.addEventListener("deviceready", function () { phonegap.onDeviceReady(); }, false);
                    }
                }
            )
        }
    }

    phonegap.init();
} (this));
