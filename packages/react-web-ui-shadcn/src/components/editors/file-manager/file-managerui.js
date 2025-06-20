/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { ButtonView, Plugin } from 'ckeditor5';

export default class FileManager extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'FileManagerUI';
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add('fileManager', locale => {
      const button = new ButtonView(locale);

      button.set({
        label: 'File Manager',

        tooltip: true,
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8 3C7.44772 3 7 3.44772 7 4V16C7 16.5523 7.44772 17 8 17H10.5858L16.5889 10.9969L16.5889 10.9968C17.2284 10.3575 18.0957 9.99825 19 9.99825C19.7228 9.99825 20.4219 10.2277 21 10.6463V4C21 3.44772 20.5523 3 20 3H8ZM23 12.999V4C23 2.34315 21.6569 1 20 1H8C6.34315 1 5 2.34315 5 4V16C5 17.6569 6.34315 19 8 19H10.999C10.9997 19 11.0003 19 11.001 19H20C21.6569 19 23 17.6569 23 16V13.001C23 13.0003 23 12.9997 23 12.999ZM21 13.4142L19.9969 12.4112C19.9969 12.4111 19.9969 12.4111 19.9969 12.4111C19.7325 12.1468 19.3739 11.9983 19 11.9983C18.6261 11.9983 18.2675 12.1468 18.0031 12.4111C18.0031 12.4111 18.0031 12.4111 18.0031 12.4112L13.4142 17H20C20.5523 17 21 16.5523 21 16V13.4142ZM2 5C2.55228 5 3 5.44772 3 6V20C3 20.2652 3.10536 20.5196 3.29289 20.7071C3.48043 20.8946 3.73478 21 4 21H18C18.5523 21 19 21.4477 19 22C19 22.5523 18.5523 23 18 23H4C3.20435 23 2.44129 22.6839 1.87868 22.1213C1.31607 21.5587 1 20.7957 1 20V6C1 5.44772 1.44772 5 2 5ZM12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7ZM9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8Z"/>
        </svg>`,
      });

      editor.on('change:isReadOnly', () => {
        const isEditable = !editor.isReadOnly;

        button.isEnabled = isEditable;
      });

      button.on('execute', () => {
        if (editor.isReadOnly) return;
        const { showFileManager } = editor.config.get('actions');

        if (showFileManager) {
          showFileManager(editor);
        }
      });

      this.listenTo(button, 'execute', () => {
        if (editor.isReadOnly) return;

        editor.editing.view.focus();
      });

      return button;
    });
  }
}
