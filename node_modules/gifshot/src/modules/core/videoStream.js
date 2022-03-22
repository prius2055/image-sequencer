/*
  videoStream.js
  ==============
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

// Dependencies
import utils from './utils';

const videoStream = {
    loadedData: false,
    defaultVideoDimensions: {
        width: 640,
        height: 480
    },
    findVideoSize: function findVideoSizeMethod(obj) {
        findVideoSizeMethod.attempts = findVideoSizeMethod.attempts || 0;

        const {
            cameraStream,
            completedCallback,
            videoElement
        } = obj;

        if (!videoElement) {
            return;
        }

        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
            videoElement.removeEventListener('loadeddata', videoStream.findVideoSize);

            completedCallback({
                videoElement: videoElement,
                cameraStream: cameraStream,
                videoWidth: videoElement.videoWidth,
                videoHeight: videoElement.videoHeight
            });
        } else {
            if (findVideoSizeMethod.attempts < 10) {
                findVideoSizeMethod.attempts += 1;

                utils.requestTimeout(function() {
                    videoStream.findVideoSize(obj);
                }, 400);
            } else {
                completedCallback({
                    videoElement: videoElement,
                    cameraStream: cameraStream,
                    videoWidth: videoStream.defaultVideoDimensions.width,
                    videoHeight: videoStream.defaultVideoDimensions.height
                });
            }
        }
    },
    onStreamingTimeout: (callback) => {
        if (utils.isFunction(callback)) {
            callback({
                error: true,
                errorCode: 'getUserMedia',
                errorMsg: 'There was an issue with the getUserMedia API - Timed out while trying to start streaming',
                image: null,
                cameraStream: {}
            });
        }
    },
    stream: (obj) => {
        const existingVideo = utils.isArray(obj.existingVideo) ? obj.existingVideo[0] : obj.existingVideo;
        const {
            cameraStream,
            completedCallback,
            streamedCallback,
            videoElement
        } = obj;

        if (utils.isFunction(streamedCallback)) {
            streamedCallback();
        }

        if (existingVideo) {
            if (utils.isString(existingVideo)) {
                videoElement.src = existingVideo;
                videoElement.innerHTML = (
                    '<source src="' + existingVideo + '" type="video/' + utils.getExtension(existingVideo) + '" />'
                );
            } else if (existingVideo instanceof Blob) {
                try {
                    videoElement.src = utils.URL.createObjectURL(existingVideo);
                } catch (e) {

                }

                videoElement.innerHTML = '<source src="' + existingVideo + '" type="' + existingVideo.type + '" />';
            }
        } else if (videoElement.mozSrcObject) {
            videoElement.mozSrcObject = cameraStream;
        } else if (utils.URL) {
            try {
                videoElement.srcObject = cameraStream;
                videoElement.src = utils.URL.createObjectURL(cameraStream);
            } catch (e) {
                videoElement.srcObject = cameraStream;
            }
        }

        videoElement.play();

        utils.requestTimeout(function checkLoadedData () {
            checkLoadedData.count = checkLoadedData.count || 0;

            if (videoStream.loadedData === true) {
                videoStream.findVideoSize({
                    videoElement,
                    cameraStream,
                    completedCallback
                });

                videoStream.loadedData = false;
            } else {
                checkLoadedData.count += 1;

                if (checkLoadedData.count > 10) {
                    videoStream.findVideoSize({
                        videoElement,
                        cameraStream,
                        completedCallback
                    });
                } else {
                    checkLoadedData();
                }
            }
        }, 0);
    },
    startStreaming: (obj) => {
        const errorCallback = utils.isFunction(obj.error) ? obj.error : utils.noop;
        const streamedCallback = utils.isFunction(obj.streamed) ? obj.streamed : utils.noop;
        const completedCallback = utils.isFunction(obj.completed) ? obj.completed : utils.noop;
        const {
            crossOrigin,
            existingVideo,
            lastCameraStream,
            options,
            webcamVideoElement
        } = obj;
        const videoElement = utils.isElement(existingVideo) ? existingVideo : webcamVideoElement ? webcamVideoElement : document.createElement('video');
        let cameraStream;

        if (crossOrigin) {
            videoElement.crossOrigin = options.crossOrigin;
        }

        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.addEventListener('loadeddata', (event) => {
            videoStream.loadedData = true;
            if (options.offset) {
              videoElement.currentTime = options.offset;
            }
        });

        if (existingVideo) {
            videoStream.stream({
                videoElement,
                existingVideo,
                completedCallback
            });
        } else if (lastCameraStream) {
            videoStream.stream({
                videoElement,
                cameraStream: lastCameraStream,
                streamedCallback,
                completedCallback
            });
        } else {
            utils.getUserMedia({
                video: true
            }, function(stream) {
                videoStream.stream({
                    videoElement: videoElement,
                    cameraStream: stream,
                    streamedCallback: streamedCallback,
                    completedCallback: completedCallback
                });
            }, errorCallback);
        }
    },
    startVideoStreaming: (callback, options = {}) => {
      const timeoutLength = options.timeout !== undefined ? options.timeout : 0;
      const originalCallback = options.callback;
      const webcamVideoElement = options.webcamVideoElement;
      let noGetUserMediaSupportTimeout;

      // Some browsers apparently have support for video streaming because of the
      // presence of the getUserMedia function, but then do not answer our
      // calls for streaming.
      // So we'll set up this timeout and if nothing happens after a while, we'll
      // conclude that there's no actual getUserMedia support.
      if (timeoutLength > 0) {
          noGetUserMediaSupportTimeout = utils.requestTimeout(() => {
              videoStream.onStreamingTimeout(originalCallback);
          }, 10000);
      }

      videoStream.startStreaming({
          error: () => {
              originalCallback({
                  error: true,
                  errorCode: 'getUserMedia',
                  errorMsg: 'There was an issue with the getUserMedia API - the user probably denied permission',
                  image: null,
                  cameraStream: {}
              });
          },
          streamed: () => {
              // The streaming started somehow, so we can assume there is getUserMedia support
              clearTimeout(noGetUserMediaSupportTimeout);
          },
          completed: (obj = {}) => {
              const {
                  cameraStream,
                  videoElement,
                  videoHeight,
                  videoWidth
              } = obj;

              callback({
                  cameraStream,
                  videoElement,
                  videoHeight,
                  videoWidth
              });
          },
          lastCameraStream: options.lastCameraStream,
          webcamVideoElement: webcamVideoElement,
          crossOrigin: options.crossOrigin,
          options: options
      });
    },
    stopVideoStreaming: (obj) => {
        obj = utils.isObject(obj) ? obj : {};

        const {
            keepCameraOn,
            videoElement,
            webcamVideoElement
        } = obj;
        const cameraStream = obj.cameraStream || {};
        const cameraStreamTracks = cameraStream.getTracks ? cameraStream.getTracks() || []: [];
        const hasCameraStreamTracks = !!cameraStreamTracks.length;
        const firstCameraStreamTrack = cameraStreamTracks[0];

        if (!keepCameraOn && hasCameraStreamTracks) {
            if (utils.isFunction(firstCameraStreamTrack.stop)) {
                // Stops the camera stream
                firstCameraStreamTrack.stop();
            }
        }

        if (utils.isElement(videoElement) && !webcamVideoElement) {
            // Pauses the video, revokes the object URL (freeing up memory), and remove the video element
            videoElement.pause();

            // Destroys the object url
            if (utils.isFunction(utils.URL.revokeObjectURL) && !utils.webWorkerError) {
                if (videoElement.src) {
                    utils.URL.revokeObjectURL(videoElement.src);
                }
            }

            // Removes the video element from the DOM
            utils.removeElement(videoElement);
        }
    }
};

export default videoStream;
