/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/bold
 */

import { Plugin } from 'ckeditor5';

import FileManagerEditing from './file-managerediting';
import FileManagerUI from './file-managerui';

/**
 * The file manager feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FileManager extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [FileManagerEditing, FileManagerUI];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'FileManager';
  }
}
