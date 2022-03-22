/*
  utils.js
  ========
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

const utils = {
    URL: (
        window.URL ||
        window.webkitURL ||
        window.mozURL ||
        window.msURL
    ),
    getUserMedia: (() => {
        const getUserMedia = (
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia
        );

        return (
            getUserMedia ? getUserMedia.bind(navigator) : getUserMedia
        );
    })(),
    requestAnimFrame: (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame
    ),
    requestTimeout: (callback, delay) => {
        callback = callback || utils.noop;
        delay = delay || 0;

        if (!utils.requestAnimFrame) {
            return setTimeout(callback, delay);
        }

        const start = new Date().getTime();
        let handle = new Object();
        const requestAnimFrame = utils.requestAnimFrame;

        const loop = () => {
            const current = new Date().getTime();
            const delta = current - start;

            delta >= delay ? callback.call() : handle.value = requestAnimFrame(loop);
        };

        handle.value = requestAnimFrame(loop);

        return handle;
    },
    Blob: (
        window.Blob ||
        window.BlobBuilder ||
        window.WebKitBlobBuilder ||
        window.MozBlobBuilder ||
        window.MSBlobBuilder
    ),
    btoa: (() => {
        let btoa = window.btoa || function (input) {
            let output = '';
            let i = 0;
            let l = input.length;
            let key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            let chr1;
            let chr2;
            let chr3;
            let enc1;
            let enc2;
            let enc3;
            let enc4;

            while (i < l) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = (
                    output +
                    key.charAt(enc1) +
                    key.charAt(enc2) +
                    key.charAt(enc3) +
                    key.charAt(enc4)
                );
            }

            return output;
        };

        return btoa ? btoa.bind(window) : utils.noop;
    })(),
    isObject: (obj) => {
        return (
            obj &&
            Object.prototype.toString.call(obj) === '[object Object]'
        );
    },
    isEmptyObject: (obj) => {
        return (
            utils.isObject(obj) &&
            !Object.keys(obj).length
        );
    },
    isArray: (arr) => {
        return (
            arr &&
            Array.isArray(arr)
        );
    },
    isFunction: (func) => {
        return (
            func &&
            typeof func === 'function'
        );
    },
    isElement: (elem) => {
        return (
            elem &&
            elem.nodeType === 1
        );
    },
    isString: (value) => {
        return (
            typeof value === 'string' ||
            Object.prototype.toString.call(value) === '[object String]'
        );
    },
    isSupported: {
        canvas: () => {
            var el = document.createElement('canvas');

            return (
                el &&
                el.getContext &&
                el.getContext('2d')
            );
        },
        webworkers: () => {
            return window.Worker;
        },
        blob: () => {
            return utils.Blob;
        },
        Uint8Array: () => {
            return window.Uint8Array;
        },
        Uint32Array: () => {
            return window.Uint32Array;
        },
        videoCodecs: (() => {
            const testEl = document.createElement('video');
            let supportObj = {
                'mp4': false,
                'h264': false,
                'ogv': false,
                'ogg': false,
                'webm': false
            };

            try {
                if (testEl && testEl.canPlayType) {
                  // Check for MPEG-4 support
                  supportObj.mp4 = testEl.canPlayType('video/mp4; codecs="mp4v.20.8"') !== '';

                  // Check for h264 support
                  supportObj.h264 = (testEl.canPlayType('video/mp4; codecs="avc1.42E01E"') ||
                    testEl.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) !== '';

                  // Check for Ogv support
                  supportObj.ogv = testEl.canPlayType('video/ogg; codecs="theora"') !== '';

                  // Check for Ogg support
                  supportObj.ogg = testEl.canPlayType('video/ogg; codecs="theora"') !== '';

                  // Check for Webm support
                  supportObj.webm = testEl.canPlayType('video/webm; codecs="vp8, vorbis"') !== -1;
                }
            } catch (e) {}

            return supportObj;
        })()
    },
    noop: () => {},
    each: (collection, callback) => {
        let x;
        let len;

        if (utils.isArray(collection)) {
            x = -1;
            len = collection.length;

            while (++x < len) {
                if (callback(x, collection[x]) === false) {
                    break;
                }
            }
        } else if (utils.isObject(collection)) {
            for (x in collection) {
                if (collection.hasOwnProperty(x)) {
                    if (callback(x, collection[x]) === false) {
                        break;
                    }
                }
            }
        }
    },
    mergeOptions: (defaultOptions, userOptions) => {
        if (!utils.isObject(defaultOptions) || !utils.isObject(userOptions) || !Object.keys) {
          return;
        }

        let newObj = {};

        utils.each(defaultOptions, (key, val) => {
            newObj[key] = defaultOptions[key];
        });

        utils.each(userOptions, (key, val) => {
            const currentUserOption = userOptions[key];

            if (!utils.isObject(currentUserOption)) {
                newObj[key] = currentUserOption;
            } else {
                if (!defaultOptions[key]) {
                    newObj[key] = currentUserOption;
                } else {
                    newObj[key] = utils.mergeOptions(defaultOptions[key], currentUserOption);
                }
            }
        });

        return newObj;
    },
    setCSSAttr: (elem, attr, val) => {
        if (!utils.isElement(elem)) {
            return;
        }

        if (utils.isString(attr) && utils.isString(val)) {
            elem.style[attr] = val;
        } else if (utils.isObject(attr)) {
            utils.each(attr, function(key, val) {
                elem.style[key] = val;
            });
        }
    },
    removeElement: (node) => {
        if (!utils.isElement(node)) {
            return;
        }
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    },
    createWebWorker: (content) => {
        if (!utils.isString(content)) {
            return {};
        }

        try {
            const blob = new utils.Blob([content], {
                'type': 'text/javascript'
            });
            const objectUrl = utils.URL.createObjectURL(blob);
            const worker = new Worker(objectUrl);

            return {
                'objectUrl': objectUrl,
                'worker': worker
            };
        } catch (e) {
          return '' + e;
        }
    },
    getExtension: (src) => {
        return src.substr(src.lastIndexOf('.') + 1, src.length);
    },
    getFontSize: (options = {}) => {
        if (!document.body || (options.resizeFont === false)) {
            return options.fontSize;
        }

        let text = options.text;
        let containerWidth = options.gifWidth;
        let fontSize = parseInt(options.fontSize, 10);
        let minFontSize = parseInt(options.minFontSize, 10);
        const div = document.createElement('div');
        const span = document.createElement('span');

        div.setAttribute('width', containerWidth);
        div.appendChild(span);

        span.innerHTML = text;
        span.style.fontSize = fontSize + 'px';
        span.style.textIndent = '-9999px';
        span.style.visibility = 'hidden';

        document.body.appendChild(span);

        while (span.offsetWidth > containerWidth && fontSize >= minFontSize) {
            span.style.fontSize = --fontSize + 'px';
        }

        document.body.removeChild(span);

        return fontSize + 'px';
    },
    webWorkerError: false
};

export default utils;
