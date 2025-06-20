/*
 * @Author: <Tin Tran> (tindl88@gmail.com)
 * @Created: 2025-01-17 16:20:44
 */

import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'IsUUIDOrEmpty', async: false })
export class IsUUIDOrEmpty implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments) {
    if (value === '') return true; // Allow empty string

    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value); // Check UUID v4 format
  }

  defaultMessage(_args: ValidationArguments) {
    return 'The value must be a valid UUID or an empty string';
  }
}
