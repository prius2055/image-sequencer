/*
  screenShot.js
  =============
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

// Dependencies
import utils from './utils';
import AnimatedGIF from './AnimatedGIF';

// Helpers
const noop = () => {};

const screenShot = {
    getGIF: (options = {}, callback) => {
        callback = utils.isFunction(callback) ? callback : noop;

        let canvas = document.createElement('canvas');
        let context;
        let existingImages = options.images;
        const hasExistingImages = !!(existingImages.length);
        const {
            cameraStream,
            crop,
            filter,
            fontColor,
            fontFamily,
            fontWeight,
            keepCameraOn,
            numWorkers,
            progressCallback,
            saveRenderingContexts,
            savedRenderingContexts,
            text,
            textAlign,
            textBaseline,
            videoElement,
            videoHeight,
            videoWidth,
            webcamVideoElement
        } = options;
        let gifWidth = Number(options.gifWidth);
        let gifHeight = Number(options.gifHeight);
        let interval = Number(options.interval);
        let sampleInterval = Number(options.sampleInterval);
        let waitBetweenFrames = hasExistingImages ? 0 : interval * 1000;
        let renderingContextsToSave = [];
        let numFrames = savedRenderingContexts.length ? savedRenderingContexts.length : options.numFrames;
        let pendingFrames = numFrames;
        let ag = new AnimatedGIF(options);
        let fontSize = utils.getFontSize(options);
        let textXCoordinate = options.textXCoordinate ? options.textXCoordinate : textAlign === 'left' ? 1 : textAlign === 'right' ? gifWidth : gifWidth / 2;
        let textYCoordinate = options.textYCoordinate ? options.textYCoordinate : textBaseline === 'top' ? 1 : textBaseline === 'center' ? gifHeight / 2 : gifHeight;
        let font = fontWeight + ' ' + fontSize + ' ' + fontFamily;
        let sourceX = crop ? Math.floor(crop.scaledWidth / 2) : 0;
        let sourceWidth = crop ? videoWidth - crop.scaledWidth : 0;
        let sourceY = crop ? Math.floor(crop.scaledHeight / 2) : 0;
        let sourceHeight = crop ? videoHeight - crop.scaledHeight : 0;
        const captureFrames = function captureSingleFrame () {
            const framesLeft = pendingFrames - 1;

            if (savedRenderingContexts.length) {
                context.putImageData(savedRenderingContexts[numFrames - pendingFrames], 0, 0);

                finishCapture();
            } else {
                drawVideo();
            }

            function drawVideo () {
                try {
                    // Makes sure the canvas video heights/widths are in bounds
                    if (sourceWidth > videoWidth) {
                        sourceWidth = videoWidth;
                    }

                    if (sourceHeight > videoHeight) {
                        sourceHeight = videoHeight;
                    }

                    if (sourceX < 0) {
                        sourceX = 0;
                    }

                    if (sourceY < 0) {
                        sourceY = 0;
                    }

                    context.filter = filter;

                    context.drawImage(videoElement, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, gifWidth, gifHeight);

                    finishCapture();
                } catch (e) {
                    // There is a Firefox bug that sometimes throws NS_ERROR_NOT_AVAILABLE and
                    // and IndexSizeError errors when drawing a video element to the canvas
                    if (e.name === 'NS_ERROR_NOT_AVAILABLE') {
                        // Wait 100ms before trying again
                        utils.requestTimeout(drawVideo, 100);
                    } else {
                        throw e;
                    }
                }
            }

          function finishCapture () {
              let imageData;

              if (saveRenderingContexts) {
                  renderingContextsToSave.push(context.getImageData(0, 0, gifWidth, gifHeight));
              }

              // If there is text to display, make sure to display it on the canvas after the image is drawn
              if (text) {
                  context.font = font;
                  context.fillStyle = fontColor;
                  context.textAlign = textAlign;
                  context.textBaseline = textBaseline;
                  context.fillText(text, textXCoordinate, textYCoordinate);
              }

              imageData = context.getImageData(0, 0, gifWidth, gifHeight);

              ag.addFrameImageData(imageData);

              pendingFrames = framesLeft;

              // Call back with an r value indicating how far along we are in capture
              progressCallback((numFrames - pendingFrames) / numFrames);

              if (framesLeft > 0) {
                // test
                  utils.requestTimeout(captureSingleFrame, waitBetweenFrames);
              }

              if (!pendingFrames) {
                  ag.getBase64GIF((image) => {
                      callback({
                        'error': false,
                        'errorCode': '',
                        'errorMsg': '',
                        'image': image,
                        'cameraStream': cameraStream,
                        'videoElement': videoElement,
                        'webcamVideoElement': webcamVideoElement,
                        'savedRenderingContexts': renderingContextsToSave,
                        'keepCameraOn': keepCameraOn
                      });
                  });
              }
          }
      };

      numFrames = numFrames !== undefined ? numFrames : 10;
      interval = interval !== undefined ? interval : 0.1; // In seconds

      canvas.width = gifWidth;
      canvas.height = gifHeight;
      context = canvas.getContext('2d');

      (function capture() {
          if (!savedRenderingContexts.length && videoElement.currentTime === 0) {
              utils.requestTimeout(capture, 100);

              return;
          }

          captureFrames();
      }());
    },
    getCropDimensions: (obj = {}) => {
        const width = obj.videoWidth;
        const height = obj.videoHeight;
        const gifWidth = obj.gifWidth;
        const gifHeight = obj.gifHeight;
        const result = {
            width: 0,
            height: 0,
            scaledWidth: 0,
            scaledHeight: 0
        };

        if (width > height) {
            result.width = Math.round(width * (gifHeight / height)) - gifWidth;
            result.scaledWidth = Math.round(result.width * (height / gifHeight));
        } else {
            result.height = Math.round(height * (gifWidth / width)) - gifHeight;
            result.scaledHeight = Math.round(result.height * (width / gifWidth));
        }

        return result;
    }
};

export default screenShot;
