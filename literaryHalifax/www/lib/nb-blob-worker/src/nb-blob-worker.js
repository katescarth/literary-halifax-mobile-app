'use strict';
/**
 * this will create the web worker with the blob
 * can we just include fetch inside the web worker?
 * @version v1.3.0
 */
export default function NbBlobWorker(config={})
{
    const jsonpCallbackFn = config.jsonpFnName ? config.jsonpFnName : 'nbWorkerCallback';

    const workerStr = `
    var jsonp = function(e)
    {
        var ${jsonpCallbackFn} = function(data)
        {
            self.postMessage({error: null , type: 'JSONP' , data: data});
        };
        var cb = (Math.floor(Math.random()*10000) + 1),
            urls = payload.url.split('?callback'),
            url = urls[0] + '?callback=${jsonpCallbackFn}&amp;cb=' + cb;
        if (payload.data) {
            var extra = [];
            for (var key in payload.data) {
                extra.push([key , payload.data[key]].join('='));
            }
            url += extra.join('&amp;');
        }
        importScripts(url);
    };
    var fetch = function(e)
    {
        var xhr ,
            DONE = 4,
            SUCCESS = 200,
            payload = e.data,
            debug = payload.debug;

        if (payload.type === 'JSONP') {
            return jsonp(e);
        }

        if(typeof XMLHttpRequest !== 'undefined') {
            xhr = new XMLHttpRequest();
        }
        else {
            var versions = [
                "MSXML2.XmlHttp.5.0",
                "MSXML2.XmlHttp.4.0",
                "MSXML2.XmlHttp.3.0",
                "MSXML2.XmlHttp.2.0",
                "Microsoft.XmlHttp"
            ];
            for(var i = 0, len = versions.length; i < len; i++) {
                try {
                    xhr = new ActiveXObject(versions[i]);
                    break;
                } catch(e){}
            }
        }

        xhr.ontimeout = function()
        {
            self.postMessage({error: 'TIMEOUT'});
        };

        xhr.onprogress = function()
        {
            if (debug) {
                self.postMessage({
                    debug: {
                        ready: xhr.readyState
                    }
                });
            }
        }

        xhr.onload = function()
        {
            if (xhr.readyState === DONE) {
                if (xhr.status === SUCCESS) {
                    self.postMessage({data: xhr.responseText , type: payload.type});
                }
                else {
                    self.postMessage({error: xhr.responseText , status: xhr.status});
                }
            }
            if (debug) {
                self.postMessage({
                    debug: {
                        status: xhr.status ,
                        ready: xhr.readyState ,
                        data: xhr.responseText ,
                        type: payload.type
                    }
                });
            }
        }

        if (payload.type === 'GET' && payload.data) {
            var params = [];
            for (var key in payload.data) {
                params.push(key + '=' + payload.data[key]);
            }
            var additional = params.join('&');
            var symbol = (payload.url.indexOf('?') > -1) ? '&' : '?';
            payload.url = [payload.url , additional].join(symbol);
            if (debug) {
                self.postMessage({
                    debug: {
                        url: payload.url
                    }
                });
            }
        }
        xhr.open(payload.type , payload.url, true);
        for (var header in payload.header) {
            xhr.setRequestHeader(header , payload.header[header]);
        }
        if (payload.timeout) {
            xhr.timeout = payload.timeout;
        }
        xhr.send(payload.data || {});
    };
    var timer;
    var polling = function(e)
    {
        fetch(e);
        timer = setInterval(function()
        {
            fetch(e);
        } , e.data.timer);
    };
    self.addEventListener('message' ,  function(e)
    {
        var data = e.data;
        if (data.timer) {
            polling(e);
        }
        else if (data.terminate) {
            clearInterval(timer);
        }
        else {
            fetch(e);
        }
    } , false);
    `;

    let blob = null;
    try {
        blob = new Blob([workerStr],{'type': 'application/javascript'});
    } catch (e) {
        window.BlobBuilder = window.BlobBuilder ||
                             window.WebKitBlobBuilder ||
                             window.MozBlobBuilder;
        blob = new BlobBuilder();
        blob.append(workerStr);
        blob = blob.getBlob();
    }
    return new Worker(URL.createObjectURL(blob));
};
// -- EOF --
