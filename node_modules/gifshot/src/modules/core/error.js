/*
  error.js
  ========
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

// Dependencies
import utils from './utils';

const error = {
    validate: (skipObj) => {
        skipObj = utils.isObject(skipObj) ? skipObj : {};

        let errorObj = {};

        utils.each(error.validators, (indece, currentValidator) => {
            const errorCode = currentValidator.errorCode;

            if (!skipObj[errorCode] && !currentValidator.condition) {
                errorObj = currentValidator;
                errorObj.error = true;

                return false;
            }
        });

        delete errorObj.condition;

        return errorObj;
    },
    isValid: (skipObj) => {
        const errorObj = error.validate(skipObj);
        const isValid = errorObj.error !== true ? true : false;

        return isValid;
    },
    validators: [
        {
            condition: utils.isFunction(utils.getUserMedia),
            errorCode: 'getUserMedia',
            errorMsg: 'The getUserMedia API is not supported in your browser'
        },
        {
            condition: utils.isSupported.canvas(),
            errorCode: 'canvas',
            errorMsg: 'Canvas elements are not supported in your browser'
        },
        {
            condition: utils.isSupported.webworkers(),
            errorCode: 'webworkers',
            errorMsg: 'The Web Workers API is not supported in your browser'
        },
        {
            condition: utils.isFunction(utils.URL),
            errorCode: 'window.URL',
            errorMsg: 'The window.URL API is not supported in your browser'
        },
        {
            condition: utils.isSupported.blob(),
            errorCode: 'window.Blob',
            errorMsg: 'The window.Blob File API is not supported in your browser'
        },
        {
            condition: utils.isSupported.Uint8Array(),
            errorCode: 'window.Uint8Array',
            errorMsg: 'The window.Uint8Array function constructor is not supported in your browser'
        },
        {
            condition: utils.isSupported.Uint32Array(),
            errorCode: 'window.Uint32Array',
            errorMsg: 'The window.Uint32Array function constructor is not supported in your browser'
        }
    ],
    messages: {
        videoCodecs: {
            errorCode: 'videocodec',
            errorMsg: 'The video codec you are trying to use is not supported in your browser'
        }
    }
};

export default error;
