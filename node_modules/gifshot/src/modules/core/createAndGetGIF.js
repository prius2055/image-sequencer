/*
  createAndGetGIF.js
  ==================
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

// Dependencies
import utils from './utils';
import screenShot from './screenShot';
import stopVideoStreaming from '../API/stopVideoStreaming';

export default function createAndGetGIF (obj, callback) {
    let options = obj.options || {};

    const {
        images,
        video
    } = options;
    const gifWidth = Number(options.gifWidth);
    const gifHeight = Number(options.gifHeight);
    const numFrames = Number(options.numFrames);
    let {
        cameraStream,
        videoElement,
        videoWidth,
        videoHeight
    } = obj;
    const cropDimensions = screenShot.getCropDimensions({
        videoWidth,
        videoHeight,
        gifHeight,
        gifWidth
    });
    const completeCallback = callback;

    options.crop = cropDimensions;
    options.videoElement = videoElement;
    options.videoWidth = videoWidth;
    options.videoHeight = videoHeight;
    options.cameraStream = cameraStream;

    if (!utils.isElement(videoElement)) {
        return;
    }

    videoElement.width = gifWidth + cropDimensions.width;
    videoElement.height = gifHeight + cropDimensions.height;

    if (!options.webcamVideoElement) {
        utils.setCSSAttr(videoElement, {
            position: 'fixed',
            opacity: '0'
        });

        document.body.appendChild(videoElement);
    }

    // Firefox doesn't seem to obey autoplay if the element is not in the DOM when the content
    // is loaded, so we must manually trigger play after adding it, or the video will be frozen
    videoElement.play();

    screenShot.getGIF(options, (obj) => {
        if ((!images || !images.length) && (!video || !video.length)) {
            stopVideoStreaming(obj);
        }

        completeCallback(obj);
    });
};
