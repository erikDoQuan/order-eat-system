import type { ChangeEvent, FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/shadcn/style.css';

import { cn } from '../../lib/utils';
import { Textarea } from '../ui/textarea';

type BlockEditorProps = {
  className?: string;
  value: string;
  onChange?: (text: string) => void;
};

const BlockEditor: FC<BlockEditorProps> = ({ className, value, onChange }) => {
  const [html, setHTML] = useState<string>(value ?? '');
  const instance = useCreateBlockNote();

  const convertHTMLToBlocks = useCallback(
    async (text: string) => {
      const blocks = await instance.tryParseHTMLToBlocks(text);

      instance.replaceBlocks(instance.document, blocks);
    },
    [instance],
  );

  const htmlInputChanged = useCallback(
    async (e: ChangeEvent<HTMLTextAreaElement>) => {
      setHTML(e.target.value);
      await convertHTMLToBlocks(e.target.value);
      onChange?.(e.target.value);
    },
    [convertHTMLToBlocks, onChange],
  );

  const handleEditorChange = useCallback(async () => {
    const htmlMarkup = await instance.blocksToHTMLLossy(instance.document);

    setHTML(htmlMarkup);
    onChange?.(htmlMarkup);
  }, [instance, onChange]);

  useEffect(() => {
    void convertHTMLToBlocks(html);
  }, [html, instance, convertHTMLToBlocks]);

  return (
    <div className={cn('block-editor', className)}>
      <code>
        <Textarea className="text-sm" value={html} onChange={htmlInputChanged} />
      </code>
      <BlockNoteView editor={instance} onChange={handleEditorChange} />
    </div>
  );
};

export default BlockEditor;
