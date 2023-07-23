import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsHexadecimalString', async: false })
export class IsHexadecimalStringConstraint implements ValidatorConstraintInterface {
    validate(value: string): boolean {
        if (typeof value !== 'string') {
            return false;
        }
        const parsedValue = parseInt(value, 16);
        return !isNaN(parsedValue);
    }

    defaultMessage({ property }) {
        return `${property} should be a hex string`;
    }
}

export function IsHexadecimalString(validationOptions?: ValidationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: 'IsHexadecimalString',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsHexadecimalStringConstraint,
        });
    };
}
