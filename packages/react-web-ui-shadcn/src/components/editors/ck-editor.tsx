import type { Editor, EditorConfig } from 'ckeditor5';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { CKEditor as MyEditor } from '@ckeditor/ckeditor5-react';
import {
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  GeneralHtmlSupport,
  Heading,
  HtmlEmbedEditing,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  PictureEditing,
  SourceEditing,
  Strikethrough,
  Table,
  TableToolbar,
  TextTransformation,
  Underline,
} from 'ckeditor5';

// CSS imports are moved to src/styles/index.ts
// import 'ckeditor5/ckeditor5.css';
// import './ck-editor.scss';

import { cn } from '../../lib/utils';
import FileManager from './file-manager/file-manager';
import LayoutManager from './layout-manager/layout-manager';

interface ICKEditorProps {
  className?: string;
  value: string;
  toolbar?: string[];
  minHeight?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  visibled?: boolean;
  onFocus?: (event: unknown, editor: Editor) => void;
  onBlur?: (event: unknown, editor: Editor) => void;
  onReady?: (editor: Editor) => void;
  onChange: (data: string) => void;
  onShowFileManager?: () => void;
}

export const DEFAULT_TOOLBAR = [
  'heading',
  'undo',
  'redo',
  '|',
  'bold',
  'italic',
  'underline',
  'strikethrough',
  '|',
  'alignment',
  'bulletedList',
  'numberedList',
  'outdent',
  'indent',
  'link',
  'blockQuote',
  'insertTable',
  'mediaEmbed',
  'fileManager',
  'insertLayout',
  'sourceEditing',
];

export const EDITOR_PLUGINS = [
  Essentials,
  Autoformat,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  BlockQuote,
  Heading,
  Image,
  ImageResize,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  PictureEditing,
  Table,
  TableToolbar,
  TextTransformation,
  Alignment,
  GeneralHtmlSupport,
  HtmlEmbedEditing,
  SourceEditing,
  FileManager,
  LayoutManager,
];

const IMAGE_TOOLBAR_CONFIG = [
  'imageStyle:alignLeft',
  'imageStyle:alignRight',
  '|',
  'imageStyle:alignBlockLeft',
  'imageStyle:alignCenter',
  'imageStyle:alignBlockRight',
  '|',
  'toggleImageCaption',
  'imageTextAlternative',
];

const EXTRA_PROVIDERS = [
  {
    name: 'awsS3video',
    url: /^https:\/\/([\w-]+)\.s3\.([\w-]+-\d+)\.amazonaws\.com\/([\w-]+\.mp4)/,
    html: (match: any) => {
      return (
        '<div style="position: relative; height: 0; padding-bottom: 56.2493%; pointer-events: auto;"><video controls style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" src="' +
        match.input +
        '"></video></div>'
      );
    },
  },
  {
    name: 'awsS3audio',
    url: /^https:\/\/([\w-]+)\.s3\.([\w-]+-\d+)\.amazonaws\.com\/([\w-]+\.mp3)/,
    html: (match: any) => {
      return '<div style="position: relative;pointer-events: auto;"><audio controls src="' + match.input + '"></audio></div>';
    },
  },
  {
    name: 'video',
    url: [/.*\.(mp4)$/],
    html: (match: any) =>
      '<div style="position: relative; height: 0; padding-bottom: 56.2493%; pointer-events: auto;"><video controls style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" src="' +
      match.input +
      '"></video></div>',
  },
  {
    name: 'audio',
    url: [/.*\.(mp3)$/],
    html: (match: any) => '<div style="position: relative;pointer-events: auto;"><audio controls src="' + match.input + '"></audio></div>',
  },
];

const HTML_SUPPORT = {
  allow: [
    {
      name: /.*/,
      attributes: true,
      classes: true,
      styles: true,
    },
  ],
  allowEmpty: ['div'],
};

const CKEditor = forwardRef<Editor, ICKEditorProps>(
  (
    {
      className,
      value = '',
      toolbar,
      minHeight,
      placeholder,
      visibled = true,
      disabled = false,
      readOnly = false,
      onReady,
      onFocus,
      onBlur,
      onChange,
      onShowFileManager,
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState<string>(value);
    const editorRef = useRef<Editor>();

    const handleReady = (editor: Editor) => {
      if (minHeight) {
        editor.editing.view.change(writer => {
          const root = editor.editing.view.document.getRoot();

          root && writer.setStyle('height', `${minHeight}px`, root);
        });
      }

      if (ref) {
        if (typeof ref === 'function') {
          ref(editor);
        } else {
          ref.current = editor;
        }
      }

      editorRef.current = editor;

      onReady?.(editor);
    };

    const handleFocus = (event: unknown, editor: Editor) => {
      if (disabled || readOnly) return;
      //TODO: check if this is needed
      // editor.editing.view.focus();
      onFocus?.(event, editor);
    };

    const handleChange = (event: unknown, editor: Editor) => {
      if (disabled || readOnly) return;

      onChange(editor.getData());
    };

    const handleShowFileManager = () => {
      if (disabled || readOnly) return;

      onShowFileManager?.();
    };

    useEffect(() => {
      if (!editorRef.current) return;

      if (disabled || readOnly) {
        editorRef.current.enableReadOnlyMode('locked');
      } else {
        editorRef.current.disableReadOnlyMode('locked');
      }
    }, [disabled, readOnly]);

    useEffect(() => {
      if (typeof value === 'string') {
        setInternalValue(value);
      } else {
        setInternalValue('');
      }
    }, [value]);

    if (!visibled) return null;

    return (
      <div className={cn('wysiwyg prose-sm', className)}>
        <MyEditor
          editor={ClassicEditor}
          disableWatchdog={true}
          disabled={disabled || readOnly}
          config={
            {
              toolbar: toolbar ?? DEFAULT_TOOLBAR,
              isReadOnly: disabled || readOnly,
              placeholder,
              plugins: EDITOR_PLUGINS,
              image: {
                toolbar: IMAGE_TOOLBAR_CONFIG,
                insert: {
                  type: 'inline',
                },
              },
              actions: { showFileManager: handleShowFileManager },
              htmlSupport: HTML_SUPPORT,
              mediaEmbed: {
                previewsInData: true,
                extraProviders: EXTRA_PROVIDERS,
              },
            } as EditorConfig
          }
          data={internalValue}
          onReady={handleReady}
          onFocus={handleFocus}
          onBlur={onBlur}
          onChange={handleChange}
        />
      </div>
    );
  },
);

CKEditor.displayName = 'CKEditor';

export default CKEditor;
