'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function NbBlobWorker() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var jsonpCallbackFn = config.jsonpFnName ? config.jsonpFnName : 'nbWorkerCallback';
    var workerStr = '\n    var jsonp = function(e)\n    {\n        var ' + jsonpCallbackFn + ' = function(data)\n        {\n            self.postMessage({error: null , type: \'JSONP\' , data: data});\n        };\n        var cb = (Math.floor(Math.random()*10000) + 1),\n            urls = payload.url.split(\'?callback\'),\n            url = urls[0] + \'?callback=' + jsonpCallbackFn + '&amp;cb=\' + cb;\n        if (payload.data) {\n            var extra = [];\n            for (var key in payload.data) {\n                extra.push([key , payload.data[key]].join(\'=\'));\n            }\n            url += extra.join(\'&amp;\');\n        }\n        importScripts(url);\n    };\n    var fetch = function(e)\n    {\n        var xhr ,\n            DONE = 4,\n            SUCCESS = 200,\n            payload = e.data,\n            debug = payload.debug;\n\n        if (payload.type === \'JSONP\') {\n            return jsonp(e);\n        }\n\n        if(typeof XMLHttpRequest !== \'undefined\') {\n            xhr = new XMLHttpRequest();\n        }\n        else {\n            var versions = [\n                "MSXML2.XmlHttp.5.0",\n                "MSXML2.XmlHttp.4.0",\n                "MSXML2.XmlHttp.3.0",\n                "MSXML2.XmlHttp.2.0",\n                "Microsoft.XmlHttp"\n            ];\n            for(var i = 0, len = versions.length; i < len; i++) {\n                try {\n                    xhr = new ActiveXObject(versions[i]);\n                    break;\n                } catch(e){}\n            }\n        }\n\n        xhr.ontimeout = function()\n        {\n            self.postMessage({error: \'TIMEOUT\'});\n        };\n\n        xhr.onprogress = function()\n        {\n            if (debug) {\n                self.postMessage({\n                    debug: {\n                        ready: xhr.readyState\n                    }\n                });\n            }\n        }\n\n        xhr.onload = function()\n        {\n            if (xhr.readyState === DONE) {\n                if (xhr.status === SUCCESS) {\n                    self.postMessage({data: xhr.responseText , type: payload.type});\n                }\n                else {\n                    self.postMessage({error: xhr.responseText , status: xhr.status});\n                }\n            }\n            if (debug) {\n                self.postMessage({\n                    debug: {\n                        status: xhr.status ,\n                        ready: xhr.readyState ,\n                        data: xhr.responseText ,\n                        type: payload.type\n                    }\n                });\n            }\n        }\n\n        if (payload.type === \'GET\' && payload.data) {\n            var params = [];\n            for (var key in payload.data) {\n                params.push(key + \'=\' + payload.data[key]);\n            }\n            var additional = params.join(\'&\');\n            var symbol = (payload.url.indexOf(\'?\') > -1) ? \'&\' : \'?\';\n            payload.url = [payload.url , additional].join(symbol);\n            if (debug) {\n                self.postMessage({\n                    debug: {\n                        url: payload.url\n                    }\n                });\n            }\n        }\n        xhr.open(payload.type , payload.url, true);\n        for (var header in payload.header) {\n            xhr.setRequestHeader(header , payload.header[header]);\n        }\n        if (payload.timeout) {\n            xhr.timeout = payload.timeout;\n        }\n        xhr.send(payload.data || {});\n    };\n    var timer;\n    var polling = function(e)\n    {\n        fetch(e);\n        timer = setInterval(function()\n        {\n            fetch(e);\n        } , e.data.timer);\n    };\n    self.addEventListener(\'message\' ,  function(e)\n    {\n        var data = e.data;\n        if (data.timer) {\n            polling(e);\n        }\n        else if (data.terminate) {\n            clearInterval(timer);\n        }\n        else {\n            fetch(e);\n        }\n    } , false);\n    ';
    var blob = null;
    try {
        blob = new Blob([workerStr], { 'type': 'application/javascript' });
    } catch (e) {
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new BlobBuilder();
        blob.append(workerStr);
        blob = blob.getBlob();
    }
    return new Worker(URL.createObjectURL(blob));
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var NbBlobWorkerEvent = function () {
    function NbBlobWorkerEvent(config) {
        classCallCheck(this, NbBlobWorkerEvent);
        var param = {};
        if (config.jsonpFnName) {
            param.jsonpFnName = config.jsonpFnName;
            Reflect.deleteProperty(config, 'jsonpFnName');
        }
        this.__worker__ = NbBlobWorker(param);
        this.__eventsStore__ = [];
        this.__lazyStore__ = [];
        if (config.auto === undefined) {
            config.auto = true;
        }
        this.__config__ = config;
        if (this.__config__.auto) {
            this.__init__(config);
        }
    }
    createClass(NbBlobWorkerEvent, [{
        key: '$execute',
        value: function $execute() {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            if (data.url) {
                this.__config__.url = data.url;
            }
            if (data.data) {
                this.__config__.data = data.data;
            }
            if (data.type) {
                this.__config__.type = data.type;
            }
            this.__init__(this.__config__);
        }
    }, {
        key: '$on',
        value: function $on(evtName, callback) {
            var found = this.__eventsStore__.filter(function (evt) {
                return evt.name === evtName;
            });
            if (found.length) {
                return function () {};
            }
            var search = this.__lazyStore__.filter(function (evt) {
                return evt.name === evtName;
            });
            if (search.length) {
                callback.apply(search.context, search.payload);
                this.__lazyStore__.filter(function (evt) {
                    return evt.name !== evtName;
                });
            }
            return this.__attachEvent__(evtName, callback);
        }
    }, {
        key: '$trigger',
        value: function $trigger(evtName, payload) {
            var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            var found = this.__eventsStore__.filter(function (evt) {
                return evt.name === evtName;
            });
            if (!found.length) {
                var check = this.__lazyStore__.filter(function (evt) {
                    return evt.name === evtName;
                });
                if (!check.length) {
                    this.__lazyStore__.push({
                        name: evtName,
                        payload: payload,
                        context: context
                    });
                }
                return false;
            }
            return this.__executeEvent__(found, payload, context);
        }
    }, {
        key: '$end',
        value: function $end() {
            this.__worker__.terminate();
        }
    }, {
        key: '__init__',
        value: function __init__(params) {
            var _this = this;
            this.__worker__.postMessage(params);
            this.__worker__.onmessage = function (e) {
                var d = e.data;
                if (d.type !== undefined && d.error === undefined) {
                    var data = d.data || null;
                    _this.$trigger(d.type, data || JSON.parse(data));
                } else if (d.error !== undefined) {
                    var error = d.error ? JSON.parse(d.error) : 'UNKNOWN';
                    _this.$trigger('error', error);
                }
            };
            this.__worker__.onerror = function (e) {
                _this.$trigger('error', e.data);
            };
        }
    }, {
        key: '__attachEvent__',
        value: function __attachEvent__(evtName, callback) {
            var _this2 = this;
            this.__eventsStore__.push({
                name: evtName,
                fn: callback
            });
            return function () {
                _this2.__eventsStore__ = _this2.__eventsStore__.filter(function (evt) {
                    evt.name !== evtName;
                });
            };
        }
    }, {
        key: '__executeEvent__',
        value: function __executeEvent__(found, payload) {
            var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            return found[0].fn.call(context, payload);
        }
    }]);
    return NbBlobWorkerEvent;
}();

exports.NbBlobWorker = NbBlobWorker;
exports.NbBlobWorkerEvent = NbBlobWorkerEvent;
