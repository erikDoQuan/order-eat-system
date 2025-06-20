import React from 'react';

import { cn } from '../../lib/utils';

interface IBlockProps extends React.InputHTMLAttributes<HTMLDivElement> {
  visibled?: boolean;
}

const Block = React.forwardRef<HTMLDivElement, IBlockProps>(({ className, visibled = true, ...props }, ref) => {
  if (!visibled) return null;

  return (
    <div ref={ref} className={cn(className)}>
      {props.children}
    </div>
  );
});

Block.displayName = 'Block';

export { Block };
