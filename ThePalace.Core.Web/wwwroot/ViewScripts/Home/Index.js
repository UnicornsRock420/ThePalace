(function () {
    var app = angular.module('ThePalace');

    app.controller('PalaceClient',
        ['$scope', '$window', '$timeout', '$interval', '$http', 'mvcEndPoints', 'magicService', 'utilService', 'dialogService',
            'iptService', 'ImageObject', 'AudioObject', 'CanvasNode', 'UserFlags', 'HotSpotFlags', 'HotSpotTypes', 'ServerAssetFlags', 'Packet', 'WebSockets', 'Prop',
            function ($scope, $window, $timeout, $interval, $http, mvcEndPoints, magicService, utilService, dialogService,
                iptService, ImageObject, AudioObject, CanvasNode, UserFlags, HotSpotFlags, HotSpotTypes, ServerAssetFlags, Packet, WebSockets, Prop) {
                iptService.setScope($scope);

                $scope.model = {
                    ClientSettings: {
                        debugMode: false,
                        showNames: true,
                        showNameShadows: true,
                        showNameBackgrounds: false,
                        messages: {
                            maxLogLength: 1024,
                            backgroundColor: [
                                '3D72AC', //'FF0000',
                                '528CA6', //'FF5F00',
                                '7FA2B4', //'FFBF00',
                                '90BDB8', //'DFFF00',
                                '82C29F', //'7FFF00',
                                '7CBC7D', //'1FFF00',
                                '94B95D', //'00FF3F',
                                'CACA5B', //'00FF9F',
                                'B8B867', //'00FFFF',
                                'B5A874', //'009FFF',
                                'B1987B', //'003FFF',
                                'AA725F', //'1F00FF',
                                'B14F68', //'7F00FF',
                                '9C5980', //'DF00FF',
                                '8E569A', //'FF00BF',
                                '654EA1', //'FF005F',
                            ],
                        },
                        userName: 'Janus123',
                        userNameStyle: {
                            messsageColor: true,
                            mine: {
                                opacity: '0.7',
                                padding: '2px',
                                fontName: 'Georgia',
                                fontStyle: 'normal',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                foregroundColor: 'green',
                                backgroundColor: 'black',
                                shadowColor: 'darkgreen',
                                shadowOffsetY: 1,
                                shadowOffsetX: 1,
                            },
                            users: {
                                opacity: '0.9',
                                padding: '2px',
                                fontName: 'Georgia',
                                fontStyle: 'normal',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                foregroundColor: 'red',
                                backgroundColor: 'black',
                                shadowColor: 'darkred',
                                shadowOffsetY: 1,
                                shadowOffsetX: 1,
                            },
                            whipertarget: {
                                opacity: '1',
                                padding: '2px',
                                fontName: 'Georgia',
                                fontStyle: 'italic',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                foregroundColor: 'lightblue',
                                backgroundColor: 'black',
                                shadowColor: 'blue',
                                shadowOffsetY: 1,
                                shadowOffsetX: 1,
                            },
                            whipernontarget: {
                                opacity: '0.3',
                                padding: '2px',
                                fontName: 'Georgia',
                                fontStyle: 'normal',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                foregroundColor: 'red',
                                backgroundColor: 'black',
                                shadowColor: 'darkred',
                                shadowOffsetY: 1,
                                shadowOffsetX: 1,
                            },
                        },
                        spotStyle: {
                            spotName: {
                                opacity: '1',
                                padding: '2px',
                                fontName: 'Georgia',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: '16px',
                                foregroundColor: 'black',
                                backgroundColor: 'white',
                            },
                        },
                    },
                    ConnectionInfo: {
                        connected: false,
                        status: 'Disconnected',
                    },
                    ServerInfo: {
                        name: '',
                        mediaUrl: '',
                        totalPeople: 0,
                    },
                    UserInfo: {
                        ipAddress: '',
                        version: '',
                        agent: 'AEPHIX',
                        userId: 0,
                        userFlags: 0,
                        hasAdmin: false,
                        desiredRoom: 69,
                        regSeed: 0,
                        regCrc: 0,
                        regCtr: 0,
                        puidCrc: 0,
                        puidCtr: 0,
                    },
                    RoomInfo: {
                        name: '',
                        roomId: 0,
                        LooseProps: [],
                        SpotList: [],
                        PictureList: [],
                        UserList: [],
                        DrawCmds: [],
                    },
                    Screen: {
                        layers: {},
                        width: '0px',
                        height: '0px',
                        assetCache: {},
                        paintPenColor: {
                            r: 0,
                            g: 0,
                            b: 0,
                        },
                        paintPenPos: {
                            h: 0,
                            v: 0,
                        },
                        paintPenSize: 1,
                        paintLayer: false,
                        backgroundFile: null,
                        backgroundUrl: null,
                        spotHovering: false,
                        spotHoveringId: 0,
                        spotLayerShow: false,
                        spotLayerUpdate: false,
                        bubbleLayerUpdate: false,
                        spriteLayerUpdate: false,
                        loosepropLayerUpdate: false,
                        drawCmdLayerUpdate: false,
                        nametagsLayerShow: true,
                        nametagsLayerUpdate: false,
                    },
                    Interface: {
                        blockUI: false,
                        RoomList: [],
                        showRoomList: false,
                        UserList: [],
                        showUserList: false,
                        LogList: [],
                        showLogList: false,
                        showSpots: false,
                        showPropbag: false,
                        selectedProp: null,
                        whisperTargetId: 0,
                        highlightTargetId: 0,
                        cursor: 'default',
                        contextMenu: {
                            type: null,
                            targetId: 0,
                            positionY: 0,
                            positionX: 0,
                        },
                        loosepropMouseDown: -1,
                        wornpropMouseDown: -1,
                        spotMouseDown: null,
                        messageQueue: [],
                        messageTimer: null,
                        statusMessageTimer: null,
                        statusMessage: null,
                        population: null,
                        spotHover: null,
                        chatWindowText: '',
                        authoringMode: false,
                    },
                    Application: {
                        soundPlayer: new AudioObject(),
                        midiPlayer: $window.MIDIjs,
                        videoPlayer: null,
                        sockets: [],
                        PropBag: [],
                        cyborg: {},
                    },
                };

                $scope.ListOfAllRooms_Options = {
                    data: 'model.Interface.RoomList',
                    multiSelect: false,
                    enableSorting: true,
                    enablePinning: false,
                    enableSelectAll: false,
                    enableRowSelection: true,
                    enableColumnResizing: true,
                    enableRowHeaderSelection: false,
                    columnDefs: [
                        { field: 'name', displayName: 'Name', width: 250 },
                        { field: 'refNum', displayName: 'Count', width: 80 }],
                    onRegisterApi: function (gridApi) {
                        $scope.ListOfAllRooms_Options.gridApi = gridApi;
                    },
                };

                $scope.ListOfAllUsers_Options = {
                    data: 'model.Interface.UserList',
                    multiSelect: false,
                    enableSorting: true,
                    enablePinning: false,
                    enableSelectAll: false,
                    enableRowSelection: true,
                    enableColumnResizing: true,
                    enableRowHeaderSelection: false,
                    columnDefs: [
                        { field: 'name', displayName: 'Name', width: 250 },
                        { field: 'roomName', displayName: 'Room', width: 80 }],
                    onRegisterApi: function (gridApi) {
                        $scope.ListOfAllUsers_Options.gridApi = gridApi;
                    },
                };

                $scope.model.Screen.layers['spotCanvas'] = new CanvasNode('2d', angular.element('#spot'));
                $scope.model.Screen.layers['bubbleCanvas'] = new CanvasNode('2d', angular.element('#bubble'));
                $scope.model.Screen.layers['spriteCanvas'] = new CanvasNode('2d', angular.element('#sprite'));
                $scope.model.Screen.layers['dimroomCanvas'] = new CanvasNode('2d', angular.element('#dimroom'));
                $scope.model.Screen.layers['nametagsCanvas'] = new CanvasNode('2d', angular.element('#nametags'));
                $scope.model.Screen.layers['bgDrawCmdCanvas'] = new CanvasNode('2d', angular.element('#bgdrawcmd'));
                $scope.model.Screen.layers['fgDrawCmdCanvas'] = new CanvasNode('2d', angular.element('#fgdrawcmd'));
                $scope.model.Screen.layers['loosepropsCanvas'] = new CanvasNode('2d', angular.element('#looseprops'));

                var newHeight = 384;
                var newWidth = 512;

                $scope.model.Screen.layers['spotCanvas'].width(newWidth);
                $scope.model.Screen.layers['spotCanvas'].height(newHeight);
                $scope.model.Screen.layers['bubbleCanvas'].width(newWidth);
                $scope.model.Screen.layers['bubbleCanvas'].height(newHeight);
                $scope.model.Screen.layers['spriteCanvas'].width(newWidth);
                $scope.model.Screen.layers['spriteCanvas'].height(newHeight);
                $scope.model.Screen.layers['dimroomCanvas'].width(newWidth);
                $scope.model.Screen.layers['dimroomCanvas'].height(newHeight);
                $scope.model.Screen.layers['nametagsCanvas'].width(newWidth);
                $scope.model.Screen.layers['nametagsCanvas'].height(newHeight);
                $scope.model.Screen.layers['bgDrawCmdCanvas'].width(newWidth);
                $scope.model.Screen.layers['bgDrawCmdCanvas'].height(newHeight);
                $scope.model.Screen.layers['fgDrawCmdCanvas'].width(newWidth);
                $scope.model.Screen.layers['fgDrawCmdCanvas'].height(newHeight);
                $scope.model.Screen.layers['loosepropsCanvas'].width(newWidth);
                $scope.model.Screen.layers['loosepropsCanvas'].height(newHeight);

                $scope.model.Screen.width = newWidth + 'px';
                $scope.model.Screen.height = newHeight + 'px';
                $scope.model.Screen.backgroundUrl = '';

                var smileyFaceObject = new ImageObject({
                    sourceUrl: '/media/smileys/chewy-face.png',
                    resolve: function (response) {
                    },
                    reject: function (errors) {
                    },
                });

                smileyFaceObject.load();

                $http({
                    url: '/media/Cyborg.txt',
                    method: 'GET',
                }).then(function (response) {
                    $scope.model.Application.cyborg = iptService.iptParser(response.data, true);
                }, function (errors) {
                    return;
                });

                var manageMessageQueue = (function () {
                    $timeout.cancel($scope.model.Interface.messageTimer);
                    $scope.model.Interface.messageTimer = null;

                    var now = (new Date()).getTime() / 1000;
                    var loop = false;

                    do {
                        loop = false;

                        for (var j = 0; j < $scope.model.Interface.messageQueue.length; j++) {
                            var message = $scope.model.Interface.messageQueue[j];

                            if (message.type !== 'sticky' && message.duration < now) {
                                $scope.model.Interface.messageQueue.splice(j, 1);

                                loop = true;

                                break;
                            }
                        }
                    } while (loop);

                    var bubbleCanvas = $scope.model.Screen.layers['bubbleCanvas'];
                    bubbleCanvas.clearRect();

                    bubbleCanvas.strokeStyle('black');

                    if ($scope.model.Interface.messageQueue.length > 0) {
                        for (var j = 0; j < $scope.model.Interface.messageQueue.length; j++) {
                            var message = $scope.model.Interface.messageQueue[j];
                            var user = null;

                            for (var k = 0; !user && k < $scope.model.RoomInfo.UserList.length; k++) {
                                if ($scope.model.RoomInfo.UserList[k].userID === message.userId) {
                                    user = $scope.model.RoomInfo.UserList[k];

                                    break;
                                }
                            }

                            bubbleCanvas.fontStyle(''.concat(message.isWhisper ? 'italic ' : '', 'bold 14px Georgia'));
                            bubbleCanvas.fillStyle(''.concat('#', $scope.model.ClientSettings.messages.backgroundColor[(user && user.colorNbr || 0) % 16]));

                            var arr = message.text.split(/\s+/);
                            var x, y, px, py, y, b;
                            var maxWidth = 160;
                            var lines = [];
                            var line = [];
                            var tw = 0;

                            var offsetX = 11;
                            var offsetY = 11;

                            if (!message.lines) {
                                while (arr.length > 0) {
                                    var newLine = line.join(' ') + ' ' + arr[0];
                                    var newLineWidth = bubbleCanvas.getTextWidth(newLine);

                                    if (newLineWidth < maxWidth || (arr.length === 1 && line.length < 1)) {
                                        if (newLineWidth > maxWidth) {
                                            maxWidth = newLineWidth;
                                        }

                                        line.push(arr[0]);

                                        arr.splice(0, 1);
                                    }

                                    if (newLineWidth >= maxWidth || arr.length < 1) {
                                        var newLine = line.join(' ');
                                        var newLineWidth = bubbleCanvas.getTextWidth(newLine);

                                        if (newLineWidth > tw) {
                                            tw = newLineWidth;
                                        }

                                        lines.push(newLine);
                                        line = [];
                                    }
                                }

                                var w = tw + 16;
                                var h = (lines.length * 16) + 8;

                                if (w < 20) {
                                    w = 20;
                                }

                                x = message.loc.h + offsetX;
                                y = message.loc.v + offsetY;
                                r = x + w;
                                b = y + h;

                                if (bubbleCanvas.width() < r) {
                                    offsetX = -11;
                                    x -= (w * 1.3);
                                    r = x + w;
                                }

                                if (bubbleCanvas.height() < b) {
                                    offsetY = -11;
                                    y -= (h * 1.3);
                                    b = y + h;
                                }

                                if (message.type === 'sticky') {
                                    offsetX = 0;
                                    offsetY = 0;
                                }

                                message.offsetX = offsetX;
                                message.offsetY = offsetY;
                                message.lines = lines;
                                message.tw = tw;
                                message.w = w;
                                message.h = h;
                                message.x = x;
                                message.y = y;
                                message.r = r;
                                message.b = b;
                            }
                            else {
                                offsetX = message.offsetX;
                                offsetY = message.offsetY;
                                lines = message.lines;
                                tw = message.tw;
                                w = message.w;
                                h = message.h;
                                x = message.x;
                                y = message.y;
                                r = message.r;
                                b = message.b;
                            }

                            px = message.loc.h;
                            py = message.loc.v;

                            var radius = 0;

                            bubbleCanvas.strokeStyle('black');
                            bubbleCanvas.lineWidth('2');

                            switch (message.type) {
                                case 'normal':
                                    var con1, con2, dir;

                                    radius = 10;

                                    if (py < y || py > y + h) {
                                        con1 = Math.min(Math.max(x + radius, px - 10), r - radius - 20);
                                        con2 = Math.min(Math.max(x + radius + 20, px + 10), r - radius);
                                    }
                                    else {
                                        con1 = Math.min(Math.max(y + radius, py - 10), b - radius - 20);
                                        con2 = Math.min(Math.max(y + radius + 20, py + 10), b - radius);
                                    }

                                    if (py < y) dir = 2;
                                    if (py > y) dir = 3;
                                    if (px < x && py >= y && py <= b) dir = 0;
                                    if (px > x && py >= y && py <= b) dir = 1;
                                    if (px >= x && px <= r && py >= y && py <= b) dir = -1;

                                    bubbleCanvas.moveTo(x + radius, y);

                                    if (dir === 2) {
                                        bubbleCanvas.lineTo(con1, y);
                                        bubbleCanvas.lineTo(px, py);
                                        bubbleCanvas.lineTo(con2, y);
                                    }

                                    bubbleCanvas.lineTo(r - radius, y);
                                    bubbleCanvas.quadraticCurveTo(r, y, r, y + radius);

                                    if (dir === 1) {
                                        bubbleCanvas.lineTo(r, con1);
                                        bubbleCanvas.lineTo(px, py);
                                        bubbleCanvas.lineTo(r, con2);
                                    }

                                    bubbleCanvas.lineTo(r, b - radius);
                                    bubbleCanvas.quadraticCurveTo(r, b, r - radius, b);

                                    if (dir === 3) {
                                        bubbleCanvas.lineTo(con2, b);
                                        bubbleCanvas.lineTo(px, py);
                                        bubbleCanvas.lineTo(con1, b);
                                    }

                                    bubbleCanvas.lineTo(x + radius, b);
                                    bubbleCanvas.quadraticCurveTo(x, b, x, b - radius);

                                    if (dir === 0) {
                                        bubbleCanvas.lineTo(x, con2);
                                        bubbleCanvas.lineTo(px, py);
                                        bubbleCanvas.lineTo(x, con1);
                                    }

                                    bubbleCanvas.lineTo(x, y + radius);
                                    bubbleCanvas.quadraticCurveTo(x, y, x + radius, y);

                                    bubbleCanvas.fill();
                                    bubbleCanvas.stroke();

                                    break;
                                case 'shout':
                                    radius = 10;

                                    var SpikeDisplace = 20;
                                    var SpikeHeight = 16;
                                    var SpikeWidth = 12;

                                    var r = {
                                        left: x,
                                        right: x + w,
                                        top: y,
                                        bottom: y + h,
                                    };

                                    var hp = (r.right - r.left) / SpikeWidth;
                                    if (hp < 2)
                                        hp = 2;
                                    var vp = (r.bottom - r.top) / SpikeWidth;
                                    if (vp < 2)
                                        vp = 2;
                                    var hw = (r.right - r.left) / hp;
                                    var vw = (r.bottom - r.top) / vp;

                                    bubbleCanvas.moveTo(r.left, r.top);

                                    for (var tx = 0; tx < hp; ++tx) {
                                        px = r.left + tx * hw + hw / 2 + (tx * SpikeDisplace) / (hp - 1) - SpikeDisplace / 2;
                                        py = r.top - SpikeHeight;
                                        bubbleCanvas.lineTo(px, py);
                                        bubbleCanvas.lineTo(r.left + tx * hw + hw, r.top);
                                    }

                                    for (var ty = 0; ty < vp; ++ty) {
                                        px = r.right + SpikeHeight;
                                        py = r.top + ty * vw + vw / 2 + (ty * SpikeDisplace) / (vp - 1) - SpikeDisplace / 2;
                                        bubbleCanvas.lineTo(px, py);
                                        bubbleCanvas.lineTo(r.right, r.top + ty * vw + vw);
                                    }

                                    for (var tx = 0; tx < hp; ++tx) {
                                        px = r.right - tx * hw - hw / 2 + ((hp - 1 - tx) * SpikeDisplace) / (hp - 1) - SpikeDisplace / 2;
                                        py = r.bottom + SpikeHeight;
                                        bubbleCanvas.lineTo(px, py);
                                        bubbleCanvas.lineTo(r.right - tx * hw - hw, r.bottom);
                                    }

                                    for (var ty = 0; ty < vp; ++ty) {
                                        px = r.left - SpikeHeight;
                                        py = r.bottom - ty * vw - vw / 2 + ((vp - 1 - ty) * SpikeDisplace) / (vp - 1) - SpikeDisplace / 2;
                                        bubbleCanvas.lineTo(px, py);
                                        bubbleCanvas.lineTo(r.left, r.bottom - ty * vw - vw);
                                    }

                                    bubbleCanvas.lineTo(r.left, r.top);

                                    bubbleCanvas.fill();
                                    bubbleCanvas.stroke();

                                    break;
                                case 'thought':
                                    radius = 10;

                                    bubbleCanvas.beginPath();
                                    bubbleCanvas.arc(px, py, 8, 0, 2 * Math.PI, false);
                                    bubbleCanvas.fill();

                                    bubbleCanvas.moveTo(x + radius, y);

                                    bubbleCanvas.lineTo(r - radius, y);
                                    bubbleCanvas.quadraticCurveTo(r, y, r, y + radius);
                                    bubbleCanvas.lineTo(r, y + h - radius);
                                    bubbleCanvas.quadraticCurveTo(r, b, r - radius, b);
                                    bubbleCanvas.lineTo(x + radius, b);
                                    bubbleCanvas.quadraticCurveTo(x, b, x, b - radius);
                                    bubbleCanvas.lineTo(x, y + radius);
                                    bubbleCanvas.quadraticCurveTo(x, y, x + radius, y);

                                    bubbleCanvas.fill();
                                    bubbleCanvas.stroke();

                                    break;
                                case 'sticky':
                                    radius = 1;

                                    bubbleCanvas.moveTo(x + radius, y);

                                    bubbleCanvas.lineTo(r - radius, y);
                                    bubbleCanvas.quadraticCurveTo(r, y, r, y + radius);
                                    bubbleCanvas.lineTo(r, y + h - radius);
                                    bubbleCanvas.quadraticCurveTo(r, b, r - radius, b);
                                    bubbleCanvas.lineTo(x + radius, b);
                                    bubbleCanvas.quadraticCurveTo(x, b, x, b - radius);
                                    bubbleCanvas.lineTo(x, y + radius);
                                    bubbleCanvas.quadraticCurveTo(x, y, x + radius, y);

                                    bubbleCanvas.fill();
                                    bubbleCanvas.stroke();

                                    break;
                            }

                            bubbleCanvas.lineWidth('1');
                            bubbleCanvas.fillStyle('black');

                            for (var k = 0; k < lines.length; k++) {
                                bubbleCanvas.drawText(lines[k], x + 8, y + Math.abs(offsetY ? offsetY : 11) + 5 + (k * 16), tw, true);
                            }
                        }

                        $scope.model.Interface.messageTimer = $timeout(
                            manageMessageQueue,
                            550,
                            false
                        );
                    }
                });

                var registerPropSpec = (function (propSpec, refNum) {
                    if ($scope.model.Screen.assetCache[propSpec.id]) {
                        propSpec.prop = $scope.model.Screen.assetCache[propSpec.id];
                    }
                    else {
                        mvcEndPoints.GetAsset(propSpec.id).then(function (response) {
                            var packet = new Packet(response, true);
                            packet.endian = true;

                            var assetID = packet.ReadInt(true);
                            var assetCrc = packet.ReadInt();
                            var assetFlags = packet.ReadInt();
                            var assetName = packet.ReadPString(128, 0, 1);
                            var assetData = packet.getRawData();

                            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                                if ($scope.model.RoomInfo.UserList[j].userID === refNum || refNum === 0) {
                                    var userRef = $scope.model.RoomInfo.UserList[j];

                                    for (var k = 0; k < userRef.propSpec.length; k++) {
                                        var propSpec = userRef.propSpec[k];

                                        if (propSpec.id === assetID && !propSpec.prop) {
                                            propSpec.prop = new Prop($scope, assetID, assetCrc, undefined, assetData);
                                            propSpec.prop.endian = true;
                                            propSpec.prop.asset.name = assetName;
                                            propSpec.prop.asset.flags = assetFlags;

                                            propSpec.prop.decodeProp($scope.model.ServerInfo.mediaUrl);

                                            if (propSpec.prop.ready && !propSpec.prop.badProp) {
                                                $scope.model.Screen.assetCache[assetID] = propSpec.prop;

                                                $scope.Screen_OnDraw('spriteLayerUpdate');

                                                $scope.$apply();
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                });

                var decodeMessage = (function (isWhisper, refNum, message) {
                    var user = null;

                    if (refNum > 0) {
                        for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                            if ($scope.model.RoomInfo.UserList[j].userID === refNum) {
                                user = $scope.model.RoomInfo.UserList[j];

                                $scope.model.Interface.LogList.push({
                                    userName: user.name,
                                    text: message.text,
                                    isWhisper: isWhisper,
                                });

                                break;
                            }
                        }
                    }
                    else {
                        $scope.model.Interface.LogList.push({
                            userName: 'Server',
                            text: message.text,
                            isWhisper: isWhisper,
                        });
                    }

                    if (!message.localmsg && refNum > 0) {
                        var localVariables = {
                            'CHATSTR': {
                                type: 'string',
                                value: message.text,
                            },
                            'WHOCHAT': {
                                type: 'number',
                                value: refNum,
                            },
                        };

                        var localFlags = {
                            'CHATSTR': {
                                'global': false,
                                depth: -1,
                            },
                            'WHOCHAT': {
                                'global': false,
                                depth: -1,
                            },
                        };

                        if ($scope.model.Application.cyborg['INCHAT']) {
                            iptService.iptExecutor(
                                $scope.model.Application.cyborg['INCHAT'],
                                localVariables,
                                localFlags);
                        }

                        for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                            $scope.Spot_OnEvent(
                                $scope.model.RoomInfo.SpotList[j].id,
                                'INCHAT',
                                localVariables,
                                localFlags);
                        }

                        message.text = localVariables['CHATSTR'].value;
                    }

                    if ((message.text || '').trim() !== '') {
                        var pos = user && user.roomPos || {
                            h: 0,
                            v: 0,
                        };
                        var type = 'normal';

                        if (message.text.indexOf('@') > -1 && (match = (/^\s*[@]([0-9]+)[,]([0-9]+)\s*(.*)/i).exec(message.text))) {
                            pos = {
                                v: $window.parseInt(match[2], 10),
                                h: $window.parseInt(match[1], 10),
                            };

                            message.text = match[3];
                        }

                        if ((match = (/^\s*([!:;\^])\s*(.*)/i).exec(message.text))) {
                            switch (match[1]) {
                                case '!':
                                    type = 'shout';

                                    break;
                                case ':':
                                    type = 'thought';

                                    break;
                                case '^':
                                    type = 'sticky';

                                    break;
                                case ';':
                                    type = 'hidden';

                                    break;
                            }

                            message.text = match[2];
                        }

                        if (message.text.indexOf(')') > -1 && (match = (/^\s*[\)]([a-z0-9\._]+)\s*(.*)/i).exec(message.text))) {
                            var soundFile = match[1];
                            var soundUrl = $scope.model.ServerInfo.mediaUrl + ($scope.model.ServerInfo.mediaUrl.substring($scope.model.ServerInfo.mediaUrl.length - 1, $scope.model.ServerInfo.mediaUrl.length) === '/' ? '' : '/') + soundFile;

                            $scope.model.Application.soundPlayer.preload({
                                sourceUrl: soundUrl,
                                resolve: function (response) {
                                    this.play();
                                },
                                reject: function (errors) {
                                },
                            });

                            $scope.model.Application.soundPlayer.load();

                            message.text = match[2];
                        }

                        if ((message.text || '').trim() !== '' && type !== 'hidden') {
                            var loop = false;

                            do {
                                loop = false;

                                for (var k = 0; k < $scope.model.Interface.messageQueue.length; k++) {
                                    var _message = $scope.model.Interface.messageQueue[k];

                                    if (_message.userId === refNum && _message.type === 'sticky') {
                                        $scope.model.Interface.messageQueue.splice(k, 1);

                                        loop = true;

                                        break;
                                    }
                                }
                            } while (loop);

                            $scope.model.Interface.messageQueue.push({
                                duration: Math.floor(((new Date()).getTime() / 1000) + (message.text.length * 0.4)),
                                loc: pos,
                                type: type,
                                userId: refNum,
                                text: message.text,
                                isWhisper: isWhisper,
                            });

                            manageMessageQueue();
                        }
                    }

                    $scope.$apply();
                });

                var decodeDrawCmd = (function (type, layer, dataStr) {
                    var data = utilService.ReadPalaceString(dataStr);

                    var drawCmdData = new Packet();
                    drawCmdData.endian = true;
                    drawCmdData.setRawData(data);

                    var drawCmd = {
                        type: type,
                        layer: layer,
                    };

                    switch (type) {
                        case 'DC_Delete':
                            $scope.model.RoomInfo.DrawCmds.splice($scope.model.RoomInfo.DrawCmds.length - 1, 1);

                            return;
                        case 'DC_Detonate':
                            $scope.model.RoomInfo.DrawCmds = [];

                            return;
                        case 'DC_Path':
                            drawCmd.penSize = drawCmdData.ReadShort(true);
                            var nbrPoints = drawCmdData.ReadShort(true);
                            var foreColorRed = drawCmdData.ReadByte();
                            drawCmdData.ReadByte();
                            var foreColorGreen = drawCmdData.ReadByte();
                            drawCmdData.ReadByte();
                            var foreColorBlue = drawCmdData.ReadByte();
                            drawCmdData.ReadByte();
                            drawCmd.locPosY = drawCmdData.ReadShort(true);
                            drawCmd.locPosX = drawCmdData.ReadShort(true);

                            drawCmd.foreColor = '#'.concat(utilService.IntToHex(foreColorRed, 2), utilService.IntToHex(foreColorGreen, 2), utilService.IntToHex(foreColorBlue, 2));

                            drawCmd.points = [];

                            if (nbrPoints > 0) {
                                for (var point_idx = 0; point_idx < nbrPoints; point_idx++) {
                                    var point = {};

                                    point.locPosY = drawCmdData.ReadShort(true);
                                    point.locPosX = drawCmdData.ReadShort(true);

                                    drawCmd.points.push(point);
                                }

                                var lastPos = {
                                    locPosY: drawCmd.locPosY,
                                    locPosX: drawCmd.locPosX,
                                };

                                drawCmd.coords = $.map(drawCmd.points, function (loc) {
                                    lastPos.locPosY += loc.locPosY;
                                    lastPos.locPosX += loc.locPosX;

                                    return {
                                        v: lastPos.locPosY,
                                        h: lastPos.locPosX,
                                    };
                                });
                            }
                            else {
                                drawCmd.coords = [{
                                    v: drawCmd.locPosY,
                                    h: drawCmd.locPosX + 1,
                                }];
                            }

                            drawCmd.coords.splice(0, 0, {
                                v: drawCmd.locPosY,
                                h: drawCmd.locPosX,
                            });

                            break;
                    }

                    $scope.model.RoomInfo.DrawCmds.push(drawCmd);
                });

                $scope.encodeDrawCmd = (function (startPoint, points) {
                    var drawCmdData = new Packet();
                    drawCmdData.endian = true;

                    drawCmdData.WriteShort($scope.model.Screen.paintPenSize);
                    drawCmdData.WriteShort(points.length); //nbrPoints
                    drawCmdData.WriteByte($scope.model.Screen.paintPenColor.r);
                    drawCmdData.WriteByte($scope.model.Screen.paintPenColor.r);
                    drawCmdData.WriteByte($scope.model.Screen.paintPenColor.g);
                    drawCmdData.WriteByte($scope.model.Screen.paintPenColor.g);
                    drawCmdData.WriteByte($scope.model.Screen.paintPenColor.b);
                    drawCmdData.WriteByte($scope.model.Screen.paintPenColor.b);
                    drawCmdData.WriteShort(startPoint.v); //penPos.locPosY
                    drawCmdData.WriteShort(startPoint.h); //penPos.locPosX

                    for (var j = 0; j < points.length; j++) {
                        drawCmdData.WriteShort(points[j].v); //point.locPosY (delta)
                        drawCmdData.WriteShort(points[j].h); //point.locPosX (delta)
                    }

                    $scope.serverSend(
                        'MSG_DRAW',
                        {
                            type: 'DC_Path',
                            layer: $scope.model.Screen.paintLayer,
                            data: utilService.WritePalaceString(drawCmdData.getRawData()),
                        });
                });

                $scope.serverSend = (function (eventType, objectRef) {
                    if (!$scope.model.ConnectionInfo.connected) {
                        return;
                    }

                    connection.send(
                        eventType,
                        $scope.model.UserInfo.userId,
                        objectRef ? JSON.stringify(objectRef) : null);
                });

                $scope.userSlide = (function (dx, dy) {
                    for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                        if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                            var xCoord = $scope.model.RoomInfo.UserList[j].roomPos.h += dx;
                            var yCoord = $scope.model.RoomInfo.UserList[j].roomPos.v += dy;

                            $scope.setPos({
                                h: xCoord,
                                v: yCoord,
                            });

                            break;
                        }
                    }

                    $scope.Screen_OnDraw('nametagsLayerUpdate', 'spriteLayerUpdate');

                    $scope.$apply();
                });

                $scope.dimRoom = (function (alpha) {
                    $scope.model.Screen.layers['dimroomCanvas'].clearRect();
                    $scope.model.Screen.layers['dimroomCanvas'].globalAlpha(alpha);
                    $scope.model.Screen.layers['dimroomCanvas'].rect();
                    $scope.model.Screen.layers['dimroomCanvas'].fill();
                });

                $scope.setStatusMsg = (function (message) {
                    if (message) {
                        if ($scope.model.Interface.statusMessageTimer) {
                            $timeout.cancel($scope.model.Interface.statusMessageTimer);
                        }

                        $scope.model.Interface.statusMessage = message;

                        $scope.model.Interface.statusMessageTimer = $timeout(
                            function ($scope) {
                                $scope.model.Interface.statusMessageTimer = null;

                                $scope.setStatusMsg();

                                $scope.$apply();
                            },
                            5000,
                            false,
                            $scope);
                    }
                    else if ($scope.model.Interface.whisperTargetId > 0) {
                        var user = null;

                        for (var j = 0; !user && j < $scope.model.RoomInfo.UserList.length; j++) {
                            if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.Interface.whisperTargetId) {
                                user = $scope.model.RoomInfo.UserList[j];

                                break;
                            }
                        }

                        for (var j = 0; !user && j < $scope.model.Interface.UserList.length; j++) {
                            if ($scope.model.Interface.UserList[j].primaryID === $scope.model.Interface.whisperTargetId) {
                                user = $scope.model.Interface.UserList[j];

                                break;
                            }
                        }

                        if (user) {
                            $scope.model.Interface.statusMessage = ''.concat('Now whispering to: ', user.name);
                        }
                    }
                    else {
                        $scope.model.Interface.statusMessage = $scope.model.RoomInfo.name;
                    }
                });

                $scope.setFace = (function (value) {
                    value = value % 16;

                    for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                        if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                            $scope.model.RoomInfo.UserList[j].faceNbr = value;

                            break;
                        }
                    }

                    $scope.serverSend(
                        'MSG_USERFACE',
                        {
                            faceNbr: value,
                        });

                    $scope.Screen_OnDraw('spriteLayerUpdate');
                });

                $scope.setColor = (function (value) {
                    value = value % 16;

                    for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                        if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                            $scope.model.RoomInfo.UserList[j].colorNbr = value;

                            break;
                        }
                    }

                    $scope.serverSend(
                        'MSG_USERCOLOR',
                        {
                            colorNbr: value,
                        }
                    );

                    $scope.Screen_OnDraw('spriteLayerUpdate');
                });

                $scope.setProps = (function (propSpec) {
                    for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                        if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                            $scope.model.RoomInfo.UserList[j].propSpec = propSpec;

                            break;
                        }
                    }

                    var newPropSpec = [];
                    for (var j = 0; j < propSpec.length; j++) {
                        newPropSpec.push({
                            crc: propSpec[j].crc,
                            id: propSpec[j].id,
                        });
                    }

                    $scope.serverSend(
                        'MSG_USERPROP',
                        {
                            propSpec: newPropSpec,
                        }
                    );

                    $scope.Screen_OnDraw('spriteLayerUpdate');
                });

                $scope.setPos = (function (pos) {
                    for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                        if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                            $scope.model.RoomInfo.UserList[j].roomPos = pos;

                            break;
                        }
                    }

                    var loop = false;

                    do {
                        loop = false;

                        for (var j = 0; j < $scope.model.Interface.messageQueue.length; j++) {
                            if ($scope.model.Interface.messageQueue[j].userId === $scope.model.UserInfo.userId) {
                                $scope.model.Interface.messageQueue.splice(j, 1);

                                loop = true;

                                break;
                            }
                        }
                    } while (loop);

                    manageMessageQueue();

                    $scope.serverSend(
                        'MSG_USERMOVE',
                        {
                            pos: pos,
                        });

                    //$scope.serverSend('MSG_TEST', {});
                });

                $scope.roomGoto = (function (roomID) {
                    if ($scope.model.Application.cyborg['LEAVE']) {
                        iptService.iptExecutor($scope.model.Application.cyborg['LEAVE']);
                    }

                    for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                        $scope.Spot_OnEvent($scope.model.RoomInfo.SpotList[j].id, 'LEAVE');
                    }

                    $scope.serverSend(
                        'MSG_ROOMGOTO',
                        {
                            dest: roomID,
                        });
                });

                $scope.Toolbar_OnClick = (function (propertyName) {
                    $scope.model.Interface[propertyName] = !$scope.model.Interface[propertyName];

                    if ($scope.model.Interface[propertyName]) {
                        var panel = $(''.concat('#', propertyName.substring(4).toLowerCase()));

                        panel.css('left', 0);
                        panel.css('top', 0);

                        switch (propertyName) {
                            case 'showUserList':
                                $scope.ListOfAllUsersRefresh_OnClick();

                                break;
                            case 'showRoomList':
                                $scope.ListOfAllRoomsRefresh_OnClick();

                                break;
                        }
                    }
                });

                $scope.RoomGoto_OnClick = (function (type) {
                    if (type === 'room' && $scope.ListOfAllRooms_Options.gridApi.selection && $scope.ListOfAllRooms_Options.gridApi.selection.getSelectedRows().length > 0) {
                        $scope.roomGoto($scope.ListOfAllRooms_Options.gridApi.selection.getSelectedRows()[0].primaryID);
                    } else if (type === 'user' && $scope.ListOfAllUsers_Options.gridApi.selection && $scope.ListOfAllUsers_Options.gridApi.selection.getSelectedRows().length > 0) {
                        $scope.roomGoto($scope.ListOfAllUsers_Options.gridApi.selection.getSelectedRows()[0].refNum);
                    }
                });

                $scope.Spot_OnEvent = (function (spotID, eventName, nestedVariables, nestedFlags) {
                    var localVariables = nestedVariables || {};
                    var localFlags = nestedFlags || {};

                    localFlags['ME'] = {
                        'global': false,
                        depth: -1,
                    };

                    for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                        if ($scope.model.RoomInfo.SpotList[j].id === spotID) {
                            if ($scope.model.RoomInfo.SpotList[j].events && $scope.model.RoomInfo.SpotList[j].events[eventName]) {
                                localVariables['ME'] = $scope.model.RoomInfo.SpotList[j].id;

                                iptService.iptExecutor(
                                    $scope.model.RoomInfo.SpotList[j].events[eventName],
                                    localVariables,
                                    localFlags);
                            }

                            break;
                        }
                    }
                });

                $scope.Menu_OnClick = (function ($event, opCode) {
                    switch (opCode) {
                        case 'PROPDEL':
                            $scope.serverSend(
                                'MSG_PROPDEL',
                                {
                                    propNum: $scope.model.Interface.contextMenu.targetId,
                                });

                            $scope.model.Interface.contextMenu.type = null;

                            break;
                        case 'USERPROP':
                            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                                if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                                    if (!$scope.model.RoomInfo.UserList[j].propSpec) {
                                        $scope.model.RoomInfo.UserList[j].propSpec = [];
                                    }

                                    if ($scope.model.RoomInfo.UserList[j].propSpec.length < 9) {
                                        $scope.model.RoomInfo.UserList[j].propSpec.push($scope.model.RoomInfo.LooseProps[$scope.model.Interface.contextMenu.targetId].propSpec);

                                        $scope.setProps($scope.model.RoomInfo.UserList[j].propSpec);
                                    }

                                    break;
                                }
                            }

                            $scope.model.Interface.contextMenu.type = null;

                            break;
                        case 'WHISPER':
                            if ($scope.model.Interface.whisperTargetId === 0 || $scope.model.Interface.whisperTargetId !== $scope.model.Interface.contextMenu.targetId) {
                                $scope.model.Interface.whisperTargetId = $scope.model.Interface.contextMenu.targetId;
                            }
                            else {
                                $scope.model.Interface.whisperTargetId = 0;
                            }

                            $scope.setStatusMsg();

                            $scope.Screen_OnDraw('nametagsLayerUpdate');

                            $scope.model.Interface.contextMenu.type = null;

                            break;
                        case 'OFFER':
                            $scope.serverSend(
                                'MSG_XWHISPER',
                                {
                                    target: $scope.model.Interface.contextMenu.targetId,
                                    text: "`offer",
                                });
                            $scope.model.Interface.contextMenu.type = null;

                            break;
                        case 'KILLUSER':
                            if (!$scope.model.UserInfo.hasAdmin) {
                                return;
                            }

                            $scope.serverSend(
                                'MSG_KILLUSER',
                                {
                                    target: $scope.model.Interface.contextMenu.targetId,
                                });

                            $scope.model.Interface.contextMenu.type = null;

                            break;
                        case 'CLIENTSETTINGS':
                            var copy = {
                                ClientSettings: $.extend(true, {}, $scope.model.ClientSettings),
                            };

                            dialogService.clientSettings(copy).then(function (response) {
                                if (response) {
                                    if ($scope.model.ClientSettings.userName !== response.ClientSettings.userName) {
                                        $scope.serverSend(
                                            'MSG_USERNAME',
                                            {
                                                name: response.ClientSettings.userName,
                                            });
                                    }

                                    $scope.model.ClientSettings = response.ClientSettings;

                                    $scope.Screen_OnDraw('nametagsLayerUpdate');
                                }

                                return;
                            }, function (errors) {
                                return;
                            });
                            $scope.model.Interface.contextMenu.type = null;

                            break;
                        case 'NAKED':
                            $scope.serverSend(
                                'MSG_USERPROP',
                                {
                                    nbrProps: 0,
                                    propSpec: null,
                                });

                            $scope.model.Interface.contextMenu.type = null;

                            break;
                        case 'ADMINSETTINGS':
                            $scope.model.Interface.contextMenu.type = 'admin';

                            $scope.model.Interface.contextMenu.positionX = $event.originalEvent.clientX - 10;
                            $scope.model.Interface.contextMenu.positionY = $event.originalEvent.clientY - 10;

                            break;
                        case 'AUTHORINGMODE':
                            $scope.model.Interface.authoringMode = !$scope.model.Interface.authoringMode;
                            $scope.model.Interface.contextMenu.type = null;

                            $scope.Screen_OnDraw('spotLayerUpdate');

                            break;
                        case 'ROOMINFO':
                            var copy = $.extend(false, {}, $scope.model.RoomInfo);

                            if (copy) {
                                dialogService.roomInfo(copy).then(function (response) {
                                    if (response) {
                                        $scope.model.RoomInfo.name = response.name;

                                        $scope.serverSend(
                                            'MSG_ROOMINFO',
                                            {
                                                roomID: response.roomId,
                                                name: response.name,
                                                flags: response.flags,
                                                pictName: response.pictName,
                                                artistName: response.artistName,
                                                facesID: response.facesID,
                                            });
                                    }

                                    return;
                                }, function (errors) {
                                    return;
                                });

                                $scope.model.Interface.contextMenu.type = null;
                            }

                            break;
                        case 'SPOTINFO':
                            var roomList = [];
                            var pictIDs = [];
                            var copy = null;

                            for (var j = 0; j < $scope.model.Interface.RoomList.length; j++) {
                                roomList.push({
                                    id: $scope.model.Interface.RoomList[j].primaryID,
                                    name: $scope.model.Interface.RoomList[j].name,
                                });
                            }

                            for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                                if ($scope.model.RoomInfo.SpotList[j].id === $scope.model.Interface.contextMenu.targetId) {
                                    copy = $.extend(false, {}, $scope.model.RoomInfo.SpotList[j]);
                                }

                                for (var k = 0; k < $scope.model.RoomInfo.SpotList[j].states.length; k++) {
                                    if (pictIDs.indexOf($scope.model.RoomInfo.SpotList[j].states[k].pictID) === -1) {
                                        pictIDs.push($scope.model.RoomInfo.SpotList[j].states[k].pictID);
                                    }
                                }
                            }

                            if (copy) {
                                dialogService.spotInfo($scope.model.UserInfo, roomList, $scope.model.RoomInfo.PictureList, pictIDs, copy).then(function (response) {
                                    if (response) {
                                        for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                                            if ($scope.model.RoomInfo.SpotList[j].id === $scope.model.Interface.contextMenu.targetId) {
                                                $scope.model.RoomInfo.SpotList[j] = response;
                                                $scope.model.RoomInfo.PictureList = response.pictureList;

                                                $scope.serverSend(
                                                    'MSG_SPOTINFO',
                                                    {
                                                        roomID: $scope.model.RoomInfo.roomId,
                                                        spotID: response.id,
                                                        type: response.type,
                                                        state: response.state,
                                                        states: response.states,
                                                        script: response.script,
                                                        name: response.name,
                                                        loc: response.loc,
                                                        dest: response.dest,
                                                        flags: response.flags,
                                                        pictureList: response.pictureList,
                                                    });

                                                break;
                                            }
                                        }
                                    }

                                    return;
                                }, function (errors) {
                                    return;
                                });

                                $scope.model.Interface.contextMenu.type = null;
                            }

                            break;
                        case 'SPOTNEW':
                            $scope.serverSend('MSG_SPOTNEW');

                            $scope.model.Interface.contextMenu.type = null;

                            break;
                        case 'SPOTDEL':
                            dialogService.yesNo('Are you sure you want to delete spot ID ' + $scope.model.Interface.contextMenu.targetId + '?').then(function (response) {
                                if (response) {
                                    $scope.serverSend(
                                        'MSG_SPOTDEL',
                                        {
                                            roomID: $scope.model.RoomInfo.roomId,
                                            spotID: $scope.model.Interface.contextMenu.targetId,
                                        });
                                }

                                return;
                            }, function (errors) {
                                return;
                            });

                            $scope.model.Interface.contextMenu.type = null;

                            break;
                        default:
                            $scope.model.Interface.contextMenu.type = null;

                            break;
                    }
                });

                $scope.Screen_OnDraw = (function () {
                    if (arguments.length > 0) {
                        for (var j = 0; j < arguments.length; j++) {
                            $scope.model.Screen[arguments[j]] = true;
                        }
                    }

                    var loosepropsCanvas = $scope.model.Screen.layers['loosepropsCanvas'];
                    var bgDrawCmdCanvas = $scope.model.Screen.layers['bgDrawCmdCanvas'];
                    var fgDrawCmdCanvas = $scope.model.Screen.layers['fgDrawCmdCanvas'];
                    var nametagsCanvas = $scope.model.Screen.layers['nametagsCanvas'];
                    var spriteCanvas = $scope.model.Screen.layers['spriteCanvas'];
                    var spotCanvas = $scope.model.Screen.layers['spotCanvas'];

                    if ($scope.model.Screen.nametagsLayerUpdate) {
                        nametagsCanvas.clearRect();
                    }

                    if ($scope.model.Screen.drawCmdLayerUpdate) {
                        bgDrawCmdCanvas.lineJoin('round');
                        fgDrawCmdCanvas.lineJoin('round');
                        bgDrawCmdCanvas.clearRect();
                        fgDrawCmdCanvas.clearRect();
                    }

                    if ($scope.model.Screen.loosepropLayerUpdate) {
                        loosepropsCanvas.clearRect();
                    }

                    if ($scope.model.Screen.spriteLayerUpdate) {
                        spriteCanvas.clearRect();
                    }

                    if ($scope.model.Screen.spotLayerUpdate) {
                        spotCanvas.clearRect();
                    }

                    if ($scope.model.Screen.loosepropLayerUpdate) {
                        if ($scope.model.Interface.wornpropMouseDown !== -1) {
                            var wornprop = $scope.model.Interface.wornpropMouseDown;

                            if (wornprop.prop && wornprop.prop.ready) {
                                var xCoord = wornprop.loc.h;
                                var yCoord = wornprop.loc.v;

                                //xCoord += wornprop.prop.horizontalOffset;
                                //yCoord += wornprop.prop.verticalOffset;

                                loosepropsCanvas.drawImage(wornprop.prop.imageObject.image, xCoord, yCoord, wornprop.prop.width, wornprop.prop.height, 0, 0, wornprop.prop.width, wornprop.prop.height);
                            }
                        }

                        for (var j = 0; j < $scope.model.RoomInfo.LooseProps.length; j++) {
                            var looseprop = $scope.model.RoomInfo.LooseProps[j];

                            if (!looseprop.propSpec.prop || !looseprop.propSpec.prop.ready || !looseprop.propSpec.prop.imageObject) continue;

                            var xCoord = looseprop.loc.h;
                            var yCoord = looseprop.loc.v;

                            loosepropsCanvas.drawImage(looseprop.propSpec.prop.imageObject.image, xCoord, yCoord, looseprop.propSpec.prop.width, looseprop.propSpec.prop.height, 0, 0, looseprop.propSpec.prop.width, looseprop.propSpec.prop.height);
                        }
                    }

                    if ($scope.model.Screen.spotLayerUpdate) {
                        spotCanvas.strokeStyleRgba(255, 255, 255, 1);
                        spotCanvas.fillStyleRgba(255, 255, 255, 0.3);

                        for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                            var spot = $scope.model.RoomInfo.SpotList[j];

                            if ($scope.model.RoomInfo.backgroundObject && $scope.model.RoomInfo.backgroundObject.width > 0 && $scope.model.RoomInfo.backgroundObject.height > 0 &&
                                spot.states && spot.states.length > 0 && spot.state < spot.states.length) {
                                var state = spot.states[spot.state];

                                for (var k = 0; k < $scope.model.RoomInfo.PictureList.length; k++) {
                                    if ($scope.model.RoomInfo.PictureList[k].picID === state.pictID) {
                                        var imageObject = $scope.model.RoomInfo.PictureList[k].imageObject;

                                        if (imageObject && imageObject.height > 0 && imageObject.width > 0) {
                                            var xCoord = spot.loc.h + state.picLoc.h - $window.parseInt($scope.model.RoomInfo.backgroundObject.width / 2);
                                            var yCoord = spot.loc.v + state.picLoc.v - $window.parseInt($scope.model.RoomInfo.backgroundObject.height / 2);

                                            spotCanvas.drawImage(imageObject.image, xCoord, yCoord, imageObject.width, imageObject.height, 0, 0, imageObject.width, imageObject.height);
                                        }

                                        break;
                                    }
                                }
                            }
                        }

                        for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                            var spot = $scope.model.RoomInfo.SpotList[j];

                            if ((
                                $scope.model.Interface.authoringMode || (spot.flags & HotSpotFlags.HF_ShowFrame) !== 0 ||
                                ((spot.flags & HotSpotFlags.HF_Invisible) === 0 && $scope.model.Screen.spotLayerShow)) &&
                                (spot.vortexes && spot.vortexes.length > 0)) {
                                var xCoord = spot.loc.h + spot.vortexes[0].h;
                                var yCoord = spot.loc.v + spot.vortexes[0].v;

                                spotCanvas.moveTo(xCoord, yCoord);

                                for (var k = spot.vortexes.length - 1; k >= 0; k--) {
                                    xCoord = spot.loc.h + spot.vortexes[k].h;
                                    yCoord = spot.loc.v + spot.vortexes[k].v;

                                    spotCanvas.lineTo(xCoord, yCoord);
                                }

                                spotCanvas.stroke();

                                if ($scope.model.Interface.authoringMode || (spot.flags & HotSpotFlags.HF_Fill) !== 0 ||
                                    ((spot.flags & HotSpotFlags.HF_Invisible) === 0 && $scope.model.Screen.spotLayerShow)) {
                                    spotCanvas.fill();
                                }
                            }
                        }
                    }

                    if ($scope.model.Screen.drawCmdLayerUpdate) {
                        for (var j = 0; j < $scope.model.RoomInfo.DrawCmds.length; j++) {
                            var drawCmd = $scope.model.RoomInfo.DrawCmds[j];

                            if (!drawCmd.coords) {
                                continue;
                            }

                            var layer = null;

                            if (drawCmd.layer) {
                                layer = fgDrawCmdCanvas;
                            }
                            else {
                                layer = bgDrawCmdCanvas;
                            }

                            layer.lineWidth(drawCmd.penSize);
                            layer.strokeStyle(drawCmd.foreColor);
                            layer.moveTo(drawCmd.locPosX, drawCmd.locPosY);

                            for (var k = 0; k < drawCmd.coords.length; k++) {
                                layer.lineTo(drawCmd.coords[k].h, drawCmd.coords[k].v);
                            }

                            layer.stroke();
                        }
                    }

                    if ($scope.model.Screen.spriteLayerUpdate || $scope.model.Screen.nametagsLayerUpdate) {
                        for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                            var user = $scope.model.RoomInfo.UserList[j];
                            var isSelf = user.userID === $scope.model.UserInfo.userId;
                            var styleIndex = isSelf ? 'mine' : $scope.model.Interface.whisperTargetId > 0 ? (user.userID === $scope.model.Interface.whisperTargetId ? 'whipertarget' : 'whipernontarget') : 'users';
                            var style = $scope.model.ClientSettings.userNameStyle[styleIndex];
                            var nameWidth = nametagsCanvas.getTextWidth(user.name);

                            nametagsCanvas.fontStyle(''.concat(style.fontStyle, ' ', style.fontWeight, ' ', style.fontSize, ' ', style.fontName));
                            nametagsCanvas.globalAlpha(style.opacity);

                            if ($scope.model.Screen.spriteLayerUpdate) {
                                var hasHeadProp = false;

                                if (user.propSpec && user.propSpec.length > 0) {
                                    for (var k = 0; k < user.propSpec.length; k++) {
                                        var propSpec = user.propSpec[k];

                                        if (!propSpec.prop || !propSpec.prop.ready) continue;

                                        hasHeadProp |= propSpec.prop.head;
                                    }
                                }

                                if (!hasHeadProp) {
                                    spriteCanvas.drawImage(smileyFaceObject.image, user.roomPos.h - 22, user.roomPos.v - 22, 45, 45, user.faceNbr * 45, user.colorNbr * 45, 45, 45);
                                }

                                if (user.propSpec && user.propSpec.length > 0) {
                                    for (var k = 0; k < user.propSpec.length; k++) {
                                        var propSpec = user.propSpec[k];

                                        if (!propSpec.prop || !propSpec.prop.ready || !propSpec.prop.imageObject) continue;

                                        var xCoord = user.roomPos.h + propSpec.prop.horizontalOffset - 22;
                                        var yCoord = user.roomPos.v + propSpec.prop.verticalOffset - 22;

                                        spriteCanvas.drawImage(propSpec.prop.imageObject.image, xCoord, yCoord, propSpec.prop.width, propSpec.prop.height, 0, 0, propSpec.prop.width, propSpec.prop.height);
                                    }
                                }
                            }

                            if ($scope.model.Screen.nametagsLayerUpdate && $scope.model.ClientSettings.showNames && $scope.model.Screen.nametagsLayerShow) {
                                var fontSize = $window.parseInt(style.fontSize, 10);
                                var padding = $window.parseInt(style.padding, 10);
                                var height = (padding * 2) + fontSize;
                                var width = (padding * 2) + nameWidth;
                                var yCoord = user.roomPos.v + (padding * 2) + padding;
                                var xCoord = user.roomPos.h - (nameWidth / 2) - padding;

                                if ($scope.model.ClientSettings.showNameShadows) {
                                    nametagsCanvas.fillStyle(style.shadowColor);
                                    nametagsCanvas.drawText(user.name, xCoord + style.shadowOffsetX, yCoord + fontSize + style.shadowOffsetY, nameWidth, true);
                                }

                                if ($scope.model.ClientSettings.showNameBackgrounds) {
                                    nametagsCanvas.fillStyle(style.backgroundColor);
                                    nametagsCanvas.drawRect(xCoord - padding, yCoord, width, height, true);
                                }

                                nametagsCanvas.fillStyle($scope.model.ClientSettings.userNameStyle.messsageColor ? '#'.concat($scope.model.ClientSettings.messages.backgroundColor[user.colorNbr % 16]) : style.foregroundColor);
                                nametagsCanvas.drawText(user.name, xCoord, yCoord + fontSize, nameWidth, true);
                            }
                        }
                    }

                    $scope.model.Screen.loosepropLayerUpdate = false;
                    $scope.model.Screen.nametagsLayerUpdate = false;
                    $scope.model.Screen.drawCmdLayerUpdate = false;
                    $scope.model.Screen.bubbleLayerUpdate = false;
                    $scope.model.Screen.spriteLayerUpdate = false;
                    $scope.model.Screen.spotLayerUpdate = false;
                });

                $scope.Screen_OnClick = (function ($event) {
                    var windowElement = angular.element($window);
                    var screenElement = angular.element("#screen");
                    var xCoord = ($event.originalEvent.clientX - screenElement.prop('offsetLeft')) + windowElement.scrollLeft();
                    var yCoord = ($event.originalEvent.clientY - screenElement.prop('offsetTop')) + windowElement.scrollTop();
                    var personalBoundary = 44;
                    var userBoundary = 33;
                    var insideSpot = false;
                    var spot = null;

                    for (var j = 0; !insideSpot && j < $scope.model.RoomInfo.SpotList.length; j++) {
                        var polygon = [];

                        spot = $scope.model.RoomInfo.SpotList[j];

                        if (spot.vortexes && spot.vortexes.length > 0) {
                            for (var k = 0; k < spot.vortexes.length; k++) {
                                polygon.push({
                                    v: spot.loc.v + spot.vortexes[k].v,
                                    h: spot.loc.h + spot.vortexes[k].h,
                                });
                            }

                            insideSpot = utilService.pointInPolygon(polygon, {
                                v: yCoord,
                                h: xCoord,
                            });
                        }
                    }

                    if (!insideSpot) {
                        spot = null;
                    }

                    if ($scope.model.Interface.authoringMode) {
                        $scope.model.Interface.spotMouseDown = spot;
                    }
                    else {
                        var insideLooseProp = false;
                        var insideUser = false;
                        var loosepropIndex = -1;
                        var looseprop = null;
                        var user = null;

                        for (var j = 0; !insideLooseProp && j < $scope.model.RoomInfo.LooseProps.length; j++) {
                            var polygon = [];

                            looseprop = $scope.model.RoomInfo.LooseProps[j];
                            loosepropIndex = j;

                            polygon.push({
                                v: looseprop.loc.v - (looseprop.propSpec.prop.height / 2),
                                h: looseprop.loc.h - (looseprop.propSpec.prop.width / 2),
                            });

                            polygon.push({
                                v: looseprop.loc.v - (looseprop.propSpec.prop.height / 2),
                                h: looseprop.loc.h + (looseprop.propSpec.prop.width / 2),
                            });

                            polygon.push({
                                v: looseprop.loc.v + (looseprop.propSpec.prop.height / 2),
                                h: looseprop.loc.h + (looseprop.propSpec.prop.width / 2),
                            });

                            polygon.push({
                                v: looseprop.loc.v + (looseprop.propSpec.prop.height / 2),
                                h: looseprop.loc.h - (looseprop.propSpec.prop.width / 2),
                            });

                            insideLooseProp = utilService.pointInPolygon(polygon, {
                                v: yCoord,
                                h: xCoord,
                            });
                        }

                        if (!insideLooseProp) {
                            looseprop = null;
                            loosepropIndex = -1;
                        }

                        for (var j = 0; !insideUser && j < $scope.model.RoomInfo.UserList.length; j++) {
                            var polygon = [];

                            user = $scope.model.RoomInfo.UserList[j];
                            var isSelf = user.userID === $scope.model.UserInfo.userId;

                            polygon.push({
                                v: user.roomPos.v - (isSelf ? personalBoundary : userBoundary),
                                h: user.roomPos.h - (isSelf ? personalBoundary : userBoundary),
                            });

                            polygon.push({
                                v: user.roomPos.v - (isSelf ? personalBoundary : userBoundary),
                                h: user.roomPos.h + (isSelf ? personalBoundary : userBoundary),
                            });

                            polygon.push({
                                v: user.roomPos.v + (isSelf ? personalBoundary : userBoundary),
                                h: user.roomPos.h + (isSelf ? personalBoundary : userBoundary),
                            });

                            polygon.push({
                                v: user.roomPos.v + (isSelf ? personalBoundary : userBoundary),
                                h: user.roomPos.h - (isSelf ? personalBoundary : userBoundary),
                            });

                            insideUser = utilService.pointInPolygon(polygon, {
                                v: yCoord,
                                h: xCoord,
                            });
                        }

                        if (!insideUser) {
                            user = null;
                        }

                        if (user) {
                            if ($event.originalEvent.button === 0) {
                                if (user.userID === $scope.model.UserInfo.userId) {
                                    if (user.propSpec) {
                                        var insideWornProp = false;
                                        var wornProp = null;

                                        for (var j = 0; !insideWornProp && j < user.propSpec.length; j++) {
                                            var polygon = [];

                                            wornProp = user.propSpec[j];

                                            polygon.push({
                                                v: user.roomPos.v + wornProp.prop.verticalOffset - (wornProp.prop.height / 2),
                                                h: user.roomPos.h + wornProp.prop.horizontalOffset - (wornProp.prop.width / 2),
                                            });

                                            polygon.push({
                                                v: user.roomPos.v + wornProp.prop.verticalOffset - (wornProp.prop.height / 2),
                                                h: user.roomPos.h + wornProp.prop.horizontalOffset + (wornProp.prop.width / 2),
                                            });

                                            polygon.push({
                                                v: user.roomPos.v + wornProp.prop.verticalOffset + (wornProp.prop.height / 2),
                                                h: user.roomPos.h + wornProp.prop.horizontalOffset + (wornProp.prop.width / 2),
                                            });

                                            polygon.push({
                                                v: user.roomPos.v + wornProp.prop.verticalOffset + (wornProp.prop.height / 2),
                                                h: user.roomPos.h + wornProp.prop.horizontalOffset - (wornProp.prop.width / 2),
                                            });

                                            insideWornProp = utilService.pointInPolygon(polygon, {
                                                v: yCoord,
                                                h: xCoord,
                                            });
                                        }

                                        if (insideWornProp) {
                                            $scope.model.Interface.wornpropMouseDown = wornProp;
                                            $scope.model.Interface.wornpropMouseDown.loc = {
                                                h: xCoord - 22,
                                                v: yCoord - 22,
                                            };
                                        }
                                        else {
                                            $scope.setPos({
                                                h: xCoord,
                                                v: yCoord,
                                            });

                                            $scope.Screen_OnDraw('nametagsLayerUpdate', 'spriteLayerUpdate');
                                        }
                                    }
                                    else {
                                        $scope.setPos({
                                            h: xCoord,
                                            v: yCoord,
                                        });

                                        $scope.Screen_OnDraw('nametagsLayerUpdate', 'spriteLayerUpdate');
                                    }
                                }
                                else {
                                    if ($scope.model.Interface.whisperTargetId === 0 || $scope.model.Interface.whisperTargetId !== user.userID) {
                                        $scope.model.Interface.whisperTargetId = user.userID;
                                    }
                                    else {
                                        $scope.model.Interface.whisperTargetId = 0;
                                    }

                                    $scope.setStatusMsg();

                                    $scope.Screen_OnDraw('nametagsLayerUpdate');
                                }
                            }
                            else if ($event.originalEvent.button === 2) {
                                $scope.model.Interface.contextMenu.type = 'user';
                                $scope.model.Interface.contextMenu.targetId = user.userID;
                                $scope.model.Interface.contextMenu.positionX = $event.originalEvent.clientX - 10;
                                $scope.model.Interface.contextMenu.positionY = $event.originalEvent.clientY - 10;
                            }
                        }
                        else if (looseprop) {
                            if ($event.originalEvent.button === 0) {
                                $scope.model.Interface.loosepropMouseDown = loosepropIndex;
                            }
                            else if ($event.originalEvent.button === 2) {
                                $scope.model.Interface.contextMenu.type = 'looseprop';
                                $scope.model.Interface.contextMenu.targetId = loosepropIndex;
                                $scope.model.Interface.contextMenu.positionX = $event.originalEvent.clientX - 10;
                                $scope.model.Interface.contextMenu.positionY = $event.originalEvent.clientY - 10;
                            }
                        }
                        else if (spot) {
                            if ($event.originalEvent.button === 0) {
                                if ((spot.flags & (HotSpotFlags.HF_DontMoveHere | HotSpotFlags.HF_Forbidden)) === 0) {
                                    $scope.setPos({
                                        h: xCoord,
                                        v: yCoord,
                                    });

                                    $scope.Screen_OnDraw('nametagsLayerUpdate', 'spriteLayerUpdate');
                                }

                                if (spot.events && spot.events['SELECT']) {
                                    $scope.Spot_OnEvent(spot.id, 'SELECT');
                                }
                                else if (spot.type === HotSpotTypes.HS_Door && spot.dest !== 0) {
                                    $scope.roomGoto(spot.dest);
                                }
                            }
                            else if ($event.originalEvent.button === 2 && $scope.model.UserInfo.hasAdmin) {
                                $scope.model.Interface.contextMenu.type = 'hotspot';
                                $scope.model.Interface.contextMenu.targetId = spot.id;
                                $scope.model.Interface.contextMenu.positionX = $event.originalEvent.clientX - 10;
                                $scope.model.Interface.contextMenu.positionY = $event.originalEvent.clientY - 10;
                            }
                        }
                        else {
                            $scope.setPos({
                                h: xCoord,
                                v: yCoord,
                            });

                            $scope.Screen_OnDraw('nametagsLayerUpdate', 'spriteLayerUpdate');
                        }
                    }
                });

                $scope.Screen_OnMouseMove = (function ($event) {
                    var windowElement = angular.element($window);
                    var screenElement = angular.element("#screen");
                    var xCoord = ($event.originalEvent.clientX - screenElement.prop('offsetLeft')) + windowElement.scrollLeft();
                    var yCoord = ($event.originalEvent.clientY - screenElement.prop('offsetTop')) + windowElement.scrollTop();

                    $window.MousePositionX = xCoord;
                    $window.MousePositionY = yCoord;

                    if ($scope.model.Interface.authoringMode) {
                        if ($scope.model.Interface.spotMouseDown) {
                            for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                                var spot = $scope.model.RoomInfo.SpotList[j];

                                if ($scope.model.Interface.spotMouseDown.id === spot.id) {
                                    spot.loc = {
                                        v: yCoord - ($window.parseInt($scope.model.Screen.height) / 2),
                                        h: xCoord - ($window.parseInt($scope.model.Screen.width) / 2),
                                    };

                                    break;
                                }
                            }

                            $scope.Screen_OnDraw('spotLayerUpdate');
                        }
                    }
                    else {
                        var personalBoundary = 44;
                        var userBoundary = 33;
                        var insideLooseProp = false;
                        var insideUser = false;
                        var insideSpot = false;
                        var looseprop = null;
                        var spot = null;
                        var user = null;

                        for (var j = 0; !insideSpot && j < $scope.model.RoomInfo.SpotList.length; j++) {
                            var polygon = [];

                            spot = $scope.model.RoomInfo.SpotList[j];

                            if ((spot.flags & HotSpotFlags.HF_Invisible) === 0) {
                                for (var k = 0; k < spot.vortexes.length; k++) {
                                    polygon.push({
                                        v: spot.loc.v + spot.vortexes[k].v,
                                        h: spot.loc.h + spot.vortexes[k].h,
                                    });
                                }

                                insideSpot = utilService.pointInPolygon(polygon, {
                                    v: yCoord,
                                    h: xCoord,
                                });
                            }
                        }

                        if (!insideSpot) {
                            spot = null;
                        }

                        for (var j = 0; !insideLooseProp && j < $scope.model.RoomInfo.LooseProps.length; j++) {
                            var polygon = [];

                            looseprop = $scope.model.RoomInfo.LooseProps[j];

                            polygon.push({
                                v: looseprop.loc.v - (looseprop.propSpec.prop.height / 2),
                                h: looseprop.loc.h - (looseprop.propSpec.prop.width / 2),
                            });

                            polygon.push({
                                v: looseprop.loc.v - (looseprop.propSpec.prop.height / 2),
                                h: looseprop.loc.h + (looseprop.propSpec.prop.width / 2),
                            });

                            polygon.push({
                                v: looseprop.loc.v + (looseprop.propSpec.prop.height / 2),
                                h: looseprop.loc.h + (looseprop.propSpec.prop.width / 2),
                            });

                            polygon.push({
                                v: looseprop.loc.v + (looseprop.propSpec.prop.height / 2),
                                h: looseprop.loc.h - (looseprop.propSpec.prop.width / 2),
                            });

                            insideLooseProp = utilService.pointInPolygon(polygon, {
                                v: yCoord,
                                h: xCoord,
                            });
                        }

                        if (!insideLooseProp) {
                            looseprop = null;
                        }

                        for (var j = 0; !insideUser && j < $scope.model.RoomInfo.UserList.length; j++) {
                            var polygon = [];

                            user = $scope.model.RoomInfo.UserList[j];
                            var isSelf = user.userID === $scope.model.UserInfo.userId;

                            polygon.push({
                                v: user.roomPos.v - (isSelf ? personalBoundary : userBoundary),
                                h: user.roomPos.h - (isSelf ? personalBoundary : userBoundary),
                            });

                            polygon.push({
                                v: user.roomPos.v - (isSelf ? personalBoundary : userBoundary),
                                h: user.roomPos.h + (isSelf ? personalBoundary : userBoundary),
                            });

                            polygon.push({
                                v: user.roomPos.v + (isSelf ? personalBoundary : userBoundary),
                                h: user.roomPos.h + (isSelf ? personalBoundary : userBoundary),
                            });

                            polygon.push({
                                v: user.roomPos.v + (isSelf ? personalBoundary : userBoundary),
                                h: user.roomPos.h - (isSelf ? personalBoundary : userBoundary),
                            });

                            insideUser = utilService.pointInPolygon(polygon, {
                                v: yCoord,
                                h: xCoord,
                            });
                        }

                        if (!insideUser) {
                            user = null;
                        }

                        if (user && user.userID === $scope.model.UserInfo.userId && $scope.model.Interface.wornpropMouseDown !== -1) {
                            $scope.model.Interface.wornpropMouseDown.loc = {
                                v: yCoord - 22,
                                h: xCoord - 22,
                            };

                            $scope.Screen_OnDraw('loosepropLayerUpdate');
                        }

                        if (insideUser || insideLooseProp || insideSpot) {
                            $scope.model.Interface.cursor = 'pointer';
                        }
                        else {
                            $scope.model.Interface.cursor = 'default';
                        }

                        if (looseprop) {
                            $scope.model.RoomInfo.LooseProps[$scope.model.Interface.loosepropMouseDown].dirty = true;
                            $scope.model.RoomInfo.LooseProps[$scope.model.Interface.loosepropMouseDown].loc = {
                                v: yCoord - 22,
                                h: xCoord - 22,
                            };

                            $scope.Screen_OnDraw('loosepropLayerUpdate');
                        }

                        if ((insideSpot && !$scope.model.Screen.spotHovering) || ($scope.model.Screen.spotHoveringId > 0 && spot && $scope.model.Screen.spotHoveringId != spot.id)) {
                            $scope.model.Screen.spotHoveringId = spot.id;

                            $scope.Spot_OnEvent(spot.id, 'MOUSEENTER');
                        }
                        else if ((!insideSpot && $scope.model.Screen.spotHovering) || ($scope.model.Screen.spotHoveringId > 0 && (!spot || $scope.model.Screen.spotHoveringId != spot.id))) {
                            $scope.Spot_OnEvent($scope.model.Screen.spotHoveringId, 'MOUSEEXIT');

                            $scope.model.Screen.spotHoveringId = 0;
                        }

                        $scope.model.Screen.spotHovering = insideSpot;
                    }
                });

                $scope.Screen_OnMouseUp = (function ($event) {
                    var windowElement = angular.element($window);
                    var screenElement = angular.element("#screen");
                    var xCoord = ($event.originalEvent.clientX - screenElement.prop('offsetLeft')) + windowElement.scrollLeft();
                    var yCoord = ($event.originalEvent.clientY - screenElement.prop('offsetTop')) + windowElement.scrollTop();

                    if ($scope.model.Interface.authoringMode) {
                        if ($scope.model.Interface.spotMouseDown) {
                            $scope.serverSend(
                                'MSG_SPOTMOVE',
                                {
                                    roomID: $scope.model.RoomInfo.roomId,
                                    spotID: $scope.model.Interface.spotMouseDown.id,
                                    pos: {
                                        v: yCoord - ($window.parseInt($scope.model.Screen.height) / 2),
                                        h: xCoord - ($window.parseInt($scope.model.Screen.width) / 2),
                                    },
                                });

                            $scope.model.Interface.spotMouseDown = null;
                        }
                    }
                    else {
                        var userBoundary = 33;
                        var insideUser = false;
                        var user = null;

                        for (var j = 0; !insideUser && j < $scope.model.RoomInfo.UserList.length; j++) {
                            var polygon = [];

                            user = $scope.model.RoomInfo.UserList[j];

                            polygon.push({
                                v: user.roomPos.v - userBoundary,
                                h: user.roomPos.h - userBoundary,
                            });

                            polygon.push({
                                v: user.roomPos.v - userBoundary,
                                h: user.roomPos.h + userBoundary,
                            });

                            polygon.push({
                                v: user.roomPos.v + userBoundary,
                                h: user.roomPos.h + userBoundary,
                            });

                            polygon.push({
                                v: user.roomPos.v + userBoundary,
                                h: user.roomPos.h - userBoundary,
                            });

                            insideUser = utilService.pointInPolygon(polygon, {
                                v: yCoord,
                                h: xCoord,
                            });
                        }

                        if (!insideUser) {
                            user = null;
                        }

                        if ($scope.model.Interface.wornpropMouseDown !== -1) {
                            var wornProp = $scope.model.Interface.wornpropMouseDown;

                            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                                var user = $scope.model.RoomInfo.UserList[j];

                                if (user.userID === $scope.model.UserInfo.userId) {
                                    for (var k = 0; k < user.propSpec.length; k++) {
                                        if (user.propSpec[k].id === wornProp.id) {
                                            user.propSpec.splice(k, 1);

                                            $scope.setProps(user.propSpec);

                                            $scope.serverSend(
                                                'MSG_PROPNEW',
                                                {
                                                    propSpec: {
                                                        id: wornProp.id,
                                                        crc: 0,
                                                    },
                                                    loc: {
                                                        v: yCoord,
                                                        h: xCoord,
                                                    },
                                                });

                                            break;
                                        }
                                    }

                                    break;
                                }
                            }
                        }
                        else if ($scope.model.Interface.loosepropMouseDown > -1 && $scope.model.RoomInfo.LooseProps[$scope.model.Interface.loosepropMouseDown].dirty) {
                            var looseprop = $scope.model.RoomInfo.LooseProps[$scope.model.Interface.loosepropMouseDown];

                            if (user && user.userID === $scope.model.UserInfo.userId && (!user.propSpec || user.propSpec.length < 9)) {
                                if (!user.propSpec) {
                                    user.propSpec = [];
                                }

                                user.propSpec.push(looseprop.propSpec);

                                $scope.setProps(user.propSpec);

                                $scope.serverSend(
                                    'MSG_PROPDEL',
                                    {
                                        propNum: $scope.model.Interface.loosepropMouseDown,
                                        pos: looseprop.loc,
                                    });
                            }
                            else {
                                looseprop.dirty = false;

                                $scope.serverSend(
                                    'MSG_PROPMOVE',
                                    {
                                        propNum: $scope.model.Interface.loosepropMouseDown,
                                        pos: looseprop.loc,
                                    });
                            }
                        }

                        $scope.model.Interface.contextMenu.type = null;
                        $scope.model.Interface.loosepropMouseDown = -1;
                        $scope.model.Interface.wornpropMouseDown = -1;
                    }
                });

                $scope.StatusMsg_OnClick = (function ($event) {
                    if ($scope.model.Interface.statusMessageTimer) {
                        $timeout.cancel($scope.model.Interface.statusMessageTimer);

                        $scope.model.Interface.statusMessageTimer = null;
                    }

                    $scope.model.Interface.whisperTargetId = 0;

                    $scope.setStatusMsg();

                    $scope.Screen_OnDraw('nametagsLayerUpdate');
                });

                $scope.Chat_OnKeyDown = (function ($event) {
                    if ($event.originalEvent.keyCode === 13 && $scope.model.Interface.chatWindowText.trim() !== '') {
                        if ($scope.model.Interface.chatWindowText.trim().substring(0, 1) === '/') {
                            var script = $scope.model.Interface.chatWindowText.trim().substring(1);

                            try {
                                var atomlist = iptService.iptParser(script, false);

                                iptService.iptExecutor(atomlist);
                            } catch (e) {
                                $scope.model.Interface.LogList.push({
                                    userName: iptService.iptEngineUsername,
                                    isWhisper: true,
                                    text: e,
                                });

                                console.log(e);
                            }
                        }
                        else {
                            var localVariables = {
                                'CHATSTR': {
                                    type: 'string',
                                    value: $scope.model.Interface.chatWindowText,
                                },
                                'WHOTARGET': {
                                    type: 'number',
                                    depth: $scope.model.Interface.whisperTargetId,
                                },
                            };

                            var localFlags = {
                                'CHATSTR': {
                                    'global': false,
                                    depth: -1,
                                },
                                'WHOTARGET': {
                                    'global': false,
                                    depth: -1,
                                },
                            };

                            if ($scope.model.Application.cyborg['OUTCHAT']) {
                                iptService.iptExecutor($scope.model.Application.cyborg['OUTCHAT'],
                                    localVariables,
                                    localFlags);
                            }

                            for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                                $scope.Spot_OnEvent(
                                    $scope.model.RoomInfo.SpotList[j].id,
                                    'OUTCHAT',
                                    localVariables,
                                    localFlags);
                            }

                            $scope.model.Interface.chatWindowText = localVariables['CHATSTR'].value;

                            if (($scope.model.Interface.chatWindowText || '').trim() !== '') {
                                if ($scope.model.Interface.whisperTargetId === 0) {
                                    $scope.serverSend(
                                        'MSG_XTALK',
                                        {
                                            text: $scope.model.Interface.chatWindowText,
                                        });
                                }
                                else {
                                    $scope.serverSend(
                                        'MSG_XWHISPER',
                                        {
                                            target: $scope.model.Interface.whisperTargetId,
                                            text: $scope.model.Interface.chatWindowText,
                                        });
                                }
                            }
                        }

                        $scope.model.Interface.chatWindowText = '';
                    }
                });

                $scope.ListOfAllRoomsRefresh_OnClick = (function ($event) {
                    $scope.serverSend('MSG_LISTOFALLROOMS');
                });

                $scope.ListOfAllUsersRefresh_OnClick = (function ($event) {
                    if ($scope.model.Interface.UserList.length < 1) {
                        $scope.serverSend('MSG_LISTOFALLROOMS');
                    }

                    $scope.serverSend('MSG_LISTOFALLUSERS');
                });

                var connection = new WebSockets();

                connection.on('connect', (function () {
                    $scope.model.ConnectionInfo.connected = true;

                    $(window)
                        .off('keydown')
                        .off('keyup')
                        .on('keydown', function (event) {
                            var $chat = $('#chat');

                            if (event.ctrlKey && event.shiftKey && event.keyCode == 65) {
                                if (($scope.model.UserInfo.userFlags & (UserFlags.UF_SuperUser | UserFlags.UF_God)) != 0) {
                                    $scope.model.Interface.authoringMode = !$scope.model.Interface.authoringMode;

                                    $scope.Screen_OnDraw('spotLayerUpdate', 'spotLayerShow');
                                }
                            }
                            else if (!$scope.model.Screen.spotLayerShow && event.ctrlKey && event.shiftKey) {
                                $scope.Screen_OnDraw('spotLayerUpdate', 'spotLayerShow');
                            }
                            else if ($scope.model.Screen.nametagsLayerShow && event.ctrlKey && event.altKey) {
                                $scope.model.Screen.nametagsLayerShow = false;

                                $scope.Screen_OnDraw('nametagsLayerUpdate');
                            }
                            else if (!$chat.is(':focus')) {
                                switch (event.keyCode) {
                                    case 37:
                                        $scope.userSlide(-4, 0);

                                        break;
                                    case 38:
                                        $scope.userSlide(0, -4);

                                        break;
                                    case 39:
                                        $scope.userSlide(4, 0);

                                        break;
                                    case 40:
                                        $scope.userSlide(0, 4);

                                        break;
                                    default:
                                        if (!$('body').hasClass('modal-open')) {
                                            $('#chat').focus();
                                        }

                                        break;
                                }
                            }
                        }).on('keyup', function (event) {
                            if ($scope.model.Screen.spotLayerShow && (!event.ctrlKey || !event.shiftKey)) {
                                $scope.model.Screen.spotLayerShow = false;

                                $scope.Screen_OnDraw('spotLayerUpdate');
                            }

                            if (!$scope.model.ClientSettings.nametagsLayerShow && (!event.ctrlKey || !event.altKey)) {
                                $scope.Screen_OnDraw('nametagsLayerUpdate', 'nametagsLayerShow');
                            }
                        });

                    $('#interface').css('visibility', 'visible');
                }));

                connection.on('error', (function (event) {
                    if (event) {
                        alert(event.Message || typeof event === 'string' && event || 'Unknown Error');
                    }
                }));

                var protocols = {
                    'MSG_XTALK': 'MSG_TALK',
                    'MSG_XWHISPER': 'MSG_WHISPER',
                    'MSG_ROOMSETDESC': 'MSG_ROOMDESC',
                    'MSG_TIYID': (function (refNum, message) {
                        $scope.model.UserInfo.userId = refNum;

                        if (message.ipAddress === '::1') {
                            message.ipAddress = '127.0.0.1';
                        }

                        $scope.model.UserInfo.ipAddress = message.ipAddress;

                        $scope.model.UserInfo.regSeed = utilService.ReadInt($scope.model.UserInfo.ipAddress.split(/[\.:]+/));
                        $scope.model.UserInfo.regCrc = magicService.ComputeLicenseCrc($scope.model.UserInfo.regSeed);
                        $scope.model.UserInfo.regCtr = magicService.ComputeLicenseCounter($scope.model.UserInfo.regCrc, $scope.model.UserInfo.regSeed);

                        $scope.serverSend(
                            'MSG_LOGON',
                            {
                                reg: {
                                    crc: $scope.model.UserInfo.regCrc,
                                    counter: $scope.model.UserInfo.regCtr,
                                    userName: $scope.model.ClientSettings.userName,
                                    wizPassword: null,
                                    auxFlags: 0,
                                    puidCtr: $scope.model.UserInfo.regCtr,
                                    puidCRC: $scope.model.UserInfo.regCrc,
                                    desiredRoom: $scope.model.UserInfo.desiredRoom,
                                    reserved: $scope.model.UserInfo.agent,
                                    ulRequestedProtocolVersion: 0,
                                    ulUploadCaps: 0,
                                    ulDownloadCaps: 0,
                                    ul2DEngineCaps: 0,
                                    ul2DGraphicsCaps: 0,
                                    ul3DEngineCaps: 0,
                                }
                            });
                    }),
                    'MSG_TALK': (function (refNum, message) {
                        decodeMessage(false, refNum, message);
                    }),
                    'MSG_WHISPER': (function (refNum, message) {
                        decodeMessage(true, refNum, message);
                    }),
                    'MSG_DRAW': (function (refNum, message) {
                        decodeDrawCmd(message.type, message.layer, message.data);

                        $scope.Screen_OnDraw('drawCmdLayerUpdate');

                        $scope.$apply();
                    }),
                    'MSG_PING': (function (refNum, message) {
                        $scope.serverSend('MSG_PONG');
                    }),
                    'MSG_ALTLOGONREPLY': (function (refNum, message) {
                        $scope.model.ClientSettings.userName = message.reg.userName;
                    }),
                    'MSG_SERVERINFO': (function (refNum, message) {
                        $scope.model.ServerInfo.name = message.serverName;

                        angular.element('title').text(''.concat($scope.model.ServerInfo.name, ' - AephixCore'));
                    }),
                    'MSG_HTTPSERVER': (function (refNum, message) {
                        $scope.model.ServerInfo.mediaUrl = message.url;
                    }),
                    'MSG_LISTOFALLUSERS': (function (refNum, message) {
                        $scope.model.Interface.UserList = message.list;

                        if ($scope.model.Interface.RoomList.length > 0) {
                            for (var j = 0; j < $scope.model.Interface.UserList.length; j++) {
                                $scope.model.Interface.UserList[j].roomName = '(Hidden)';

                                for (var k = 0; k < $scope.model.Interface.RoomList.length; k++) {
                                    if ($scope.model.Interface.UserList[j].refNum === $scope.model.Interface.RoomList[k].primaryID) {
                                        $scope.model.Interface.UserList[j].roomName = $scope.model.Interface.RoomList[k].name;

                                        break;
                                    }
                                }
                            }
                        }

                        $scope.$apply();
                    }),
                    'MSG_LISTOFALLROOMS': (function (refNum, message) {
                        $scope.model.Interface.RoomList = message.list;

                        if ($scope.model.Interface.UserList.length > 0) {
                            for (var j = 0; j < $scope.model.Interface.UserList.length; j++) {
                                $scope.model.Interface.UserList[j].roomName = '(Hidden)';

                                for (var k = 0; k < $scope.model.Interface.RoomList.length; k++) {
                                    if ($scope.model.Interface.UserList[j].refNum === $scope.model.Interface.RoomList[k].primaryID) {
                                        $scope.model.Interface.UserList[j].roomName = $scope.model.Interface.RoomList[k].name;

                                        break;
                                    }
                                }
                            }
                        }

                        $scope.$apply();
                    }),
                    'MSG_SPOTSTATE': (function (refNum, message) {
                        if ($scope.model.RoomInfo.roomId === message.roomID) {
                            for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                                if ($scope.model.RoomInfo.SpotList[j].id === message.spotID) {
                                    $scope.model.RoomInfo.SpotList[j].state = message.state;

                                    $scope.Screen_OnDraw('spotLayerUpdate');

                                    $scope.$apply();

                                    break;
                                }
                            }
                        }
                    }),
                    'MSG_SPOTMOVE': (function (refNum, message) {
                        if ($scope.model.RoomInfo.roomId === message.roomID) {
                            for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                                if ($scope.model.RoomInfo.SpotList[j].id === message.spotID) {
                                    $scope.model.RoomInfo.SpotList[j].loc.h = message.pos.h;
                                    $scope.model.RoomInfo.SpotList[j].loc.v = message.pos.v;

                                    $scope.Screen_OnDraw('spotLayerUpdate');

                                    $scope.$apply();

                                    break;
                                }
                            }
                        }
                    }),
                    'MSG_USERSTATUS': (function (refNum, message) {
                        $scope.model.UserInfo.userFlags = message.flags;
                        $scope.model.UserInfo.sessionHash = message.hash;

                        if ((message.flags & (UserFlags.UF_SuperUser | UserFlags.UF_God)) != 0) {
                            $scope.model.UserInfo.hasAdmin = true;
                        }

                        $scope.$apply();
                    }),
                    'MSG_USERLIST': (function (refNum, message) {
                        $scope.model.RoomInfo.UserList = message.users;

                        for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                            var userRef = $scope.model.RoomInfo.UserList[j];

                            if (userRef.propSpec) {
                                for (var k = 0; k < userRef.propSpec.length; k++) {
                                    var propSpec = userRef.propSpec[k];

                                    registerPropSpec(propSpec, 0);
                                }
                            }
                        }

                        $scope.model.Interface.population = ''.concat($scope.model.RoomInfo.UserList.length, ' / ', $scope.model.ServerInfo.totalPeople);
                    }),
                    'MSG_USERNEW': (function (refNum, message) {
                        $scope.model.RoomInfo.UserList.push(message.user);

                        for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                            if ($scope.model.RoomInfo.UserList[j].userID === refNum) {
                                var userRef = $scope.model.RoomInfo.UserList[j];

                                if (userRef.propSpec) {
                                    for (var k = 0; k < userRef.propSpec.length; k++) {
                                        var propSpec = userRef.propSpec[k];

                                        registerPropSpec(propSpec, refNum);
                                    }
                                }

                                break;
                            }
                        }

                        $scope.model.Interface.population = ''.concat($scope.model.RoomInfo.UserList.length, ' / ', $scope.model.ServerInfo.totalPeople);

                        $scope.Screen_OnDraw('spriteLayerUpdate', 'nametagsLayerUpdate');

                        $scope.$apply();
                    }),
                    'MSG_USERPROP': (function (refNum, message) {
                        for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                            if ($scope.model.RoomInfo.UserList[j].userID === refNum) {
                                var userRef = $scope.model.RoomInfo.UserList[j];

                                userRef.propSpec = message.propSpec;

                                if (userRef.propSpec) {
                                    for (var k = 0; k < userRef.propSpec.length; k++) {
                                        var propSpec = userRef.propSpec[k];

                                        registerPropSpec(propSpec, refNum);
                                    }
                                }

                                break;
                            }
                        }

                        $scope.Screen_OnDraw('spriteLayerUpdate');

                        $scope.$apply();
                    }),
                    'MSG_USERDESC': (function (refNum, message) {
                        for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                            if ($scope.model.RoomInfo.UserList[j].userID === refNum) {
                                var userRef = $scope.model.RoomInfo.UserList[j];

                                userRef.faceNbr = message.faceNbr;
                                userRef.colorNbr = message.colorNbr;
                                userRef.propSpec = message.propSpec;

                                if (userRef.propSpec) {
                                    for (var k = 0; k < userRef.propSpec.length; k++) {
                                        var propSpec = userRef.propSpec[k];

                                        registerPropSpec(propSpec, refNum);
                                    }
                                }

                                break;
                            }
                        }

                        $scope.Screen_OnDraw('spriteLayerUpdate');

                        $scope.$apply();
                    }),
                    'MSG_USERNAME': (function (refNum, message) {
                        for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                            if ($scope.model.RoomInfo.UserList[j].userID === refNum) {
                                $scope.model.RoomInfo.UserList[j].name = message.name;

                                break;
                            }
                        }

                        if ($scope.model.UserInfo.userId === refNum) {
                            $scope.model.ClientSettings.userName = message.name;
                        }

                        $scope.Screen_OnDraw('spriteLayerUpdate', 'nametagsLayerUpdate');

                        $scope.$apply();
                    }),
                    'MSG_USERLOG': (function (refNum, message) {
                        $scope.model.ServerInfo.totalPeople = message.nbrUsers;

                        $scope.model.Application.soundPlayer.preload({
                            sourceUrl: '/media/SignOn.mp3',
                            resolve: function (response) {
                                this.play();
                            },
                            reject: function (errors) {
                            },
                        });
                        $scope.model.Application.soundPlayer.load();

                        if ($scope.model.UserInfo.userId === refNum) {
                            if ($scope.model.Application.cyborg['SIGNON']) {
                                iptService.iptExecutor($scope.model.Application.cyborg['SIGNON']);
                            }

                            for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                                $scope.Spot_OnEvent($scope.model.RoomInfo.SpotList[j].id, 'SIGNON');
                            }
                        }

                        $scope.model.Interface.population = ''.concat($scope.model.RoomInfo.UserList.length, ' / ', $scope.model.ServerInfo.totalPeople);

                        $scope.$apply();
                    }),
                    'MSG_LOGOFF': (function (refNum, message) {
                        $scope.model.ServerInfo.totalPeople = message.nbrUsers;

                        for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                            if ($scope.model.RoomInfo.UserList[j].userID === refNum) {
                                $scope.model.RoomInfo.UserList.splice(j, 1);

                                break;
                            }
                        }

                        $scope.model.Interface.population = ''.concat($scope.model.RoomInfo.UserList.length, ' / ', $scope.model.ServerInfo.totalPeople);

                        $scope.Screen_OnDraw('spriteLayerUpdate', 'nametagsLayerUpdate');

                        $scope.$apply();
                    }),
                    'MSG_USEREXIT': (function (refNum, message) {
                        for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                            if ($scope.model.RoomInfo.UserList[j].userID === refNum) {
                                $scope.model.RoomInfo.UserList.splice(j, 1);

                                break;
                            }
                        }

                        $scope.model.Interface.population = ''.concat($scope.model.RoomInfo.UserList.length, ' / ', $scope.model.ServerInfo.totalPeople);

                        $scope.Screen_OnDraw('spriteLayerUpdate', 'nametagsLayerUpdate');

                        $scope.$apply();
                    }),
                    'MSG_USERMOVE': (function (refNum, message) {
                        for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                            if ($scope.model.RoomInfo.UserList[j].userID === refNum) {
                                $scope.model.RoomInfo.UserList[j].roomPos = message.pos;

                                break;
                            }
                        }

                        $scope.Screen_OnDraw('spriteLayerUpdate', 'nametagsLayerUpdate');

                        $scope.$apply();
                    }),
                    'MSG_ROOMDESC': (function (refNum, message) {
                        mvcEndPoints.ViewRoom(message.roomID).then(function (response) {
                            $scope.model.Screen.backgroundFile = response.room.pictName;

                            $scope.model.RoomInfo.roomId = response.room.roomID;
                            $scope.model.RoomInfo.name = response.room.name;
                            $scope.model.RoomInfo.flags = response.room.flags;
                            $scope.model.RoomInfo.facesID = response.room.facesID;
                            $scope.model.RoomInfo.pictName = response.room.pictName;
                            $scope.model.RoomInfo.artistName = response.room.artistName;
                            $scope.model.RoomInfo.SpotList = response.hotspots;
                            $scope.model.RoomInfo.PictureList = response.pictures;
                            $scope.model.RoomInfo.LooseProps = [];
                            $scope.model.RoomInfo.DrawCmds = [];

                            for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                                if (($scope.model.RoomInfo.SpotList[j].script || '').trim() !== '') {
                                    $scope.model.RoomInfo.SpotList[j].events = iptService.iptParser($scope.model.RoomInfo.SpotList[j].script, true);
                                }
                            }

                            if (response.looseProps) {
                                for (var j = response.looseProps.length - 1; j >= 0; j--) {
                                    $scope.model.RoomInfo.LooseProps.splice(0, 0, response.looseProps[j]);
                                }
                            }

                            for (var j = 0; j < response.drawCmds.length; j++) {
                                decodeDrawCmd(response.drawCmds[j]);
                            }

                            if ($scope.model.RoomInfo.PictureList && $scope.model.RoomInfo.PictureList.length > 0) {
                                for (var j = 0; j < $scope.model.RoomInfo.PictureList.length; j++) {
                                    $scope.model.RoomInfo.PictureList[j].imageUrl = $scope.model.ServerInfo.mediaUrl + ($scope.model.ServerInfo.mediaUrl.substring($scope.model.ServerInfo.mediaUrl.length - 1, $scope.model.ServerInfo.mediaUrl.length) === '/' ? '' : '/') + response.pictures[j].name;
                                    $scope.model.RoomInfo.PictureList[j].imageObject = new ImageObject({
                                        sourceUrl: $scope.model.RoomInfo.PictureList[j].imageUrl,
                                        resolve: function (response) {
                                            $scope.Screen_OnDraw('spotLayerUpdate');
                                        },
                                    });
                                    $scope.model.RoomInfo.PictureList[j].imageObject.load();
                                }
                            }

                            $scope.model.RoomInfo.backgroundUrl = $scope.model.ServerInfo.mediaUrl + ($scope.model.ServerInfo.mediaUrl.substring($scope.model.ServerInfo.mediaUrl.length - 1, $scope.model.ServerInfo.mediaUrl.length) === '/' ? '' : '/') + $scope.model.Screen.backgroundFile;
                            $scope.model.RoomInfo.backgroundObject = new ImageObject({
                                sourceUrl: $scope.model.RoomInfo.backgroundUrl,
                                resolve: function (response) {
                                    for (var j = 0; j < $scope.model.RoomInfo.LooseProps.length; j++) {
                                        var looseprop = $scope.model.RoomInfo.LooseProps[j];

                                        if ($scope.model.Screen.assetCache[looseprop.propSpec.id]) {
                                            looseprop.propSpec.prop = $scope.model.Screen.assetCache[looseprop.propSpec.id];
                                        }
                                        else {
                                            mvcEndPoints.GetAsset(looseprop.propSpec.id).then(function (response) {
                                                var packet = new Packet(response, true);
                                                packet.endian = true;

                                                var assetID = packet.ReadInt(true);
                                                var assetCrc = packet.ReadInt();
                                                var assetFlags = packet.ReadInt();
                                                var assetName = packet.ReadPString(128, 0, 1);
                                                var assetData = packet.getRawData();

                                                for (var j = 0; j < $scope.model.RoomInfo.LooseProps.length; j++) {
                                                    var looseprop = $scope.model.RoomInfo.LooseProps[j];

                                                    if (looseprop.propSpec.id === assetID && !looseprop.propSpec.prop) {
                                                        looseprop.propSpec.prop = new Prop($scope, assetID, assetCrc, undefined, assetData);
                                                        looseprop.propSpec.prop.endian = true;
                                                        looseprop.propSpec.prop.asset.name = assetName;
                                                        looseprop.propSpec.prop.asset.flags = assetFlags;

                                                        looseprop.propSpec.prop.decodeProp($scope.model.ServerInfo.mediaUrl);

                                                        if (looseprop.propSpec.prop.ready && !looseprop.propSpec.prop.badProp) {
                                                            $scope.model.Screen.assetCache[assetID] = looseprop.propSpec.prop;

                                                            $scope.Screen_OnDraw('loosepropLayerUpdate');

                                                            $scope.$apply();
                                                        }

                                                        break;
                                                    }
                                                }
                                            });
                                        }
                                    }

                                    var newHeight = this.height < 384 ? 384 : this.height;
                                    var newWidth = this.width < 512 ? 512 : this.width;

                                    $scope.model.Screen.layers['spotCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['spotCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['bubbleCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['bubbleCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['spriteCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['spriteCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['dimroomCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['dimroomCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['nametagsCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['nametagsCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['bgDrawCmdCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['bgDrawCmdCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['fgDrawCmdCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['fgDrawCmdCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['loosepropsCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['loosepropsCanvas'].height(newHeight);

                                    $scope.model.Screen.width = newWidth + 'px';
                                    $scope.model.Screen.height = newHeight + 'px';
                                    $scope.model.Screen.backgroundUrl = 'url(' + this.sourceUrl + ')';

                                    $scope.Screen_OnDraw('loosepropLayerUpdate', 'nametagsLayerUpdate', 'drawCmdLayerUpdate', 'spriteLayerUpdate', 'spotLayerUpdate');

                                    $scope.$apply();
                                },
                                reject: function (errors) {
                                    var newHeight = 384;
                                    var newWidth = 512;

                                    $scope.model.Screen.layers['spotCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['spotCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['bubbleCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['bubbleCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['spriteCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['spriteCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['dimroomCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['dimroomCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['nametagsCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['nametagsCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['bgDrawCmdCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['bgDrawCmdCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['fgDrawCmdCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['fgDrawCmdCanvas'].height(newHeight);
                                    $scope.model.Screen.layers['loosepropsCanvas'].width(newWidth);
                                    $scope.model.Screen.layers['loosepropsCanvas'].height(newHeight);

                                    $scope.model.Screen.width = newWidth + 'px';
                                    $scope.model.Screen.height = newHeight + 'px';
                                    $scope.model.Screen.backgroundUrl = '';
                                },
                            });

                            $scope.model.RoomInfo.backgroundObject.load();

                            $scope.setStatusMsg();
                        }, function (errors) {
                        });
                    }),
                    'MSG_ROOMDESCEND': (function (refNum, message) {
                        $scope.dimRoom(100);

                        if ($scope.model.Application.cyborg['ENTER']) {
                            iptService.iptExecutor($scope.model.Application.cyborg['ENTER']);
                        }

                        for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                            $scope.Spot_OnEvent($scope.model.RoomInfo.SpotList[j].id, 'ENTER');
                        }
                    }),
                    'MSG_PROPNEW': (function (refNum, message) {
                        var looseprop = message;

                        $scope.model.RoomInfo.LooseProps.splice(0, 0, message);

                        if ($scope.model.Screen.assetCache[looseprop.propSpec.id]) {
                            looseprop.propSpec.prop = $scope.model.Screen.assetCache[looseprop.propSpec.id];
                        }
                        else {
                            mvcEndPoints.GetAsset(looseprop.propSpec.id).then(function (response) {
                                var packet = new Packet(response, true);
                                packet.endian = true;

                                var assetID = packet.ReadInt(true);
                                var assetCrc = packet.ReadInt();
                                var assetFlags = packet.ReadInt();
                                var assetName = packet.ReadPString(128, 0, 1);
                                var assetData = packet.getRawData();

                                for (var j = 0; j < $scope.model.RoomInfo.LooseProps.length; j++) {
                                    var looseprop = $scope.model.RoomInfo.LooseProps[j];

                                    if (looseprop.propSpec.id === assetID && !looseprop.propSpec.prop) {
                                        looseprop.propSpec.prop = new Prop($scope, assetID, assetCrc, undefined, assetData);
                                        looseprop.propSpec.prop.endian = true;
                                        looseprop.propSpec.prop.asset.name = assetName;
                                        looseprop.propSpec.prop.asset.flags = assetFlags;

                                        looseprop.propSpec.prop.decodeProp($scope.model.ServerInfo.mediaUrl);

                                        if (looseprop.propSpec.prop.ready && !looseprop.propSpec.prop.badProp) {
                                            $scope.model.Screen.assetCache[assetID] = looseprop.propSpec.prop;

                                            $scope.Screen_OnDraw('loosepropLayerUpdate');

                                            $scope.$apply();
                                        }

                                        break;
                                    }
                                }
                            });
                        }

                        $scope.Screen_OnDraw('loosepropLayerUpdate');

                        $scope.$apply();
                    }),
                    'MSG_PROPMOVE': (function (refNum, message) {
                        if (message.propNum < 0 || message.propNum >= $scope.model.RoomInfo.LooseProps.length) {
                            return;
                        }

                        $scope.model.RoomInfo.LooseProps[message.propNum].loc = message.pos;

                        $scope.Screen_OnDraw('loosepropLayerUpdate');

                        $scope.$apply();
                    }),
                    'MSG_PROPDEL': (function (refNum, message) {
                        if (message.propNum < 0 || message.propNum >= $scope.model.RoomInfo.LooseProps.length) {
                            $scope.model.RoomInfo.LooseProps = [];
                        }
                        else {
                            $scope.model.RoomInfo.LooseProps.splice(message.propNum, 1);
                        }

                        $scope.Screen_OnDraw('loosepropLayerUpdate');

                        $scope.$apply();
                    }),
                    'MSG_SERVERDOWN': (function (refNum, message) {
                        alert(message.whyMessage || 'Disconnected!');

                        connection.stop();
                    }),
                };

                connection.on('message', (function (eventType, refNum, message) {
                    try {
                        message = (message || '').trim() !== '' ? JSON.parse(message) : null;
                    } catch (e) {
                        console.log('Error parsing message: ' + e);
                    }

                    if (typeof protocols[eventType] === 'string') {
                        eventType = protocols[eventType];
                    }

                    if (protocols[eventType]) {
                        protocols[eventType].apply(this, [refNum, message]);
                    }
                }));

                connection.start('ws://192.168.1.215:10000/PalaceWebSocket');
            }]);
})();
