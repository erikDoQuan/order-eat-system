import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import Decimal from 'decimal.js';

@ValidatorConstraint({ async: false })
export class IsMultipleOfConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    if (typeof value !== 'number') {
      return false;
    }

    const [multipleOf] = args.constraints as number[];
    const decimalValue = new Decimal(value);
    const decimalMultipleOf = new Decimal(multipleOf);

    return decimalValue.mod(decimalMultipleOf).equals(0);
  }

  defaultMessage(args: ValidationArguments) {
    const [multipleOf] = args.constraints as number[];
    return `${args.property} must be a multiple of ${multipleOf}`;
  }
}

export function IsMultipleOf(multipleOf: number, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [multipleOf],
      validator: IsMultipleOfConstraint,
    });
  };
}
