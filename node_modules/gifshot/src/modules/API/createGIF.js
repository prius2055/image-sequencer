/*
  createGIF.js
  ============
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

// Dependencies
import utils from '../core/utils';
import defaultOptions from '../core/defaultOptions';
import existingImages from '../core/existingImages';
import existingVideo from '../core/existingVideo';
import existingWebcam from '../core/existingWebcam';

// Helpers
const noop = () => {};

export default function createGIF (userOptions, callback) {
    callback = utils.isFunction(userOptions) ? userOptions : callback;
    userOptions = utils.isObject(userOptions) ? userOptions : {};

    if (!utils.isFunction(callback)) {
        return;
    }

    let options = utils.mergeOptions(defaultOptions, userOptions) || {};
    const lastCameraStream = userOptions.cameraStream;
    const images = options.images;
    const imagesLength = images ? images.length : 0;
    const video = options.video;
    const webcamVideoElement = options.webcamVideoElement;

    options = utils.mergeOptions(options, {
        'gifWidth': Math.floor(options.gifWidth),
        'gifHeight': Math.floor(options.gifHeight)
    });

    // If the user would like to create a GIF from an existing image(s)
    if (imagesLength) {
        existingImages({
            'images': images,
            'imagesLength': imagesLength,
            'callback': callback,
            'options': options
        });
    } else if (video) {
      // If the user would like to create a GIF from an existing HTML5 video
      existingVideo({
        'existingVideo': video,
        callback,
        options
      });
    } else {
      // If the user would like to create a GIF from a webcam stream
      existingWebcam({
        lastCameraStream,
        callback,
        webcamVideoElement,
        options
      });
    }
};
