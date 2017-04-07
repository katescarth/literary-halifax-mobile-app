'use strict';

import NbBlobWorker from './nb-blob-worker.js';

/**
 * event class implementation
 * this require the Riot injection to work
 */
export class NbBlobWorkerEvent {
    /**
     * class constructor
     * @param {object} param to setup the webworker
     * @return {undefined} nothing
     */
    constructor(config)
    {
        let param = {};
        if (config.jsonpFnName) {
            param.jsonpFnName = config.jsonpFnName;
            Reflect.deleteProperty(config , 'jsonpFnName');
        }
        this.__worker__ = NbBlobWorker(param);
        this.__eventsStore__ = [];
        this.__lazyStore__ = [];
        if (config.auto === undefined) {
            config.auto = true;
        }
        // store the config
        this.__config__ = config;
        // execute change to if set to auto
        if (this.__config__.auto) {
            this.__init__(config);
        }
    }

    /**
     * manually execute the call
     * @param {object} data optional
     * @return {undefined} nothing
     */
    $execute(data = {})
    {
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

    /**
     * @param {string} evtName name of the event to listen
     * @param {function} callback function to trigger
     * @return {function} unsubscribe function to call off this event
     */
    $on(evtName , callback)
    {
        const found = this.__eventsStore__.filter( (evt) => evt.name === evtName );
        if (found.length) {
            return function() {};
        }
        // search the lazy store
        const search = this.__lazyStore__.filter( (evt) => evt.name === evtName );
        if (search.length) {
            callback.apply(search.context , search.payload);
            // remove from lazy store
            this.__lazyStore__.filter( (evt) => evt.name !== evtName );
            // then fall through
        }
        return this.__attachEvent__(evtName ,callback);
    }

    /**
     * @param {string} evtName name of event to trigger
     * @param {mixed} payload data pass to the fn
     * @param {object} context (optional) the context to execute the call
     * @return {boolean} found if the event existed and executed
     */
    $trigger(evtName , payload , context = null)
    {
        const found = this.__eventsStore__.filter( (evt) => evt.name === evtName );
        if (!found.length) {
            // lazy store here when this evtName is yet to register
            const check = this.__lazyStore__.filter( (evt) => evt.name === evtName );
            if (!check.length) {
                this.__lazyStore__.push({
                    name: evtName,
                    payload: payload,
                    context: context
                });
            }
            return false;
        }
        return this.__executeEvent__(found,payload,context);
    }

    /**
     * terminate the web worker
     * @return {undefined} nothing
     */
    $end()
    {
        this.__worker__.terminate();
    }

    //////////////////////////
    //    PRIVATE METHODS   //
    //////////////////////////

    /**
     * @param {object} params config param for web worker
     * @return {undefined} nothing
     */
    __init__(params)
    {
        // comm with worker
        this.__worker__.postMessage(params);
        // listen to message
        this.__worker__.onmessage = (e) =>
        {
            const d = e.data;
            // the problem is here - never got trigger!
            if (d.type !== undefined && d.error === undefined) {
                const data = d.data || null;
                this.$trigger(
                    d.type ,
                    data || JSON.parse(data)
                );
            }
            else if (d.error !== undefined) {
                const error =  d.error ? JSON.parse(d.error) : 'UNKNOWN';
                this.$trigger('error' , error);
            }
        };
        // on error
        this.__worker__.onerror = (e) =>
        {
            this.$trigger('error' , e.data);
        }
    };

    /**
     * @param {string} evtName name of the event to listen to
     * @param {function} callback function to call
     * @return {function} unsubcribe function to remove event
     */
    __attachEvent__(evtName , callback)
    {
        this.__eventsStore__.push({
            name: evtName,
            fn: callback
        });
        return () => {
            this.__eventsStore__ = this.__eventsStore__.filter( (evt) =>
            {
                evt.name !== evtName;
            });
        }
    }

    /**
     * @param {array} found the original filter to check if the name already registered
     * @param {mixed} payload data pass to the fn
     * @param {object} context (optional) the context to execute the call
     * @return {mixed} found false not found and add to lazy store, or the method return value
     */
    __executeEvent__(found , payload , context = null)
    {
        return found[0].fn.call(context , payload);
    }
}

// -- EOF --
