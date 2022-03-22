/*
  existingVideo.js
  ================
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

// Dependencies
import utils from './utils';
import createAndGetGIF from './createAndGetGIF';
import videoStream from './videoStream';
import error from './error';

export default function existingVideo (obj = {}) {
    let {
        callback,
        existingVideo,
        options
    } = obj;
    const skipObj = {
        getUserMedia: true,
        'window.URL': true
    };
    const errorObj = error.validate(skipObj);
    let loadedImages = 0;
    let videoType;
    let videoSrc;
    let tempImage;
    let ag;

    if (errorObj.error) {
        return callback(errorObj);
    }

    if (utils.isElement(existingVideo) && existingVideo.src) {
        videoSrc = existingVideo.src;
        videoType = utils.getExtension(videoSrc);

        if (!utils.isSupported.videoCodecs[videoType]) {
            return callback(error.messages.videoCodecs);
        }
    } else if (utils.isArray(existingVideo)) {
        utils.each(existingVideo, function(iterator, videoSrc) {
            if (videoSrc instanceof Blob) {
                videoType = videoSrc.type.substr(videoSrc.type.lastIndexOf('/') + 1, videoSrc.length);
            } else {
                videoType = videoSrc.substr(videoSrc.lastIndexOf('.') + 1, videoSrc.length);
            }

            if (utils.isSupported.videoCodecs[videoType]) {
                existingVideo = videoSrc;

                return false;
            }
        });
    }

    videoStream.startStreaming({
        completed: (obj) => {
            obj.options = options || {};

            createAndGetGIF(obj, callback);
        },
        existingVideo: existingVideo,
        crossOrigin: options.crossOrigin,
        options: options
    });
};
