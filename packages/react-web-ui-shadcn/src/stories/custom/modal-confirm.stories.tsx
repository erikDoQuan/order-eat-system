/*
 * @Author: <Tin Tran> (tindl88@gmail.com)
 * @Created: 2025-01-03 14:53:29
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import ModalConfirm from '@loyalty-system/react-web-ui-shadcn/components/modals/modal-confirm';
import { Button } from '@loyalty-system/react-web-ui-shadcn/components/ui/button';

const meta = {
  title: 'CUSTOM/ModalConfirm',
  component: ModalConfirm,
  parameters: {
    docs: {
      description: {
        component: 'A confirmation modal component with customizable title, content, and action buttons.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the modal',
    },
    message: {
      control: 'text',
      description: 'The content/description of the modal',
    },
    btnYes: {
      control: 'text',
      description: 'Custom text for the confirm button',
    },
    btnNo: {
      control: 'text',
      description: 'Custom text for the cancel button',
    },
  },
} satisfies Meta<typeof ModalConfirm>;

export default meta;
type Story = StoryObj<typeof ModalConfirm>;

const ModalTemplate = (args: Partial<typeof ModalConfirm>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <ModalConfirm
        {...args}
        visible={isOpen}
        onYes={() => {
          setIsOpen(false);
        }}
        onNo={() => {
          setIsOpen(false);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: ModalTemplate,
  args: {
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
  },
} as unknown as Story;

export const CustomButtons: Story = {
  render: ModalTemplate,
  args: {
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item? This action cannot be undone.',
    btnYes: 'Delete',
    btnNo: 'Cancel',
    visible: true,
  },
} as unknown as Story;

export const WithHTMLContent: Story = {
  render: ModalTemplate,
  args: {
    title: 'Terms & Conditions',
    message: (
      <div>
        <p className="mb-2">By clicking accept, you agree to our terms and conditions:</p>
        <ul className="list-disc pl-4">
          <li>Term 1</li>
          <li>Term 2</li>
          <li>Term 3</li>
        </ul>
      </div>
    ),
    btnYes: 'Accept',
    btnNo: 'Decline',
  },
} as unknown as Story;
