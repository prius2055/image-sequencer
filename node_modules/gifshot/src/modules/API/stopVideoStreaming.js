/*
  stopVideoStreaming.js
  =====================
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

import utils from '../core/utils';
import videoStream from '../core/videoStream';

export default function stopVideoStreaming (options) {
    options = utils.isObject(options) ? options: {};

    videoStream.stopVideoStreaming(options);
};
