/*
  existingWebcam.js
  =================
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

// Dependencies
import utils from './utils';
import error from './error';
import createAndGetGIF from './createAndGetGIF';
import screenShot from './screenShot';
import videoStream from './videoStream';
import isWebCamGIFSupported from '../API/isWebCamGIFSupported';

export default function existingWebcam (obj = {}) {
    const {
        callback,
        lastCameraStream,
        options,
        webcamVideoElement
    } = obj;

    if (!isWebCamGIFSupported()) {
        return callback(error.validate());
    }

    if (options.savedRenderingContexts.length) {
        screenShot.getGIF(options, (obj) => {
            callback(obj);
        });

        return;
    }

    videoStream.startVideoStreaming((obj = {}) => {
        obj.options = options || {};

        createAndGetGIF(obj, callback);
    }, {
        lastCameraStream: lastCameraStream,
        callback: callback,
        webcamVideoElement: webcamVideoElement,
        crossOrigin: options.crossOrigin
    });
};
