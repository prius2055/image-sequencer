/*
  defaultOptions.js
  =================
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

// Helpers
const noop = () => {};

const defaultOptions = {
    sampleInterval: 10,
    numWorkers: 2,
    filter: '',
    gifWidth: 200,
    gifHeight: 200,
    interval: 0.1,
    numFrames: 10,
    frameDuration: 1,
    keepCameraOn: false,
    images: [],
    video: null,
    webcamVideoElement: null,
    cameraStream: null,
    text: '',
    fontWeight: 'normal',
    fontSize: '16px',
    minFontSize: '10px',
    resizeFont: false,
    fontFamily: 'sans-serif',
    fontColor: '#ffffff',
    textAlign: 'center',
    textBaseline: 'bottom',
    textXCoordinate: null,
    textYCoordinate: null,
    progressCallback: noop,
    completeCallback: noop,
    saveRenderingContexts: false,
    savedRenderingContexts: [],
    crossOrigin: 'Anonymous'
};

export default defaultOptions;
