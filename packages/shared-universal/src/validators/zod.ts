import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { z } from 'zod';

import type { Language } from '../interfaces/language.interface';
import { stripHTML } from '../utils/string.util';

export const baseValidator = {
  userName: stringSchema({
    min: 1,
    max: 50,
    required: true,
    minMessage: 'validator_minimum_n_characters_allowed',
    maxMessage: 'validator_maximum_n_characters_allowed',
    requiredMessage: 'validator_user_name',
  }),
  email: stringSchema({
    min: 1,
    max: 320,
    minMessage: 'validator_minimum_n_characters_allowed',
    maxMessage: 'validator_maximum_n_characters_allowed',
    requiredMessage: 'validator_email',
  }).email('validator_email_invalid'),
  password: passwordSchema({
    min: 8,
    max: 50,
  }),
  confirmPassword: passwordSchema({
    min: 8,
    max: 50,
  }),
  phoneNumber: phoneNumberSchema(),
};

interface StringValidatorOptions {
  min?: number;
  max?: number;
  required?: boolean;
  minMessage?: string;
  maxMessage?: string;
  requiredMessage?: string;
}

interface PasswordValidatorOptions extends StringValidatorOptions {
  pattern?: RegExp;
  patternMessage?: string;
}

interface PhoneNumberValidatorOptions {
  invalidMessage?: string;
}

type CreateLocalizedFieldParams = {
  min?: number;
  max?: number;
  required?: boolean;
  requiredMessage?: string;
  maxMessage?: string;
  minMessage?: string;
  defaultRequiredMessage?: string;
};

export function stringSchema(options: Partial<StringValidatorOptions> = {}) {
  const {
    min,
    max,
    required = false,
    minMessage = 'validator_minimum_n_characters_allowed',
    maxMessage = 'validator_maximum_n_characters_allowed',
    requiredMessage = 'validator_required',
  } = options;

  let schema = z.string();

  if (required) {
    schema = schema.min(min ?? 1, requiredMessage);
  }

  if (min !== undefined) {
    schema = schema.min(min, minMessage);
  }

  if (max !== undefined) {
    schema = schema.max(max, maxMessage);
  }

  return schema;
}

export function phoneNumberSchema(options: Partial<PhoneNumberValidatorOptions> = {}) {
  const { invalidMessage = 'validator_phone_number_invalid' } = options;

  return z.string().refine(
    (value: string) => {
      try {
        const phoneNumber = parsePhoneNumberFromString(value);
        return phoneNumber?.isValid();
      } catch (error) {
        return false;
      }
    },
    {
      message: invalidMessage,
    },
  );
}

export function passwordSchema(options: Partial<PasswordValidatorOptions> = {}) {
  const {
    min,
    max,
    required = false,
    pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
    minMessage = 'validator_minimum_n_characters_allowed',
    maxMessage = 'validator_maximum_n_characters_allowed',
    requiredMessage = 'validator_required',
    patternMessage = 'validator_password_rule',
  } = options;

  let schema = z.string();

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (pattern !== undefined) {
    schema = schema.regex(pattern, patternMessage);
  }

  if (required) {
    schema = schema.min(min ?? 1, requiredMessage);
  }

  if (min !== undefined) {
    schema = schema.min(min, minMessage);
  }

  if (max !== undefined) {
    schema = schema.max(max, maxMessage);
  }

  return schema;
}

export const createLocalizedField =
  (language: Language) =>
  ({
    min,
    max,
    required = false,
    minMessage = 'validator_minimum_n_characters_allowed',
    maxMessage = 'validator_maximum_n_characters_allowed',
    defaultRequiredMessage = 'validator_default_language_required',
  }: CreateLocalizedFieldParams = {}) => {
    const schema = z.array(z.object({ lang: z.string(), value: z.string() }));

    return schema
      .refine(
        data => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!required && (!data || data.length === 0)) return true;

          const defaultTranslationValue = data.find(item => item.lang === language.code)?.value;
          return Boolean(defaultTranslationValue && stripHTML(defaultTranslationValue).trim().length > 0);
        },
        { message: defaultRequiredMessage },
      )
      .refine(
        data => {
          if (typeof min === 'undefined') return true;
          return data.every(item => stripHTML(item.value).trim().length >= min);
        },
        {
          message: minMessage,
        },
      )
      .refine(
        data => {
          if (typeof max === 'undefined') return true;
          return data.every(item => stripHTML(item.value).trim().length <= max);
        },
        {
          message: maxMessage,
        },
      );
  };
