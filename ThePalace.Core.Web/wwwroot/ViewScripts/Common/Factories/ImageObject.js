angular.module('ThePalace').factory('ImageObject', [function () {
    var ImageObject = (function (cfg) {
        this.preload(cfg);
    });

    ImageObject.prototype = {
        revokeUrl: false,
        sourceUrl: null,
        image: null,
        height: 0,
        width: 0,
        state: 0,
        abort: (function (that) {
            var _this = that || this;

            if (_this.state < 0 || ($(_this.image).attr('src') || '').trim() === '') {
                return;
            } else if (_this.sound) {
                _this.image.src = '';
                delete _this.image;
                _this.image = null;
            }

            _this.sourceUrl = null;
            _this.state = -1;
            _this.height = 0;
            _this.width = 0;
        }),
        preload: (function (cfg) {
            if (cfg && cfg.sourceUrl) {
                this.abort(this);

                this.revokeUrl = cfg.revokeUrl;
                this.sourceUrl = cfg.sourceUrl;
                this.resolve = cfg.resolve;
                this.reject = cfg.reject;

                try {
                    var that = this;
                    var handleLoad = (function (event) {
                        if (that.state < 0 || ($(that.image).attr('src') || '').trim() === '') {
                            return;
                        }

                        if (that.revokeUrl) {
                            URL.revokeObjectURL(that.sourceUrl);

                            that.revokeUrl = false;
                            that.sourceUrl = null;
                        } else {
                            that.sourceUrl = that.image.src;
                        }

                        that.state++;
                        that.height = that.image.height;
                        that.width = that.image.width;

                        if (that && that.resolve) {
                            that.resolve.apply(that, [event]);
                        }
                    });
                    var handleError = (function (error) {
                        if (that.state < 0 || ($(that.image).attr('src') || '').trim() === '') {
                            return;
                        }

                        var oldState = that.state;

                        that.abort.apply(that);

                        if (that && that.reject) {
                            that.reject.apply(that, [error, oldState]);
                        }
                    });

                    this.state = 0;

                    this.state++;

                    this.image = new Image();

                    this.state++;

                    this.image.addEventListener('load', handleLoad);
                    this.image.addEventListener('error', handleError);
                    this.image.addEventListener('abort', handleError);

                    this.state++;
                } catch (error) {
                    handleError(error);
                }
            }
        }),
        load: (function () {
            if (this.image && this.sourceUrl) {
                try {
                    var that = this;
                    var handleError = (function (error) {
                        if (that.state < 0 || ($(that.image).attr('src') || '').trim() === '') {
                            return;
                        }

                        var oldState = that.state;

                        that.abort(that);

                        if (that && that.reject) {
                            that.reject.apply(that, [error, oldState]);
                        }
                    });

                    if (this.revokeUrl) {
                        this.sourceUrl = URL.createObjectURL(this.sourceUrl);
                    }

                    //this.image.crossOrigin = 'Anonymous';
                    this.image.src = this.sourceUrl;

                    this.state++;
                } catch (error) {
                    handleError(error);
                }
            }
        }),
    };

    return ImageObject;
}]);
