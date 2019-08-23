angular.module('ThePalace').factory('WebSockets', ['$window', '$q', 'utilService', function ($window, $q, utilService) {
    var WebSockets = (function () {
    });

    WebSockets.prototype = {
        webSocket: null,
        events: {},
        stack: [],
        send: function (eventType, refNum, message) {
            if (arguments.length < 1) {
                return;
            }

            var data = JSON.stringify({
                eventType: eventType,
                refNum: refNum,
                message: message,
            });

            if (this.webSocket.readyState === 1) {
                this.webSocket.send(data);
            } else {
                this.stack.push(data);
            }
        },
        on: function (eventName, callback) {
            if (eventName && callback && callback.constructor) {
                this.events[eventName.toLowerCase()] = callback;
            }
        },
        start: function (webSocketUrl) {
            var that = this;

            try {
                this.webSocket = new WebSocket(webSocketUrl);
            } catch (e) {
                return;
            }

            this.webSocket.onopen = function (event) {
                while (that.stack.length > 0) {
                    that.webSocket.send(that.stack.pop());
                }

                if (that.events.connect && that.events.connect.constructor) {
                    that.events.connect(event);
                }
            };

            this.webSocket.onmessage = function (event) {
                var packet = JSON.parse(event.data);

                if (that.events.message && that.events.message.constructor) {
                    that.events.message.apply(event, Array.isArray(packet) ? packet : [packet]);
                }
            };

            this.webSocket.onclose = function (event) {
                if (that.events.close && that.events.close.constructor) {
                    that.events.close(event);
                }
            };

            this.webSocket.onerror = function (event) {
                if (that.events.error && that.events.error.constructor) {
                    that.events.error(event);
                }
            };
        },
        stop: function () {
            this.webSocket.close();
            this.webSocket = null;
        },
    };

    return WebSockets;
}]);
