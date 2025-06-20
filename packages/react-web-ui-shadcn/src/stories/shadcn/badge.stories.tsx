import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from '@loyalty-system/react-web-ui-shadcn/components/ui/badge';

const meta = {
  title: 'Shadcn-UI/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: 'A badge component for status, labels, and counts.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'outline-primary'],
      description: 'Style variant of the badge',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const OutlinePrimary: Story = {
  args: {
    children: 'Outline Primary',
    variant: 'outline-primary',
  },
};

export const WithIcon: Story = {
  render: () => (
    <Badge>
      <span className="mr-1">●</span>
      Online
    </Badge>
  ),
};
