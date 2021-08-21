import {isEmpty, isString, isUndefined, isArrayLike} from 'lodash'

export function hasValue(value) {
    const _value = isString(value) ? value.trim() : value
    return !(isEmpty(_value) || isUndefined(_value))
}

export function validateMinLength(value, minLength) {
    return isArrayLike(value) && value.length >= minLength
}

export function validateMaxLength(value, maxLength) {
    return isArrayLike(value) && value.length <= maxLength
}