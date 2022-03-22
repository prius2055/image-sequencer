/*
  API.js
  ======
*/

/* Copyright  2017 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

// Dependencies
import * as utils from '../core/utils';
import * as error from '../core/error';
import * as defaultOptions from '../core/defaultOptions';
import isSupported from './isSupported';
import isWebCamGIFSupported from './isWebCamGIFSupported';
import isExistingImagesGIFSupported from './isExistingImagesGIFSupported';
import isExistingVideoGIFSupported from './isExistingVideoGIFSupported';
import createGIF from './createGIF';
import takeSnapShot from './takeSnapShot';
import stopVideoStreaming from './stopVideoStreaming';

export const API = {
  'utils': utils,
  'error': error,
  'defaultOptions': defaultOptions,
  'createGIF': createGIF,
  'takeSnapShot': takeSnapShot,
  'stopVideoStreaming': stopVideoStreaming,
  'isSupported': isSupported,
  'isWebCamGIFSupported': isWebCamGIFSupported,
  'isExistingVideoGIFSupported': isExistingVideoGIFSupported,
  'isExistingImagesGIFSupported': isExistingImagesGIFSupported,
  'VERSION': '0.4.5'
};
