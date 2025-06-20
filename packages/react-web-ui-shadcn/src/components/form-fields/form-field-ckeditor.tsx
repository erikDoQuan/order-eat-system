import type { Editor } from 'ckeditor5';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { lazy, Suspense } from 'react';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Loading } from '../ui/loading';

const CKEditor = lazy(() => import('../editors/ck-editor'));

type FormFieldCKEditorFullProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  formLabel?: string;
  fieldName?: Path<T>;
  minLength?: number;
  maxLength?: number;
  editorRef?: React.MutableRefObject<Editor | null>;
  minHeight?: number;
  toolbar?: string[];
  disabled?: boolean;
  readOnly?: boolean;
  visibled?: boolean;
  translator?: any;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
};

export function FormFieldCKEditor<T extends FieldValues>({
  form,
  formLabel,
  fieldName,
  minLength = 1,
  maxLength = Infinity,
  editorRef,
  minHeight = 360,
  toolbar,
  visibled = true,
  disabled,
  readOnly,
  translator,
  setVisible,
}: FormFieldCKEditorFullProps<T>) {
  if (!visibled) return null;

  return (
    <FormField
      control={form.control}
      name={fieldName as Path<T>}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>{formLabel}</FormLabel>
          <FormControl>
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-3">
                  <Loading />
                </div>
              }
            >
              <CKEditor
                {...field}
                toolbar={toolbar}
                minHeight={minHeight}
                value={field.value}
                disabled={disabled}
                readOnly={readOnly}
                onChange={field.onChange}
                onFocus={editorRef ? (_event, editor) => (editorRef.current = editor) : undefined}
                onShowFileManager={() => setVisible?.(true)}
              />
            </Suspense>
          </FormControl>
          {error?.message && <FormMessage message={translator?.(error.message, { min: minLength, max: maxLength })} />}
        </FormItem>
      )}
    />
  );
}
