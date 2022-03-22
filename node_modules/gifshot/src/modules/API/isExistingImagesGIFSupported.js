/*
  isSupported.js
  ==============
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

// Dependencies
import error from '../core/error';

export default function isSupported () {
    const options = {
        getUserMedia: true
    };

    return error.isValid(options);
};
