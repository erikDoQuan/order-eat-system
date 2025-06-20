import type { UnprivilegedEditor } from 'react-quill';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';

import { cn } from '../../lib/utils';

interface IQuillEditorProps {
  value: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  modules?: Record<string, unknown>;
  formats?: string[];
  onChange: (value: string, editor?: UnprivilegedEditor) => void;
  onFocus?: () => void;
  onBlur?: (editor: UnprivilegedEditor) => void;
}

const DEFAULT_MODULES = {
  toolbar: [[{ list: 'ordered' }, { list: 'bullet' }, 'bold', 'italic', 'underline', 'link']],
};

const DEFAULT_FORMATS: string[] = ['bold', 'italic', 'underline', 'list', 'bullet', 'link'];

const QuillEditor = forwardRef<ReactQuill, IQuillEditorProps>(
  (
    {
      value = '',
      disabled = false,
      readOnly = false,
      placeholder = 'Type something...',
      className = '',
      modules = DEFAULT_MODULES,
      formats = DEFAULT_FORMATS,
      onChange,
      onFocus,
      onBlur,
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState<string>(value);
    const [quillInstance, setQuillInstance] = useState<any>(null);

    const handleChange = useCallback(
      (newValue: string, _delta: any, _source: any, editor: UnprivilegedEditor) => {
        const isEditorEmpty = editor.getText().trim().length === 0;
        const cleanValue = isEditorEmpty ? '' : newValue;

        setInternalValue(cleanValue);
        onChange(cleanValue, editor);
      },
      [onChange],
    );

    const handleFocus = useCallback(() => {
      onFocus?.();
    }, [onFocus]);

    const handleBlur = useCallback(
      (_previousRange: ReactQuill.Range, _source: any, editor: UnprivilegedEditor) => {
        const isEditorEmpty = editor.getText().trim().length === 0;

        if (isEditorEmpty && internalValue !== '') {
          setInternalValue('');
          onChange('', editor);
        }

        onBlur?.(editor);
      },
      [internalValue, onChange, onBlur],
    );

    useEffect(() => {
      if (typeof value === 'string') {
        setInternalValue(value);
      } else {
        setInternalValue('');
      }
    }, [value]);

    useEffect(() => {
      if (quillInstance) {
        const editor = quillInstance.getEditor();

        const blurHandler = () => {
          const unprivilegedEditor = quillInstance.makeUnprivilegedEditor(editor);
          handleBlur(null, null, unprivilegedEditor);
        };

        editor.root.addEventListener('blur', blurHandler);

        return () => {
          editor.root.removeEventListener('blur', blurHandler);
        };
      }
    }, [quillInstance, handleBlur]);

    return (
      <ReactQuill
        ref={el => {
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
          setQuillInstance(el);
        }}
        theme="snow"
        value={internalValue}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled || readOnly}
        className={cn('quill-simple', className)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
  },
);

QuillEditor.displayName = 'QuillEditor';

export { QuillEditor };
