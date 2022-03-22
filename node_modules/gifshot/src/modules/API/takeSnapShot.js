/*
  takeSnapShot.js
  ===============
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

import utils from '../core/utils';
import defaultOptions from '../core/defaultOptions';
import createGIF from './createGIF';

export default function takeSnapShot (userOptions, callback) {
    callback = utils.isFunction(userOptions) ? userOptions : callback;
    userOptions = utils.isObject(userOptions) ? userOptions : {};

    if (!utils.isFunction(callback)) {
        return;
    }

    const mergedOptions = utils.mergeOptions(defaultOptions, userOptions);
    const options = utils.mergeOptions(mergedOptions, {
        'interval': .1,
        'numFrames': 1,
        'gifWidth': Math.floor(mergedOptions.gifWidth),
        'gifHeight': Math.floor(mergedOptions.gifHeight)
    });

    createGIF(options, callback);
};
