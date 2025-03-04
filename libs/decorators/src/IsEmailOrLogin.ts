import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: false })
export class IsLoginOrEmailConstraint implements ValidatorConstraintInterface {
    validate(value: any) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const loginRegex = /^[a-zA-Z0-9_.-]+$/
        return (
            typeof value === 'string' &&
            (emailRegex.test(value) || loginRegex.test(value))
        )
    }

    defaultMessage() {
        return 'Значение должно быть либо email, либо логином (буквы, цифры, _ . -)'
    }
}

export function IsLoginOrEmail(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsLoginOrEmailConstraint,
        })
    }
}
