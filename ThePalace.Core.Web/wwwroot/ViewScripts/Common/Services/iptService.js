angular.module('ThePalace').service('iptService', ['$window', '$timeout', 'UserFlags', 'utilService', function ($window, $timeout, UserFlags, utilService) {
    var gVariables = {};
    var gReturn = false;
    var gBreak = false;
    var $scope = null;
    var gGrep = null;
    var gStack = [];

    this.iptVersion = 2;
    this.iptEngineUsername = 'IptscraeEngine';
    this.clientType = navigator.userAgent;
    this.gNestedAtomlistMaxDepth = 256;
    this.gNestedArrayMaxDepth = 256;
    this.gWhileMaxIteration = 7500;
    this.gMaxPaintPenSize = 20;
    this.gStackMaxSize = 1024;

    var getVariable = (function (variable, localVariables, localFlags) {
        if (variable && variable.type === 'variable') {
            if (!localFlags[variable.value] || !localFlags[variable.value].global || gVariables[variable.value] === undefined) {
                if (localVariables[variable.value] === undefined) {
                    return {
                        type: 'number',
                        value: 0,
                    };
                }
                else {
                    return localVariables[variable.value];
                }
            }
            else {
                return gVariables[variable.value];
            }
        }

        return undefined;
    });

    var setVariable = (function (name, value, localVariables, localFlags, recursionDepth, isGlobal) {
        if (localFlags[name] && localFlags[name].global && gVariables[name] !== undefined) {
            gVariables[name] = localVariables[name] = value;
        }
        else {
            localVariables[name] = value;

            if (!localFlags[name]) {
                localFlags[name] = {};
            }

            if (localFlags[name].depth === undefined) {
                localFlags[name].depth = recursionDepth;
            }

            if (!localFlags[name].global && isGlobal) {
                localFlags[name].global = isGlobal;
            }
        }
    });

    var iptCommands = {
        // Start Aliases
        'ROOMGOTO': 'GOTOROOM',
        'CLEARPROPS': 'NAKED',
        'NETGOTO': 'GOTOURL',
        'USERID': 'WHOME',
        'CHAT': 'SAY',
        'ID': 'ME',
        // End Aliases
        // Start Stubs
        'MACRO': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    // TODO:

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        // End Stubs
        // Start Paint Commands
        'LINE': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();
            var register3 = gStack.pop();
            var register4 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            var temp = getVariable(register3, localVariables, localFlags);
            if (temp !== undefined) register3 = temp;

            var temp = getVariable(register4, localVariables, localFlags);
            if (temp !== undefined) register4 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'number' || register3.type !== 'number' || register4.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    $scope.model.Screen.paintPenPos = {
                        v: register3.value,
                        h: register4.value,
                    };

                    $scope.encodeDrawCmd({
                        v: register3.value,
                        h: register4.value,
                    }, [{
                        v: register1.value - register3.value,
                        h: register2.value - register4.value,
                    }]);

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'LINETO': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    $scope.encodeDrawCmd({
                        v: $scope.model.Screen.paintPenPos.v,
                        h: $scope.model.Screen.paintPenPos.h,
                    }, [{
                        v: register1.value - $scope.model.Screen.paintPenPos.v,
                        h: register2.value - $scope.model.Screen.paintPenPos.h,
                    }]);

                    $scope.model.Screen.paintPenPos = {
                        v: register1.value,
                        h: register2.value,
                    };

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'PENPOS': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    $scope.model.Screen.paintPenPos = {
                        v: register1.value,
                        h: register2.value,
                    };

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'PENTO': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    if (!$scope.model.Screen.paintPenPos) {
                        $scope.model.Screen.paintPenPos = {
                            v: 0,
                            h: 0,
                        };
                    }

                    var xCoord = $scope.model.Screen.paintPenPos.h + register2.value;
                    var yCoord = $scope.model.Screen.paintPenPos.v + register1.value;

                    $scope.model.Screen.paintPenPos = {
                        v: yCoord,
                        h: xCoord,
                    };

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'PENCOLOR': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();
            var register3 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            var temp = getVariable(register3, localVariables, localFlags);
            if (temp !== undefined) register3 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'number' || register3.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    $scope.model.Screen.paintPenColor = {
                        r: register3.value % 256,
                        g: register2.value % 256,
                        b: register1.value % 256,
                    };

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'PAINTCLEAR': function (localVariables, localFlags, recursionDepth) {
            $scope.serverSend(
                'MSG_DRAW',
                {
                    type: 'DC_Detonate',
                    layer: false,
                    data: null,
                });
        },
        'PAINTUNDO': function (localVariables, localFlags, recursionDepth) {
            $scope.serverSend(
                'MSG_DRAW',
                {
                    type: 'DC_Delete',
                    layer: false,
                    data: null,
                });
        },
        'PENBACK': function (localVariables, localFlags, recursionDepth) {
            $scope.model.Screen.paintLayer = false;
        },
        'PENFRONT': function (localVariables, localFlags, recursionDepth) {
            $scope.model.Screen.paintLayer = true;
        },
        'PENSIZE': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    item.value = item.value % this.gMaxPaintPenSize;

                    if (item.value < 1) {
                        item.value = 1;
                    }

                    $scope.model.Screen.paintPenSize = item.value;

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        // End Paint Commands
        // Start Sound Commands
        'SOUND': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    if ($scope.model.Interface.soundsEnabled) {
                        var audioUrl = $scope.model.ServerInfo.mediaUrl + ($scope.model.ServerInfo.mediaUrl.substring($scope.model.ServerInfo.mediaUrl.length - 1, 1) === '/' ? '' : '/') + item.value;

                        $scope.model.Application.soundPlayer.preload({
                            sourceUrl: audioUrl,
                            resolve: function (response) {
                                this.play();
                            },
                            reject: function (errors) {
                            },
                        });
                        $scope.model.Application.soundPlayer.load();
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SOUNDPAUSE': function (localVariables, localFlags, recursionDepth) {
            $scope.model.Application.soundPlayer.pause();
        },
        'MIDIPLAY': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    if ($scope.model.Interface.soundsEnabled) {
                        var audioUrl = $scope.model.ServerInfo.mediaUrl + ($scope.model.ServerInfo.mediaUrl.substring($scope.model.ServerInfo.mediaUrl.length - 1, 1) === '/' ? '' : '/') + item.value;

                        $scope.model.Application.midiPlayer.play(audioUrl);
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'MIDISTOP': function (localVariables, localFlags, recursionDepth) {
            $scope.model.Application.midiPlayer.stop();
        },
        // End Sound Commands
        // Start Math Commands
        'PI': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'number',
                value: Math.floor(Math.PI * 1000000),
            });
        },
        'ABS': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    gStack.push({
                        type: 'number',
                        value: Math.floor(Math.abs(item.value)),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'AVG': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'array':
                    var values = $.map(item.value, function (value) {
                        if (value.type !== 'number') {
                            throw 'Wrong datatype...';
                        }

                        return value.value;
                    });
                    var avg = Math.floor(values.reduce(function (a, b) {
                        return a + b;
                    }, 0) / values.length);

                    gStack.push({
                        type: 'number',
                        value: avg,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'POW': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    gStack.push({
                        type: 'number',
                        value: Math.pow(register2.value, register1.value),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'SUM': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'array':
                    var values = $.map(item.value, function (value) {
                        if (value.type !== 'number') {
                            throw 'Wrong datatype...';
                        }

                        return value.value;
                    });

                    gStack.push({
                        type: 'number',
                        value: values.reduce(function (a, b) {
                            return a + b;
                        }, 0),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'MIN': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'array':
                    var values = $.map(item.value, function (value) {
                        if (value.type !== 'number') {
                            throw 'Wrong datatype...';
                        }

                        return value.value;
                    });

                    gStack.push({
                        type: 'number',
                        value: Math.min.apply(null, values),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'MAX': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'array':
                    var values = $.map(item.value, function (value) {
                        if (value.type !== 'number') {
                            throw 'Wrong datatype...';
                        }

                        return value.value;
                    });

                    gStack.push({
                        type: 'number',
                        value: Math.max.apply(null, values),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'SQUAREROOT': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    gStack.push({
                        type: 'number',
                        value: Math.floor(Math.sqrt(item.value)),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'SINE': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    gStack.push({
                        type: 'number',
                        value: Math.floor(Math.sin(item.value) * 1000),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'COSINE': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    gStack.push({
                        type: 'number',
                        value: Math.floor(Math.cos(item.value) * 1000),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'TANGENT': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    gStack.push({
                        type: 'number',
                        value: Math.floor(Math.tan(item.value) * 1000),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'RANDOM': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'bool':
                case 'number':
                    gStack.push({
                        type: 'number',
                        value: Math.floor(Math.random() * item.value),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'MOD': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            if (register1.type !== 'number' && register2.type !== 'number') {
                throw 'Cannot ' + register1.value + ' ' + commandList[j].value + ' ' + register2.value + '...';
            }

            gStack.push({
                type: 'number',
                value: register1.value % register2.value,
            });
        },
        // End Math Commands
        // Start Time Commands
        'TICKS': function (localVariables, localFlags, recursionDepth) {
            var milliseconds = (new Date()).getMilliseconds();
            var ticks = Math.floor((milliseconds / 100) * 6);

            gStack.push({
                type: 'number',
                value: ticks,
            });
        },
        'DATETIME': function (localVariables, localFlags, recursionDepth) {
            var timestamp = Math.floor((new Date()).getTime() / 1000);

            gStack.push({
                type: 'number',
                value: timestamp,
            });
        },
        // End Time Commands
        // Start Stack Commands
        'OVER': function (localVariables, localFlags, recursionDepth) {
            if (gStack.length < 2) {
                throw 'Not enough items on the stack...';
            }

            gStack.push(gStack[gStack.length - 2]);
        },
        'PICK': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    if (gStack.length <= item.value) {
                        throw 'Not enough items on the stack...';
                    }

                    gStack.push(gStack[gStack.length - item.value - 1]);

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'DUP': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            gStack.push(item);
            gStack.push(item);
        },
        'POP': function (localVariables, localFlags, recursionDepth) {
            gStack.pop();
        },
        'SWAP': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            gStack.push(register1);
            gStack.push(register2);
        },
        'STACKDEPTH': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'number',
                value: gStack.length,
            });
        },
        // End Stack Commands
        // Start Message Commands
        'ROOMMSG': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    $scope.serverSend(
                        'MSG_RMSG',
                        {
                            text: item.value,
                        });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SUSRMSG': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    $scope.serverSend(
                        'MSG_SMSG',
                        {
                            text: item.value,
                        });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'GLOBALMSG': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    $scope.serverSend(
                        'MSG_GMSG',
                        {
                            text: item.value,
                        });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'LOCALMSG': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    $.connection.proxyHub.client.receive(
                        'MSG_TALK',
                        $scope.model.UserInfo.userId,
                        {
                            text: item.value,
                            localmsg: true,
                        });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'STATUSMSG': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    $scope.setStatusMsg(item.value);

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'PRIVATEMSG': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'string') {
                        throw 'Wrong datatype...';
                    }

                    $scope.serverSend(
                        'MSG_XWHISPER',
                        {
                            target: register1.value,
                            text: register2.value,
                        });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'LOGMSG': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    $scope.model.Interface.LogList.push({
                        userName: this.iptEngineUsername,
                        text: item.value,
                        isWhisper: true,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'SAY': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    $scope.serverSend(
                        'MSG_XTALK',
                        {
                            text: item.value,
                        });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'SAYAT': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();
            var register3 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            var temp = getVariable(register3, localVariables, localFlags);
            if (temp !== undefined) register3 = temp;

            switch (register3.type) {
                case 'string':
                    if (register2.type !== 'number' && register3.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    $scope.serverSend(
                        'MSG_XTALK',
                        {
                            text: ''.concat('@', register2.value, ',', register1.value, ' ', register3.value),
                        });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        // End Message Commands
        // Start Prop Commands
        'USERPROP': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                        if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                            if ($scope.model.RoomInfo.UserList[j].propSpec && $scope.model.RoomInfo.UserList[j].propSpec.length > 0) {
                                if (item.value < $scope.model.RoomInfo.UserList[j].propSpec.length) {
                                    var propID = $scope.model.RoomInfo.UserList[j].propSpec[item.value].id;

                                    gStack.push({
                                        type: 'number',
                                        value: propID,
                                    });
                                }
                            }

                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'DROPPROP': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                        if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                            if ($scope.model.RoomInfo.UserList[j].propSpec && $scope.model.RoomInfo.UserList[j].propSpec.length > 0) {
                                var lastIndex = $scope.model.RoomInfo.UserList[j].propSpec.length - 1;
                                var propID = $scope.model.RoomInfo.UserList[j].propSpec[lastIndex].id;

                                $scope.serverSend(
                                    'MSG_PROPNEW',
                                    {
                                        propSpec: {
                                            id: propID,
                                            crc: 0,
                                        },
                                        loc: {
                                            h: register2.value,
                                            v: register1.value,
                                        },
                                    });

                                if (lastIndex === 0) {
                                    $scope.setProps(null);
                                }
                                else {
                                    $scope.model.RoomInfo.UserList[j].propSpec.splice(lastIndex, 1);

                                    $scope.setProps($scope.model.RoomInfo.UserList[j].propSpec);
                                }
                            }

                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'DOFFPROP': function (localVariables, localFlags, recursionDepth) {
            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                    if ($scope.model.RoomInfo.UserList[j].propSpec && $scope.model.RoomInfo.UserList[j].propSpec.length > 0) {
                        $scope.model.RoomInfo.UserList[j].propSpec.splice($scope.model.RoomInfo.UserList[j].propSpec.length - 1, 1);

                        $scope.setProps($scope.model.RoomInfo.UserList[j].propSpec.length > 0 ? $scope.model.RoomInfo.UserList[j].propSpec : null);
                    }

                    break;
                }
            }
        },
        'TOPPROP': function (localVariables, localFlags, recursionDepth) {
            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                    var propID = 0;

                    if ($scope.model.RoomInfo.UserList[j].propSpec && $scope.model.RoomInfo.UserList[j].propSpec.length > 0) {
                        propID = $scope.model.RoomInfo.UserList[j].propSpec[$scope.model.RoomInfo.UserList[j].propSpec.length - 1].id;
                    }

                    gStack.push({
                        type: 'number',
                        value: propID,
                    });

                    break;
                }
            }
        },
        'HASPROP': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                    var propID = 0;

                    if ($scope.model.RoomInfo.UserList[j].propSpec && $scope.model.RoomInfo.UserList[j].propSpec.length > 0) {
                        switch (item.type) {
                            case 'string':
                                for (var k in $scope.model.Screen.assetCache) {
                                    if ($scope.model.Screen.assetCache[k].name === item.value) {
                                        propID = k;

                                        break;
                                    }
                                }

                                break;
                            case 'number':
                                propID = item.value;

                                break;
                            default:
                                throw 'Wrong datatype...';

                                break;
                        }
                    }

                    gStack.push({
                        type: 'bool',
                        value: propID !== 0 ? 1 : 0,
                    });

                    break;
                }
            }
        },
        'CLEARLOOSEPROPS': function (localVariables, localFlags, recursionDepth) {
            $scope.serverSend(
                'MSG_PROPDEL',
                {
                    propNum: -1
                });
        },
        'ADDLOOSEPROP': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();
            var register3 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            var temp = getVariable(register3, localVariables, localFlags);
            if (temp !== undefined) register3 = temp;

            if (register1.type !== 'number' && register2.type !== 'number') {
                throw 'Wrong datatype...';
            }

            switch (register3.type) {
                case 'string':
                    for (var k in $scope.model.Screen.assetCache) {
                        if ($scope.model.Screen.assetCache[k].name === item.value) {
                            $scope.serverSend(
                                'MSG_PROPNEW',
                                {
                                    propSpec: {
                                        id: k,
                                        crc: 0,
                                    },
                                    loc: {
                                        h: register2.value,
                                        v: register1.value,
                                    },
                                });

                            break;
                        }
                    }

                    break;
                case 'number':
                    $scope.serverSend(
                        'MSG_PROPNEW',
                        {
                            propSpec: {
                                id: register3.value,
                                crc: 0,
                            },
                            loc: {
                                h: register2.value,
                                v: register1.value,
                            },
                        });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'REMOVEPROP': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                    if ($scope.model.RoomInfo.UserList[j].propSpec && $scope.model.RoomInfo.UserList[j].propSpec.length > 0) {

                        var propID = 0;

                        switch (item.type) {
                            case 'string':
                                for (var k in $scope.model.Screen.assetCache) {
                                    if ($scope.model.Screen.assetCache[k].name === item.value) {
                                        propID = k;

                                        break;
                                    }
                                }

                                break;
                            case 'number':
                                propID = item.value;

                                break;
                            default:
                                throw 'Wrong datatype...';

                                break;
                        }

                        if (propID !== 0) {
                            for (var k = 0; k < $scope.model.RoomInfo.UserList[j].propSpec.length; k++) {
                                if ($scope.model.RoomInfo.UserList[j].propSpec[k].id === propID) {
                                    $scope.model.RoomInfo.UserList[j].propSpec.splice(k, 1);

                                    break;
                                }
                            }
                        }
                    }

                    break;
                }
            }

            $scope.setProps(propSpec);
        },
        'DONPROP': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            var propSpec = [];

            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                    if ($scope.model.RoomInfo.UserList[j].propSpec && $scope.model.RoomInfo.UserList[j].propSpec.length > 0) {
                        propSpec = $scope.model.RoomInfo.UserList[j].propSpec;
                    }

                    switch (item.type) {
                        case 'string':
                            for (var k in $scope.model.Screen.assetCache) {
                                if ($scope.model.Screen.assetCache[k].name === item.value) {
                                    propSpec.push({
                                        id: k,
                                        crc: 0,
                                    });

                                    break;
                                }
                            }

                            break;
                        case 'number':
                            propSpec.push({
                                id: item.value,
                                crc: 0,
                            });

                            break;
                        default:
                            throw 'Wrong datatype...';

                            break;
                    }

                    break;
                }
            }

            $scope.setProps(propSpec);
        },
        'SETPROPS': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'array':
                    var propSpec = [];

                    for (var j = 0; j < item.value.length; j++) {
                        switch (item.value[j].type) {
                            case 'string':
                                for (var k in $scope.model.Screen.assetCache) {
                                    if ($scope.model.Screen.assetCache[k].name === item.value[j].value) {
                                        propSpec.push({
                                            id: k,
                                            crc: 0,
                                        });

                                        break;
                                    }
                                }

                                break;
                            case 'number':
                                propSpec.push({
                                    id: item.value[j].value,
                                    crc: 0,
                                });

                                break;
                            default:
                                throw 'Wrong datatype...';
                        }
                    }

                    $scope.setProps(propSpec.length ? propSpec : null);

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SHOWLOOSEPROPS': function (localVariables, localFlags, recursionDepth) {
            for (var j = 0; j < $scope.model.RoomInfo.LooseProps.length; j++) {
                var prop = $scope.model.RoomInfo.LooseProps[j];

                $scope.model.Interface.LogList.push({
                    userName: this.iptEngineUsername,
                    isWhisper: true,
                    text: ''.concat(prop.propSpec.id, ' ', prop.loc.h, ' ', prop.loc.v, ' ADDLOOSEPROP'),
                })
            }
        },
        'NBRUSERPROPS': function (localVariables, localFlags, recursionDepth) {
            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                    gStack.push({
                        type: 'number',
                        value: $scope.model.RoomInfo.UserList[j].propSpec ? $scope.model.RoomInfo.UserList[j].propSpec.length : 0,
                    });

                    break;
                }
            }
        },
        // End Prop Commands
        // Start String Commands
        'LOWERCASE': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    var value = item.value.toLowerCase();

                    gStack.push({
                        type: 'string',
                        value: value,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'UPPERCASE': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    var value = item.value.toUpperCase();

                    gStack.push({
                        type: 'string',
                        value: value,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'STRINDEX': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register2.type) {
                case 'string':
                    if (register1.type !== 'string') {
                        throw 'Wrong datatype...';
                    }

                    gStack.push({
                        type: 'number',
                        value: register2.value.indexOf(register1.value),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'STRLEN': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    gStack.push({
                        type: 'number',
                        value: item.value.length,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'SUBSTR': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register2.type) {
                case 'string':
                    if (register1.type !== 'string') {
                        throw 'Wrong datatype...';
                    }

                    gStack.push({
                        type: 'bool',
                        value: register2.value.indexOf(register1.value) !== -1 ? 1 : 0,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'SUBSTRING': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();
            var register3 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            var temp = getVariable(register3, localVariables, localFlags);
            if (temp !== undefined) register3 = temp;

            switch (register3.type) {
                case 'string':
                    if (register1.type !== 'number' && register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    gStack.push({
                        type: 'string',
                        value: register3.value.substring(register2.value, register1.value + register2.value),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'GREPSTR': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register2.type) {
                case 'string':
                    if (register1.type !== 'string') {
                        throw 'Wrong datatype...';
                    }

                    var regExp = new RegExp(register1.value)

                    gGrep = regExp.exec(register2.value);

                    gStack.push({
                        type: 'bool',
                        value: gGrep !== null ? 1 : 0,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'GREPSUB': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    if (gGrep !== null) {
                        item.value = (item.value || '').trim();

                        for (var j = 1; j < 10; j++) {
                            item.value = item.value.replace('$' + j, gGrep[j]);
                        }

                        gStack.push({
                            type: 'string',
                            value: item.value,
                        });
                    }

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'STRTOATOM': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    gStack.push({
                        type: 'atomlist',
                        value: this.iptParser(item.value, false),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        // End String Commands
        // Start Boolean Commands
        'AND': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'bool':
                case 'number':
                    if (register2.type !== 'bool' && register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    gStack.push({
                        type: 'bool',
                        value: register1.value !== 0 && register2.value !== 0 ? 1 : 0,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'OR': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'bool':
                case 'number':
                    if (register2.type !== 'bool' && register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    gStack.push({
                        type: 'bool',
                        value: register1.value !== 0 || register2.value !== 0 ? 1 : 0,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'NOT': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'bool':
                case 'number':
                    gStack.push({
                        type: 'bool',
                        value: item.value === 0 ? 1 : 0,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'IF': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            if ((register1.type !== 'bool' || register1.type !== 'number') && register2.type !== 'atomlist') {
                throw 'Wrong datatype...';
            }

            switch (register1.type) {
                case 'bool':
                case 'number':
                    if (register1.value !== 0) {
                        this.iptExecutor(register2.value, localVariables, localFlags, recursionDepth + 1);
                    }

                    break;
            }
        },
        'IFELSE': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();
            var register3 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            var temp = getVariable(register3, localVariables, localFlags);
            if (temp !== undefined) register3 = temp;

            if ((register1.type !== 'bool' || register1.type !== 'number') && register2.type !== 'atomlist' && register3.type !== 'atomlist') {
                throw 'Wrong datatype...';
            }

            switch (register1.type) {
                case 'bool':
                case 'number':
                    if (register1.value !== 0) {
                        this.iptExecutor(register3.value, localVariables, localFlags, recursionDepth + 1);
                    }
                    else {
                        this.iptExecutor(register2.value, localVariables, localFlags, recursionDepth + 1);
                    }

                    break;
            }
        },
        'TRUE': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'bool',
                value: 1,
            });
        },
        'FALSE': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'bool',
                value: 0,
            });
        },
        // End Boolean Commands
        // Start Array Commands
        'GET': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register2.type) {
                case 'array':
                    if (register1.type !== 'number') {
                        throw 'Wrong datatype...';
                    }
                    else if (register1.value >= register2.value.length) {
                        throw 'Index ' + register1.value + ' out of bounds...';
                    }

                    gStack.push(register2.value[register1.value]);

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'PUT': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();
            var register3 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            var temp = getVariable(register3, localVariables, localFlags);
            if (temp !== undefined) register3 = temp;

            switch (register2.type) {
                case 'array':
                    if (register1.type !== 'number') {
                        throw 'Wrong datatype...';
                    }
                    else if (register1.value >= register2.value.length) {
                        throw 'Index ' + register1.value + ' out of bounds...';
                    }

                    register2.value[register1.value] = register3;

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'ARRAY': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    gStack.push({
                        type: 'array',
                        value: new Array(item.value),
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'LENGTH': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'array':
                case 'string':
                    gStack.push({
                        type: 'number',
                        value: item.value.length,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        // End Array Commands
        // Start Variable Commands
        'TOPTYPE': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            gStack.push(item);

            var typeID = 0;

            switch (item.type) {
                case 'bool':
                case 'number':
                    typeID = 1;

                    break;
                case 'variable':
                    typeID = 2;

                    break;
                case 'atomlist':
                    typeID = 3;

                    break;
                case 'string':
                    typeID = 4;

                    break;
                case 'array':
                    typeID = 6;

                    break;
            }

            gStack.push({
                type: 'number',
                value: typeID,
            });
        },
        'VARTYPE': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            gStack.push(item);

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            var typeID = 0;

            switch (item.type) {
                case 'bool':
                case 'number':
                    typeID = 1;

                    break;
                case 'variable':
                    typeID = 2;

                    break;
                case 'atomlist':
                    typeID = 3;

                    break;
                case 'string':
                    typeID = 4;

                    break;
                case 'array':
                    typeID = 6;

                    break;
            }

            gStack.push({
                type: 'number',
                value: typeID,
            });
        },
        'ITOA': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'bool':
                case 'number':
                    var value = item.value.toString();

                    gStack.push({
                        type: 'string',
                        value: value,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'ATOI': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    var value = $window.parseInt(item.value, 10);

                    gStack.push({
                        type: 'number',
                        value: value,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        'DEF': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            if (register1.type !== 'variable' && register2.type !== 'atomlist' && register2.type !== 'array') {
                throw 'Wrong datatype...';
            }

            if (localFlags[register1.value] && localFlags[register1.value].global && gVariables[register1.value] !== undefined) {
                gVariables[register1.value] = localVariables[register1.value] = register2;
            }
            else {
                localVariables[register1.value] = register2;

                if (!localFlags[register1.value]) {
                    localFlags[register1.value] = {};
                }

                if (localFlags[register1.value].depth === undefined) {
                    localFlags[register1.value].depth = recursionDepth;
                }
            }
        },
        // End Variable Commands
        // Start Spot Commands
        'INSPOT': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                        if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                            var xCoord = $scope.model.RoomInfo.UserList[j].roomPos.h;
                            var yCoord = $scope.model.RoomInfo.UserList[j].roomPos.v;
                            var inside = false;

                            for (var k = 0; k < !inside && $scope.model.RoomInfo.SpotList.length; k++) {
                                var spot = $scope.model.RoomInfo.SpotList[k];

                                if (spot.id === item.value) {
                                    var polygon = [];

                                    for (var l = 0; l < spot.Vortexes.length; l++) {
                                        polygon.push({
                                            v: spot.loc.v + spot.Vortexes[l].v,
                                            h: spot.loc.h + spot.Vortexes[l].h,
                                        });
                                    }

                                    inside = utilService.pointInPolygon(polygon, {
                                        v: yCoord,
                                        h: xCoord,
                                    });

                                    break;
                                }
                            }

                            gStack.push({
                                type: 'bool',
                                value: inside ? 1 : 0,
                            });

                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'LOCK': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    $scope.serverSend(
                        'MSG_DOORLOCK',
                        {
                            roomID: $scope.model.RoomInfo.roomId,
                            spotID: item.value,
                        });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'UNLOCK': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    $scope.serverSend(
                        'MSG_DOORUNLOCK',
                        {
                            roomID: $scope.model.RoomInfo.roomId,
                            spotID: item.value,
                        });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'ISLOCKED': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                        var spot = $scope.model.RoomInfo.SpotList[j];
                        if (spot.id === item.value) {
                            gStack.push({
                                type: 'bool',
                                value: spot.type === HotSpotTypes.HT_Door && spot.state !== 0 ? 1 : 0,
                            });

                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'GETSPOTSTATE': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                        if ($scope.model.RoomInfo.SpotList[j].id === item.value) {
                            gStack.push({
                                type: 'number',
                                value: $scope.model.RoomInfo.SpotList[j].state,
                            });

                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SETSPOTSTATE': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                        if ($scope.model.RoomInfo.SpotList[j].id === register1.value) {
                            $scope.serverSend(
                                'MSG_SPOTSTATE',
                                {
                                    roomID: $scope.model.RoomInfo.roomId,
                                    spotID: register1.value,
                                    state: register2.value,
                                });

                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SETSPOTSTATELOCAL': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'number':
                    for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                        if ($scope.model.RoomInfo.SpotList[j].id === register1.value) {
                            $scope.model.RoomInfo.SpotList[j].state == register2.value;

                            $scope.model.Screen.spotLayerUpdate = true;

                            $scope.Screen_OnDraw();

                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SETLOC': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();
            var register3 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            var temp = getVariable(register3, localVariables, localFlags);
            if (temp !== undefined) register3 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'number' || register3.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    $scope.serverSend(
                        'MSG_SPOTMOVE',
                        {
                            roomID: $scope.model.RoomInfo.roomId,
                            spotID: register1.value,
                            pos: {
                                h: register3.value,
                                v: register2.value,
                            }

                        });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SETPICLOC': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();
            var register3 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            var temp = getVariable(register3, localVariables, localFlags);
            if (temp !== undefined) register3 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'number' || register3.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    $scope.serverSend(
                        'MSG_PICTMOVE',
                        {
                            roomID: $scope.model.RoomInfo.roomId,
                            spotID: register1.value,
                            pos: {
                                h: register3.value,
                                v: register2.value,
                            }

                        });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SELECT': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    $timeout(
                        $scope.Spot_OnEvent,
                        1,
                        false,
                        item.value,
                        'SELECT'
                    );

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SETALARM': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'number':
                    if (register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    var futureTicks = Math.floor((register2.value / 6) * 100);

                    $timeout(
                        $scope.Spot_OnEvent,
                        futureTicks,
                        false,
                        register1.value,
                        'ALARM'
                    );

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'ME': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'number',
                value: getVariable(
                    {
                        type: 'variable',
                        value: 'ME',
                    },
                    localVariables,
                    localFlags
                ).value,
            });
        },
        'DEST': function (localVariables, localFlags, recursionDepth) {
            var spotID = getVariable(
                {
                    type: 'variable',
                    value: 'ME',
                },
                localVariables,
                localFlags
            ).value;

            if (spotID === 0) {
                gStack.push({
                    type: 'number',
                    value: 0,
                });

                return;
            }

            for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                if ($scope.model.RoomInfo.SpotList[j].id === spotID) {
                    gStack.push({
                        type: 'number',
                        value: $scope.model.RoomInfo.SpotList[j].dest,
                    });

                    break;
                }
            }
        },
        'DOORIDX': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    var doorList = [];

                    for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                        if ($scope.model.RoomInfo.SpotList[j].type === HotSpotTypes.HT_Door) {
                            doorList.push($scope.model.RoomInfo.SpotList[j]);
                        }
                    }

                    if (item.value < doorList.length) {
                        gStack.push({
                            type: 'number',
                            value: doorList[item.value].id,
                        });

                        break;
                    }
                    else {
                        throw 'Index out of bounds...';
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SPOTDEST': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                        if ($scope.model.RoomInfo.SpotList[j].id === item.value) {
                            gStack.push({
                                type: 'number',
                                value: $scope.model.RoomInfo.SpotList[j].dest,
                            });

                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'NBRSPOTS': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'number',
                value: $scope.model.RoomInfo.SpotList.length,
            });
        },
        'NBRDOORS': function (localVariables, localFlags, recursionDepth) {
            var count = 0;

            for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                if ($scope.model.RoomInfo.SpotList[j].type === HotSpotTypes.HT_Door) {
                    count++;
                }
            }

            gStack.push({
                type: 'number',
                value: count,
            });
        },
        'SPOTNAME': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    for (var j = 0; j < $scope.model.RoomInfo.SpotList.length; j++) {
                        if ($scope.model.RoomInfo.SpotList[j].id === item.value) {
                            gStack.push({
                                type: 'string',
                                value: $scope.model.RoomInfo.SpotList[j].name,
                            });

                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        // End Spot Commands
        // Start Functional Commands
        'BREAK': function (localVariables, localFlags, recursionDepth) {
            gBreak = true;
        },
        'RETURN': function (localVariables, localFlags, recursionDepth) {
            gReturn = true;
        },
        'EXIT': function (localVariables, localFlags, recursionDepth) {
            throw 'Exiting Script';
        },
        'EXEC': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'atomlist':
                    this.iptExecutor(item.value, localVariables, localFlags, recursionDepth + 1);

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'ALARMEXEC': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register2.type) {
                case 'atomlist':
                    if (register1.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    var futureTicks = Math.floor((register1.value / 6) * 100);

                    $timeout(
                        function (that, atomlist) {
                            that.iptExecutor(atomlist);

                            $scope.$apply();
                        },
                        futureTicks,
                        false,
                        this,
                        register2.value
                    );

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'WHILE': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register2.type) {
                case 'atomlist':
                    if (register1.type !== 'atomlist') {
                        throw 'Wrong datatype...';
                    }

                    var limit = this.gWhileMaxIteration;

                    gBreak = false;

                    while (!gBreak && limit-- > 0) {
                        this.iptExecutor(register1.value, localVariables, localFlags, recursionDepth + 1);

                        var item = gStack.pop();

                        if (item.type !== 'bool' && item.type !== 'number') {
                            throw 'Wrong datatype...';
                        }

                        if (item.value === 0) {
                            break;
                        }

                        this.iptExecutor(register2.value, localVariables, localFlags, recursionDepth + 1);
                    }

                    if (limit < 1) {
                        throw 'Endless loop, breaking...';
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'FOREACH': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register2.type) {
                case 'atomlist':
                    if (register1.type !== 'array') {
                        throw 'Wrong datatype...';
                    }

                    gBreak = false;

                    for (var j = 0; !gBreak && j < register1.value.length; j++) {
                        gStack.push(register1.value[j]);

                        this.iptExecutor(register2.value, localVariables, localFlags, recursionDepth + 1);
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'GLOBAL': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            switch (item.type) {
                case 'variable':
                    if (gVariables[item.value] === undefined) {
                        gVariables[item.value] = localVariables[item.value] || null;
                    }

                    if (!localFlags[item.value]) {
                        localFlags[item.value] = {};
                    }

                    localFlags[item.value].global = true;

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        // End Functional Commands
        // Start User Commands
        'WHOME': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'number',
                value: $scope.model.UserInfo.userId,
            });
        },
        'MOVE': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'bool':
                case 'number':
                    if (register2.type !== 'bool' && register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    $scope.userSlide(register2.value, register1.value);

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SETPOS': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            if (register1.type !== 'number' && register2.type !== 'number') {
                throw 'Wrong datatype...';
            }

            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                    var xCoord = $scope.model.RoomInfo.UserList[j].roomPos.h = register2.value;
                    var yCoord = $scope.model.RoomInfo.UserList[j].roomPos.v = register1.value;

                    $scope.setPos({
                        h: xCoord,
                        v: yCoord,
                    });

                    break;
                }
            }

            $scope.model.Screen.nametagsLayerUpdate = true;
            $scope.model.Screen.spriteLayerUpdate = true;

            $scope.Screen_OnDraw();

            $scope.$apply();
        },
        'MOUSEPOS': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'number',
                value: $window.MousePositionX,
            });

            gStack.push({
                type: 'number',
                value: $window.MousePositionY,
            });
        },
        'POSX': function (localVariables, localFlags, recursionDepth) {
            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                    gStack.push({
                        type: 'number',
                        value: $scope.model.RoomInfo.UserList[j].roomPos.h,
                    });

                    break;
                }
            }
        },
        'POSY': function (localVariables, localFlags, recursionDepth) {
            for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                if ($scope.model.RoomInfo.UserList[j].userID === $scope.model.UserInfo.userId) {
                    gStack.push({
                        type: 'number',
                        value: $scope.model.RoomInfo.UserList[j].roomPos.v,
                    });

                    break;
                }
            }
        },
        'SERVERNAME': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'string',
                value: $scope.model.ServerInfo.name,
            });
        },
        'ROOMNAME': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'string',
                value: $scope.model.RoomInfo.name,
            });
        },
        'ROOMID': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'number',
                value: $scope.model.RoomInfo.roomId,
            });
        },
        'USERNAME': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'string',
                value: $scope.model.ClientSettings.userName,
            });
        },
        'NBRROOMUSERS': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'number',
                value: $scope.model.RoomInfo.UserList[j].length,
            });
        },
        'ISWIZARD': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'bool',
                value: ($scope.model.UserInfo.userFlags & UserFlags.UF_SuperUser) !== 0 ? 1 : 0,
            });
        },
        'ISGOD': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'bool',
                value: ($scope.model.UserInfo.userFlags & UserFlags.UF_God) !== 0 ? 1 : 0,
            });
        },
        'ISGUEST': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'bool',
                value: ($scope.model.UserInfo.userFlags & UserFlags.UF_Guest) !== 0 ? 1 : 0,
            });
        },
        'NAKED': function (localVariables, localFlags, recursionDepth) {
            $scope.setProps(null);
        },
        'WHOTARGET': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'number',
                value: getVariable(
                    {
                        type: 'variable',
                        value: 'WHOTARGET',
                    },
                    localVariables,
                    localFlags
                ).value,
            });
        },
        'SETFACE': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    $scope.setFace(item.value);

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'SETCOLOR': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    $scope.setColor(item.value);

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'WHONAME': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                        if ($scope.model.RoomInfo.UserList[j].userID === item.value) {
                            gStack.push({
                                type: 'string',
                                value: $scope.model.RoomInfo.UserList[j].name,
                            });

                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'WHOCHAT': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'number',
                value: getVariable(
                    {
                        type: 'variable',
                        value: 'WHOCHAT',
                    },
                    localVariables,
                    localFlags
                ).value,
            });
        },
        'WHOPOS': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                        if ($scope.model.RoomInfo.UserList[j].name === item.value) {
                            gStack.push({
                                type: 'number',
                                value: $scope.model.RoomInfo.UserList[j].roomPos.h,
                            });

                            gStack.push({
                                type: 'number',
                                value: $scope.model.RoomInfo.UserList[j].roomPos.v,
                            });

                            break;
                        }
                    }

                    break;
                case 'number':
                    for (var j = 0; j < $scope.model.RoomInfo.UserList.length; j++) {
                        if ($scope.model.RoomInfo.UserList[j].userID === item.value) {
                            gStack.push({
                                type: 'number',
                                value: $scope.model.RoomInfo.UserList[j].roomPos.h,
                            });

                            gStack.push({
                                type: 'number',
                                value: $scope.model.RoomInfo.UserList[j].roomPos.v,
                            });

                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'ROOMUSER': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    if (item.value < $scope.model.RoomInfo.UserList.length) {
                        gStack.push({
                            type: 'number',
                            value: $scope.model.RoomInfo.UserList[item.value].userID,
                        });
                    }
                    else {
                        throw 'Index out of bounds...';
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'GOTOROOM': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    $scope.roomGoto(item.value);

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        // End User Commands
        // Start Misc Commands
        'IPTVERSION': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'number',
                value: this.iptVersion,
            });
        },
        'LAUNCHAPP': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            // Effectively does nothing, just for legacy support
        },
        'DIMROOM': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    $scope.dimRoom((100 - item.value) / 100);

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'DELAY': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    var futureTicks = Math.floor((item.value / 6) * 100);
                    var benchmark = (new Date()).getTime();

                    if (futureTicks > 10000) {
                        futureTicks = 10000; // To wait any longer than 10 seconds is just too cruel.
                    }

                    while (true) {
                        if (((new Date()).getTime() - benchmark) > futureTicks) {
                            break;
                        }
                    }

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'BEEP': function (localVariables, localFlags, recursionDepth) {
            var snd = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
            snd.play();
        },
        'CLIENTTYPE': function (localVariables, localFlags, recursionDepth) {
            gStack.push({
                type: 'string',
                value: this.clientType,
            });
        },
        'GOTOURL': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'string':
                    $window.open(item.value, '_blank');

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'GOTOURLFRAME': function (localVariables, localFlags, recursionDepth) {
            var register1 = gStack.pop();
            var register2 = gStack.pop();

            var temp = getVariable(register1, localVariables, localFlags);
            if (temp !== undefined) register1 = temp;

            var temp = getVariable(register2, localVariables, localFlags);
            if (temp !== undefined) register2 = temp;

            switch (register1.type) {
                case 'string':
                    if (register2.type !== 'string') {
                        throw 'Wrong datatype...';
                    }

                    $window.open(register2.value, register1.value);

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'KILLUSER': function (localVariables, localFlags, recursionDepth) {
            var item = gStack.pop();

            var temp = getVariable(item, localVariables, localFlags);
            if (temp !== undefined) item = temp;

            switch (item.type) {
                case 'number':
                    $scope.serverSend(
                        'MSG_KILLUSER',
                        {
                            target: item.value,
                        });

                    break;
                default:
                    throw 'Wrong datatype...';

                    break;
            }
        },
        'CLEARLOG': function (localVariables, localFlags, recursionDepth) {
            $scope.model.Interface.LogList = [];
        },
        // End Misc Commands
    };

    var iptOperators = {
        '!': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            switch (register1.type) {
                case 'bool':
                case 'number':
                    gStack.push({
                        type: 'bool',
                        value: register1.value === 0 ? 1 : 0,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        '!=': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type !== register2.type && (register1.type === 'string' || register1.type === 'number')) {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            gStack.push({
                type: 'bool',
                value: register2.value !== register1.value ? 1 : 0,
            });
        },
        '<>': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type !== register2.type && (register1.type === 'string' || register1.type === 'number')) {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            gStack.push({
                type: 'bool',
                value: register2.value !== register1.value ? 1 : 0,
            });
        },
        '=': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (originalRegister1.type !== 'variable') {
                throw 'Cannot assign ' + register1.value + '...';
            }

            setVariable(originalRegister1.value, register2, localVariables, localFlags, recursionDepth);
        },
        '==': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type !== register2.type && (register1.type === 'string' || register1.type === 'number')) {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            gStack.push({
                type: 'bool',
                value: register2.value === register1.value ? 1 : 0,
            });
        },
        '&': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type !== 'string' && register2.type !== 'string') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            gStack.push({
                type: 'string',
                value: register2.value + register1.value,
            });
        },
        '&=': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (originalRegister1.type !== 'variable') {
                throw 'Cannot assign ' + originalRegister1.value + '...';
            }

            if (register1.type === 'string' && register2.type === 'string') {
                register2 = {
                    type: 'string',
                    value: register2.value + register1.value,
                };
            }
            else if ((register1.type === 'bool' || register1.type === 'number') && (register2.type === 'bool' || register2.type === 'number')) {
                register2 = {
                    type: 'bool',
                    value: register2.value !== 0 && register1.value !== 0 ? 1 : 0,
                };
            }
            else {
                throw 'Wrong datatype...';
            }

            setVariable(originalRegister1.value, register2, localVariables, localFlags, recursionDepth);
        },
        '&&': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            switch (register1.type) {
                case 'bool':
                case 'number':
                    if (register2.type !== 'bool' && register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    gStack.push({
                        type: 'bool',
                        value: register2.value !== 0 && register1.value !== 0 ? 1 : 0,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
        '-': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type === 'number' && register2.type === 'number') {
                gStack.push({
                    type: 'number',
                    value: register2.value - register1.value,
                });
            }
            else {
                throw 'Wrong datatype...';
            }
        },
        '-=': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (originalRegister1.type !== 'variable') {
                throw 'Cannot assign ' + originalRegister1.value + '...';
            }
            else if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            register2 = {
                type: 'number',
                value: register2.value - register1.value,
            };

            setVariable(originalRegister1.value, register2, localVariables, localFlags, recursionDepth);
        },
        '--': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (originalRegister1.type !== 'variable') {
                throw 'Cannot assign ' + originalRegister1.value + '...';
            }
            else if (register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + '...';
            }

            register2 = {
                type: 'number',
                value: register1.value - 1,
            };

            setVariable(originalRegister1.value, register2, localVariables, localFlags, recursionDepth);
        },
        '+': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type === 'string' && register2.type === 'string') {
                gStack.push({
                    type: 'string',
                    value: register2.value + register1.value,
                });
            }
            else if (register1.type === 'number' && register2.type === 'number') {
                gStack.push({
                    type: 'number',
                    value: register2.value + register1.value,
                });
            }
            else {
                throw 'Wrong datatype...';
            }
        },
        '+=': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (originalRegister1.type !== 'variable') {
                throw 'Cannot assign ' + originalRegister1.value + '...';
            }
            else if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            register2 = {
                type: 'number',
                value: register2.value + register1.value,
            };

            setVariable(originalRegister1.value, register2, localVariables, localFlags, recursionDepth);
        },
        '++': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (originalRegister1.type !== 'variable') {
                throw 'Cannot assign ' + originalRegister1.value + '...';
            }
            else if (register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + '...';
            }

            register2 = {
                type: 'number',
                value: register1.value + 1,
            };

            setVariable(originalRegister1.value, register2, localVariables, localFlags, recursionDepth);
        },
        '*': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            gStack.push({
                type: 'number',
                value: register2.value * register1.value,
            });
        },
        '*=': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (originalRegister1.type !== 'variable') {
                throw 'Cannot assign ' + originalRegister1.value + '...';
            }
            else if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            register2 = {
                type: 'number',
                value: register2.value * register1.value,
            };

            setVariable(originalRegister1.value, register2, localVariables, localFlags, recursionDepth);
        },
        '/': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            gStack.push({
                type: 'number',
                value: Math.floor(register2.value / register1.value),
            });
        },
        '/=': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (originalRegister1.type !== 'variable') {
                throw 'Cannot assign ' + originalRegister1.value + '...';
            }
            else if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            register2 = {
                type: 'number',
                value: Math.floor(register2.value / register1.value),
            };

            setVariable(originalRegister1.value, register2, localVariables, localFlags, recursionDepth);
        },
        '%': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            gStack.push({
                type: 'number',
                value: register2.value % register1.value,
            });
        },
        '%=': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (originalRegister1.type !== 'variable') {
                throw 'Cannot assign ' + originalRegister1.value + '...';
            }
            else if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            register2 = {
                type: 'number',
                value: register2.value % register1.value,
            };

            setVariable(originalRegister1.value, register2, localVariables, localFlags, recursionDepth);
        },
        '>': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            gStack.push({
                type: 'bool',
                value: register2.value > register1.value ? 1 : 0,
            });
        },
        '>=': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            gStack.push({
                type: 'bool',
                value: register2.value >= register1.value ? 1 : 0,
            });
        },
        '<': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            gStack.push({
                type: 'bool',
                value: register2.value < register1.value ? 1 : 0,
            });
        },
        '<=': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (register1.type !== register2.type || register1.type !== 'number') {
                throw 'Cannot ' + register1.type + ' ' + commandList[j].value + ' ' + register2.type + '...';
            }

            gStack.push({
                type: 'bool',
                value: register2.value <= register1.value ? 1 : 0,
            });
        },
        '|=': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            if (originalRegister1.type !== 'variable') {
                throw 'Cannot assign ' + originalRegister1.value + '...';
            }

            if ((register1.type === 'bool' || register1.type === 'number') && (register2.type === 'bool' || register2.type === 'number')) {
                register2 = {
                    type: 'bool',
                    value: register2.value !== 0 || register1.value !== 0 ? 1 : 0,
                };
            }
            else {
                throw 'Wrong datatype...';
            }

            setVariable(originalRegister1.value, register2, localVariables, localFlags, recursionDepth);
        },
        '||': function (register1, register2, originalRegister1, localVariables, localFlags, recursionDepth) {
            switch (register1.type) {
                case 'bool':
                case 'number':
                    if (register2.type !== 'bool' && register2.type !== 'number') {
                        throw 'Wrong datatype...';
                    }

                    gStack.push({
                        type: 'bool',
                        value: register2.value !== 0 || register1.value !== 0 ? 1 : 0,
                    });

                    break;
                default:
                    throw 'Wrong datatype...';
            }
        },
    };

    this.setScope = (function (scope) {
        $scope = scope;
    });

    this.iptParser = (function (str, events) {
        var result = events ? {} : [];
        var chars = str.split('');

        for (var j = 0; j < chars.length; j++) {
            if (chars[j].trim() === "") {
                continue;
            }
            else if (chars[j] === ";") {
                for (j = j + 1; j < chars.length; j++) {
                    if (chars[j] === "\r" || chars[j] === "\n") {
                        break;
                    }
                }
            }
            else if (events && chars[j] === "O" && chars[j + 1] === "N" && chars[j + 2].trim() === "") {
                var tokenStart = (j += 3);
                var bracketDepth = 0;
                var arrayDepth = 0;

                for (; j < chars.length; j++) {
                    if (chars[j] === "{") {
                        break;
                    }
                }

                var eventName = str.substring(tokenStart, j).trim();

                tokenStart = j;

                for (; j < chars.length; j++) {
                    if (chars[j] === "\"") {
                        for (; j < chars.length; j++) {
                            if (chars[j] === "\"") {
                                break;
                            }
                            else if (chars[j] === "\\" && chars[j + 1] === "\"") {
                                j++;
                            }
                        }
                    }
                    else if (chars[j] === "{") {
                        bracketDepth++;

                        if (bracketDepth > this.gNestedAtomlistMaxDepth) {
                            throw 'Exceeded max atomlist depth...';
                        }
                    }
                    else if (chars[j] === "}") {
                        if (bracketDepth > 0) {
                            bracketDepth--;

                            if (bracketDepth === 0) {
                                break;
                            }
                        }
                        else {
                            throw 'Unexpected closing bracket \'}\'';
                        }
                    }
                    else if (chars[j] === "[") {
                        arrayDepth++;

                        if (arrayDepth > this.gNestedArrayMaxDepth) {
                            throw 'Exceeded max array depth...';
                        }
                    }
                    else if (chars[j] === "]") {
                        if (arrayDepth > 0) {
                            arrayDepth--;
                        }
                        else {
                            throw 'Unexpected closing bracket \']\'';
                        }
                    }
                }

                var atomlistStr = str.substring(tokenStart + 1, j - 1);

                result[eventName] = this.iptParser(atomlistStr, false);
            }
            else if (chars[j] === "\"") {
                var tokenStart = j;

                for (j = j + 1; j < chars.length; j++) {
                    if (chars[j] === "\"") {
                        break;
                    }
                    else if (chars[j] === "\\" && chars[j + 1] === "\"") {
                        j++;
                    }
                }

                var substr = str.substring(tokenStart + 1, j);

                result.push({
                    type: 'string',
                    value: substr,
                });
            }
            else if (chars[j] === "{") {
                var bracketDepth = 0;
                var arrayDepth = 0;
                var tokenStart = j;

                for (; j < chars.length; j++) {
                    if (chars[j] === "\"") {
                        for (; j < chars.length; j++) {
                            if (chars[j] === "\"") {
                                break;
                            }
                            else if (chars[j] === "\\" && chars[j + 1] === "\"") {
                                j++;
                            }
                        }
                    }
                    else if (chars[j] === "{") {
                        bracketDepth++;

                        if (bracketDepth > this.gNestedAtomlistMaxDepth) {
                            throw 'Exceeded max atomlist depth...';
                        }
                    }
                    else if (chars[j] === "}") {
                        if (bracketDepth > 0) {
                            bracketDepth--;

                            if (bracketDepth === 0) {
                                break;
                            }
                        }
                        else {
                            throw 'Unexpected closing bracket \'}\'';
                        }
                    }
                    else if (chars[j] === "[") {
                        arrayDepth++;

                        if (arrayDepth > this.gNestedArrayMaxDepth) {
                            throw 'Exceeded max array depth...';
                        }
                    }
                    else if (chars[j] === "]") {
                        if (arrayDepth > 0) {
                            arrayDepth--;
                        }
                        else {
                            throw 'Unexpected closing bracket \']\'';
                        }
                    }
                }

                var atomlistContents = str.substring(tokenStart + 1, j);

                result.push({
                    type: 'atomlist',
                    value: this.iptParser(atomlistContents, false),
                });
            }
            else if (chars[j] === "[") {
                var bracketDepth = 0;
                var arrayDepth = 0;
                var tokenStart = j;

                for (; j < chars.length; j++) {
                    if (chars[j] === "\"") {
                        for (; j < chars.length; j++) {
                            if (chars[j] === "\"") {
                                break;
                            }
                            else if (chars[j] === "\\" && chars[j + 1] === "\"") {
                                j++;
                            }
                        }
                    }
                    else if (chars[j] === "{") {
                        bracketDepth++;

                        if (bracketDepth > this.gNestedAtomlistMaxDepth) {
                            throw 'Exceeded max atomlist depth...';
                        }
                    }
                    else if (chars[j] === "}") {
                        if (bracketDepth > 0) {
                            bracketDepth--;
                        }
                        else {
                            throw 'Unexpected closing bracket \'}\'';
                        }
                    }
                    else if (chars[j] === "[") {
                        arrayDepth++;

                        if (arrayDepth > this.gNestedArrayMaxDepth) {
                            throw 'Exceeded max array depth...';
                        }
                    }
                    else if (chars[j] === "]") {
                        if (arrayDepth > 0) {
                            arrayDepth--;

                            if (arrayDepth === 0) {
                                break;
                            }
                        }
                        else {
                            throw 'Unexpected closing bracket \']\'';
                        }
                    }
                }

                var arrayContents = str.substring(tokenStart + 1, j);

                result.push({
                    type: 'array',
                    value: this.iptParser(arrayContents, false),
                });
            }
            else if (chars[j] === '-' && (chars[j + 1] === "0" || chars[j + 1] === "1" || chars[j + 1] === "2" || chars[j + 1] === "3" || chars[j + 1] === "4" || chars[j + 1] === "5" || chars[j + 1] === "6" || chars[j + 1] === "7" || chars[j + 1] === "8" || chars[j + 1] === "9")) {
                var tokenStart = j;

                for (; j < chars.length; j++) {
                    if (chars[j].trim() === "") {
                        break;
                    }
                }

                var token = str.substring(tokenStart, j);

                try {
                    var value = Math.floor(token);

                    result.push({
                        type: 'number',
                        value: value,
                    });
                } catch (e) {
                    throw 'Unexpected ' + token + '...';
                }
            }
            else if (chars[j] === '!' || chars[j] === '=' || chars[j] === '+' || chars[j] === '-' || chars[j] === '*' || chars[j] === '/' || chars[j] === '%' || chars[j] === '<' || chars[j] === '>' || chars[j] === '&' || chars[j] === '|') {
                if (chars[j + 1] === '=') {
                    result.push({
                        type: 'operator',
                        value: chars[j] + chars[j + 1],
                    });

                    j++;
                }
                else if (
                    (chars[j] === '&' && chars[j + 1] === '&') ||
                    (chars[j] === '|' && chars[j + 1] === '|') ||
                    (chars[j] === '<' && chars[j + 1] === '>') ||
                    (chars[j] === '+' && chars[j + 1] === '+') ||
                    (chars[j] === '-' && chars[j + 1] === '-')) {
                    result.push({
                        type: 'operator',
                        value: chars[j] + chars[j + 1],
                    });

                    j++;
                }
                else {
                    result.push({
                        type: 'operator',
                        value: chars[j],
                    });
                }
            }
            else {
                var tokenStart = j;

                for (; j < chars.length; j++) {
                    if (chars[j].trim() === "") {
                        break;
                    }
                }

                var token = str.substring(tokenStart, j);
                var commmand = token.toUpperCase();

                if (chars[tokenStart] === "0" || chars[tokenStart] === "1" || chars[tokenStart] === "2" || chars[tokenStart] === "3" || chars[tokenStart] === "4" || chars[tokenStart] === "5" || chars[tokenStart] === "6" || chars[tokenStart] === "7" || chars[tokenStart] === "8" || chars[tokenStart] === "9") {
                    try {
                        var value = Math.floor(token);

                        result.push({
                            type: 'number',
                            value: value,
                        });
                    } catch (e) {
                        throw 'Unexpected ' + token + '...';
                    }
                }
                else if (iptCommands[commmand]) {
                    if (typeof iptCommands[commmand] === 'string') {
                        commmand = iptCommands[commmand];
                    }

                    result.push({
                        type: 'command',
                        value: commmand,
                    });
                }
                else {
                    result.push({
                        type: 'variable',
                        value: token,
                    });
                }
            }
        }

        return result;
    });

    this.iptExecutor = (function (commandList, nestedVariables, nestedFlags, recursionDepth) {
        var localVariables = nestedVariables || {};
        var localFlags = nestedFlags || {};

        if (recursionDepth === undefined) {
            recursionDepth = 0;
        }

        gStack = recursionDepth > 0 && gStack || [];

        for (var j = 0; j < commandList.length; j++) {
            switch (commandList[j].type) {
                case 'command':
                    gReturn = false;

                    iptCommands[commandList[j].value].apply(this, [localVariables, localFlags, recursionDepth]);

                    if (gReturn) {
                        return;
                    }

                    break;
                case 'operator':
                    var register1 = gStack.pop();
                    var originalRegister1 = register1;
                    var register2;

                    if (commandList[j].value !== '!' && commandList[j].value !== '++' && commandList[j].value !== '--') {
                        register2 = gStack.pop();
                    }

                    var temp = getVariable(register1, localVariables, localFlags);
                    if (temp !== undefined) register1 = temp;

                    var temp = getVariable(register2, localVariables, localFlags);
                    if (temp !== undefined) register2 = temp;

                    if (iptOperators[commandList[j].value]) {
                        iptOperators[commandList[j].value].apply(this, [register1, register2, originalRegister1, localVariables, localFlags, recursionDepth]);
                    }

                    break;
                //case 'bool':
                //case 'array':
                //case 'string':
                //case 'number':
                //case 'atomlist':
                //case 'variable':
                default:
                    gStack.push(commandList[j]);

                    break;
            }
        }

        for (var j in localFlags) {
            if (localFlags[j].depth >= recursionDepth) {
                delete localVariables[j];
                delete localFlags[j];
            }
        }

        if (gStack.length > 0) {
            if (gStack.length > this.gStackMaxSize) {
                gStack.splice(this.gStackMaxSize);

                var message = 'Stack space exceeded...';

                $scope.model.Interface.LogList.push({
                    text: message,
                    userName: this.iptEngineUsername,
                    isWhisper: true,
                });

                console.log(message);
            }

            if (recursionDepth < 1) {
                var message = 'Stack wasn\'t empty upon exit...';

                $scope.model.Interface.LogList.push({
                    text: message,
                    userName: this.iptEngineUsername,
                    isWhisper: true,
                });

                console.log(message);
            }
        }
    });
}]);
