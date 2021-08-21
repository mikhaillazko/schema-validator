import {get} from 'lodash'
import {hasValue, validateMaxLength, validateMinLength} from './validators'
import {Context} from "./iterator";
import {collectObjectErrors, isValidObject} from "./services";

/**
 * Abstraction for define rule and encapsulate behavior of validation and get error
 * @param {string} name is name of rule
 * @param {Function} getErrors is function with signature ({value}) should return error message as string
 * @param {Function} validator is function with signature ({value, context}) should return boolean
 * @param {Function | null} collectError is function with signature ({value, context}) should return error object or container
 * @constructor
 */
function FieldRule(name, getErrors, validator, collectError = null) {
    this.name = name
    this.getErrorMessage = getErrors
    this.validator = validator
    this.collectError = collectError
}

export function required() {
    return new FieldRule(
        'required',
        () => {
            return 'This field is required'
        },
        ({value}) => {
            return hasValue(value)
        },
    )
}

export function defined() {
    return new FieldRule(
        'defined',
        () => {
            return 'This field is undefined'
        },
        ({value, context}) => {
            return context.key in context.self && value !== undefined
        },
    )
}

export function maxLength(max) {
    return new FieldRule(
        'maxLength',
        () => {
            return `Must be no more than ${max} characters`
        },
        ({value}) => {
            return validateMaxLength(value, max)
        },
    )
}

export function minLength(min) {
    return new FieldRule(
        'minLength',
        () => {
            return `Must be no less than ${min} characters`
        },
        ({value}) => {
            return validateMinLength(value, min)
        },
    )
}

export function itemRules(fieldsRules, errorConverter = null) {
    return new FieldRule(
        'itemRules',
        () => '',
        ({value, context}) => {
            return value.every(item => isValidObject(fieldsRules, context, item))
        },
        ({value, context}) => {
            const errors = value.map((item, index) => {
                const _context = new Context(context, context.self)
                _context.path = context.path + `.[${index}]`
                _context.key = index
                let errorItem = collectObjectErrors(fieldsRules, _context, item)
                return get(errorItem, _context.path, {})
            })
            return errorConverter ? errorConverter(value, errors) : errors
        },
    )
}

/**
 *
 * @param {Function} ruleCallback function with signature {root, parent, self, key, value}
 * that should return FieldRule instance or null
 * @returns {Function}
 */
export function dependOn(ruleCallback) {
    return ruleCallback
}
