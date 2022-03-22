/*
  processFrameWorker.js
  =====================
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

import NeuQuant from '../dependencies/NeuQuant';

export default function workerCode () {
    const self = this;

    try {
        self.onmessage = function (ev) {
            var data = ev.data || {};
            var response;

            if (data.gifshot){
                response = workerMethods.run(data);
                postMessage(response);
            }
        };
    } catch (e) {};

    const workerMethods = {
        dataToRGB: function (data, width, height) {
            const length = width * height * 4;
            let i = 0;
            let rgb = [];

            while (i < length) {
                rgb.push(data[i++]);
                rgb.push(data[i++]);
                rgb.push(data[i++]);
                i++; // for the alpha channel which we don't care about
            }

            return rgb;
        },
        componentizedPaletteToArray: function (paletteRGB) {
            paletteRGB = paletteRGB || [];

            let paletteArray = [];

            for (let i = 0; i < paletteRGB.length; i += 3) {
                let r = paletteRGB[i];
                let g = paletteRGB[i + 1];
                let b = paletteRGB[i + 2];

                paletteArray.push(r << 16 | g << 8 | b);
            }

            return paletteArray;
        },
        // This is the "traditional" Animated_GIF style of going from RGBA to indexed color frames
        'processFrameWithQuantizer': function (imageData, width, height, sampleInterval) {
            let rgbComponents = this.dataToRGB(imageData, width, height);
            let nq = new NeuQuant(rgbComponents, rgbComponents.length, sampleInterval);
            let paletteRGB = nq.process();
            let paletteArray = new Uint32Array(this.componentizedPaletteToArray(paletteRGB));
            let numberPixels = width * height;
            let indexedPixels = new Uint8Array(numberPixels);
            let k = 0;

            for (let i = 0; i < numberPixels; i++) {
                let r = rgbComponents[k++];
                let g = rgbComponents[k++];
                let b = rgbComponents[k++];

                indexedPixels[i] = nq.map(r, g, b);
            }

            return {
                pixels: indexedPixels,
                palette: paletteArray
            };
        },
        'run': function (frame) {
            frame = frame || {};

            let {
                height,
                palette,
                sampleInterval,
                width
            } = frame;
            const imageData = frame.data;

            return this.processFrameWithQuantizer(imageData, width, height, sampleInterval);
        }
    };

    return workerMethods;
};
