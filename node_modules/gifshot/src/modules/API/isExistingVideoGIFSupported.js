/*
  isExistingVideoGIFSupported.js
  ==============================
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

// Dependencies
import utils from '../core/utils';
import error from '../core/error';

export default function isExistingVideoGIFSupported (codecs) {
    let hasValidCodec = false;

    if (utils.isArray(codecs) && codecs.length) {
        utils.each(codecs, function (indece, currentCodec) {
            if (utils.isSupported.videoCodecs[currentCodec]) {
                hasValidCodec = true;
            }
        });

        if (!hasValidCodec) {
            return false;
        }
    } else if (utils.isString(codecs) && codecs.length) {
        if (!utils.isSupported.videoCodecs[codecs]) {
            return false;
        }
    }

    return error.isValid({
        'getUserMedia': true
    });
};
