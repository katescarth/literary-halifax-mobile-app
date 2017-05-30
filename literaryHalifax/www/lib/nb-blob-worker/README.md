# nb-blob-worker

This is a standalone web worker with inline script (generate by `Blob`)

## Installation

Bower:

    bower install nb-blob-worker --save

NPM:

    npm install nb-blob-worker --save

Yarn:

    yarn add nb-blob-worker

## Introduction

There are one method and one class return from this module.

By default

```javascript

import NbBlobWorker from 'nb-blob-worker';
// or using the ES6 destructuring
import {NbBlobWorkerEvent} from 'nb-blob-worker';

// or a common js style

const NbBlobWorker = require('nb-blob-worker')['default'];

const NbBlobWorkerEvent = require('nb-blob-worker')['NbBlobWorkerEvent'];

```

## Basic Example:

This is an ES6 example from our production code:

```javascript

const Worker = require('nb-blob-worker');

const localWorker = Worker(); // this will always return a new worker();    

localWorker.postMessage({
    url: 'url_to_http_fetch',
    type: 'GET' // 'POST'
    data: {} // optional
});

```

The above example will make a call to the end point `url`.

```javascript

localWorker.onmessage = function(e)
{
    var data = e.data;
    // do whatever you need with the result     
};

localWorker.onerror = function(e)
{
    var error = e.data;
    // handle your error;
};

```

### Using NbBlobWorkerEvent

```javascript

import {NbBlobWorkerEvent} from 'nb-blob-worker';

const workerInstance = new NbBlobWorkerEvent({
    url: 'url_to_http_fetch',
    type: 'GET',
    auto: true // then it will execute this call immediately
});

workerInstance.$on('GET' , (data) =>
{
    // the e.data return here
});

workerInstance.$on('error' , (error) =>
{
    // handle your error
});

// later on if you need to call the same url again

workerInstance.$execute();

// of if you need to pass a different parameters

workerInstance.$execute({data: {id: 1}});

```


## Interval Example:

```javascript

const Worker = require('nb-blob-worker');

const localWorker = Worker(); // this will always return a new worker();    

localWorker.postMessage({
    url: 'url_to_http_fetch',
    type: 'GET', // 'POST'
    data: {}, // optional
    timer: 2000 // in ms  
});

```

Now the above code will get call every 2 seconds.

## JSONP (v1.3.0)

Example:

```javascript

const Worker = require('nb-blob-worker');

const localWorker = Worker(); // this will always return a new worker();    

localWorker.postMessage({
    url: 'external_url_to_http_fetch',
    type: 'JSONP', // make sure its upper case!!!
    data: {} // see explain
});

```

When you use the `JSONP` (uppercase please!) option. Please do not pass any query parameter.
Instead put them int the `data` parameter, it will automatically append it for you.

The reason is the code dynamically add several options to the url.

* The callback name will be `nbWorkerCallback` make sure your code create corresponded response. If you want to use your own callback name. See example below.
* add `cb=randomNumber` AKA cache buster.   

### Using your own callback name

```javascript

    const worker = require('nb-blob-worker');

    const localWorker = worker({jsonpFnName: 'yourCallbackName'});


    localWorker.postMessage({
        url: 'external_url_to_http_fetch',
        type: 'JSONP', // make sure its upper case!!!
        data: {} // see explain
    });

```

Using `NbBlobWorkerEvent`:

```javascript

import {NbBlobWorkerEvent} from 'nb-blob-worker';

const workerInstance = new NbBlobWorkerEvent({
    jsonpFnName: 'yourCallbackName',
    url: 'url_to_http_fetch',
    type: 'GET',
    auto: true // default, false then it will not execute the call immediately
});

// if you don't pass the auto option
workerInstance.$execute();

```

Then in your server code just wrap the data in the name you specified.


## DEBUG , TIMEOUT

@2016-11-04 add two new configuration properties `debug` and `timeout`

when you add `debug` (value is anything not *falsy*)

```javascript

const Worker = require('nb-blob-worker');

const localWorker = Worker(); // this will always return a new worker();    

localWorker.postMessage({
    url: 'url_to_http_fetch',
    type: 'GET',
    debug: true
});

```

In your `onmessage` call

```javascript

    localWorker.onmessage = function(e)
    {
        var data = e.data;
        if (data.debug) {
            // the value is the xhr object
        }
        /// ...
    };
```

And now you can set a timeout property (in mil seconds)

```javascript

const Worker = require('nb-blob-worker');

const localWorker = Worker(); // this will always return a new worker();    

localWorker.postMessage({
    url: 'url_to_http_fetch',
    type: 'GET',
    timeout: 2000
});

```

Internally we have set a `onTimeout` error handler.
So you will get an error message `{error: 'TIMEOUT'}` when its timeout.

## NOTE ABOUT SETTING YOUR URL

Please make sure you set the absolute url path.

If you pass something like

```javascript

    localWorker.postMessage({
        url: '/api/something',
        type: 'GET'
    });
```

Your browser might complain about cross origin. Instead you could do it like this:


```javascript

    localWorker.postMessage({
        url: window.location.origin + '/api/something',
        type: 'GET'
    });
```

## DEV

We are using [yarn](https://yarnpkg.com) instead of `npm` to handle the `devDependencies`.

If you don't have `yarn`:

    npm install yarn -g

Then cd into the directory:

    yarn install

There is one command to run (turn the ES6 --> ES5)

    npm run compile 


## IMPORTANT

~~I have to cheat a little bit to get the ES5 version to work. It has to do with the babel configuration. Just open the `worker-es5.js` and check the comment.~~   

Also we are using a new standard [jsnext:main](https://github.com/rollup/rollup/wiki/jsnext:main) to notify the importer / bundler this is a ES6 first module.

---

Joel / Oct 2016 / London

[to1source](https://to1source.com)
