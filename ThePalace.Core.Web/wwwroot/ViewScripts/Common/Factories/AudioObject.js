angular.module('ThePalace').factory('AudioObject', ['$q', function ($q) {
    var AudioObject = (function (cfg) {
        this.preload(cfg);
    });

    AudioObject.prototype = {
        sourceUrl: null,
        autoplay: false,
        loop: false,
        sound: null,
        state: 0,
        abort: (function (that) {
            var _this = that || this;

            if (_this.state < 0 || ($(_this.sound).attr('src') || '').trim() === '') {
                return;
            } else if (_this.sound) {
                _this.sound.pause();
                _this.sound.src = '';
            }

            _this.sourceUrl = null;
            _this.state = -1;
        }),
        pause: (function () {
            if (this.sound) {
                this.sound.pause();
            }
        }),
        play: (function () {
            if (this.sound) {
                this.sound.play();
            }
        }),
        preload: (function (cfg) {
            if (cfg && cfg.sourceUrl) {
                this.abort(this);

                this.sourceUrl = cfg.sourceUrl;
                this.autoplay = !!cfg.autoplay;
                this.loop = !!cfg.loop;
                this.resolve = cfg.resolve;
                this.reject = cfg.reject;

                try {
                    var that = this;
                    var handleLoad = (function (event) {
                        if (that.state < 0 || ($(that.sound).attr('src') || '').trim() === '') {
                            return;
                        }

                        that.state++;
                        that.sourceUrl = that.sound.src;

                        if (that && that.resolve) {
                            that.resolve.apply(that, [event]);
                        }
                    });
                    var handleError = (function (error) {
                        if (that.state < 0 || ($(that.sound).attr('src') || '').trim() === '') {
                            return;
                        }

                        var oldState = that.state;

                        that.abort(that);

                        if (that && that.reject) {
                            that.reject.apply(that, [error, oldState]);
                        }
                    });

                    this.state = 0;

                    this.state++;

                    if (!this.sound) {
                        this.sound = new Audio();

                        this.sound.addEventListener('canplaythrough', handleLoad);
                        this.sound.addEventListener('error', handleError);
                        this.sound.addEventListener('abort', this.pause);
                    }

                    this.sound.autoplay = this.autoplay;
                    this.sound.loop = this.loop;
                    this.sound.controls = false;
                    this.sound.preload = 'none';

                    this.state++;
                } catch (error) {
                    handleError(error);
                }
            }
        }),
        load: (function () {
            if (this.sound && this.sourceUrl) {
                try {
                    var that = this;
                    var handleError = (function (error) {
                        if (that.state < 0 || ($(that.sound).attr('src') || '').trim() === '') {
                            return;
                        }

                        var oldState = that.state;

                        that.abort(that);

                        if (that && that.reject) {
                            that.reject.apply(that, [error, oldState]);
                        }
                    });

                    this.sound.src = this.sourceUrl;

                    this.state++;

                    //this.sound.load();
                } catch (error) {
                    handleError(error);
                }
            }
        }),
    };

    return AudioObject;
}]);
