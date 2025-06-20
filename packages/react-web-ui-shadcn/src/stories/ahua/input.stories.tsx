/*
 * @Author: <Tin Tran> (tindl88@gmail.com)
 * @Created: 2025-01-03 17:07:14
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Input } from '@loyalty-system/react-web-ui-shadcn/components/ahua/input';

const meta = {
  title: 'Ahua/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component: 'A customizable input component with different states, sizes, and label support.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
      description: 'The size of the input field',
    },
    label: {
      control: 'text',
      description: 'Label text for the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    error: {
      control: 'boolean',
      description: 'Whether the input is in error state',
    },
    value: {
      control: 'text',
      description: 'Type of the input field',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof Input>;

const InputTemplate = (args: React.ComponentProps<typeof Input>) => {
  const [value, setValue] = useState('');

  return (
    <div className="w-[500px]">
      <Input {...args} value={value} onChange={e => setValue(e.target.value)} />
    </div>
  );
};

// Default Input
export const Default: Story = {
  render: InputTemplate,
  args: {
    placeholder: 'Enter text here...',
  },
};

// Input with Label
export const WithLabel: Story = {
  render: InputTemplate,
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    required: true,
  },
};
