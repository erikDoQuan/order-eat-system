import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import ModalError from '@loyalty-system/react-web-ui-shadcn/components/modals/modal-error';
import { Button } from '@loyalty-system/react-web-ui-shadcn/components/ui/button';

const meta = {
  title: 'CUSTOM/ModalError',
  component: ModalError,
  parameters: {
    docs: {
      description: {
        component: 'A badge component for status, labels, and counts.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Title of the modal',
      table: {
        defaultValue: { summary: 'Critical Error' },
      },
    },
    btnClose: {
      control: 'text',
      description: 'Label of the close button',
      table: {
        defaultValue: { summary: 'Close' },
      },
    },
    message: {
      control: 'text',
      description: 'Content of the modal',
      table: {
        defaultValue: { summary: 'An unexpected error happened. Please try again later.' },
      },
    },
    visible: {
      control: 'boolean',
      description: 'Whether the modal is visible',
      table: {
        defaultValue: { detail: 'false', summary: 'false' },
      },
    },
    onClose: { action: 'closed' },
  },
} satisfies Meta<typeof ModalError>;

export default meta;

type Story = StoryObj<typeof meta>;

const ModalErrorBlock = (args: Partial<typeof ModalError>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Error Modal</Button>
      <ModalError
        {...args}
        title="Critical Error"
        visible={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: ModalErrorBlock,
  args: {
    onClose: () => {},
    title: 'Critical Error',
    message: 'An unexpected error happened. Please try again later.',
    btnClose: 'Dismiss',
    visible: true,
  },
} as unknown as Story;

export const CustomButtons: Story = {
  render: ModalErrorBlock,
  args: {
    title: 'Custom Error',
    message: 'An unexpected error happened. Please try again later.',
    btnClose: 'Close Error',
    visible: true,
  },
} as unknown as Story;

export const WithHTMLContent: Story = {
  render: ModalErrorBlock,
  args: {
    title: 'Terms & Conditions',
    message: (
      <div>
        <p>Please read the following terms and conditions carefully:</p>
        <ul>
          <li>You must be at least 18 years old to use this service.</li>
          <li>You agree to pay all fees associated with your account.</li>
          <li>You are responsible for any unauthorized use of your account.</li>
        </ul>
      </div>
    ),
    btnClose: 'Close',
  },
} as unknown as Story;
