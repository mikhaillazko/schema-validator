import {get, has, isEmpty, set} from 'lodash'
import {partial} from 'lodash/function'
import {iterateObjByRules} from "./iterator";


/**
 *  Return an error object with list of error messages for each field specified in the rules
 * @param {Object} fieldsRules - example: { header: [required()], description: [maxLength(100)]}
 * @param {Context | null} _context - look at Context
 * @param {Object} obj - Domain object example {header: '', description: 'correct val length'}
 * @param {string | null} fieldName - Field name which we want to validate and skip other
 * @returns {boolean} - Return false if error exists
 */
export function isValidObject(fieldsRules, _context, obj, fieldName = null) {
    let isValid = true
    for (let {value, context, rule} of iterateObjByRules(fieldsRules, obj, _context, fieldName)) {
        isValid = rule.validator({value, context})
        if (!isValid) break
    }
    return isValid
}

export function createValidator(fieldsRules) {
    return partial(isValidObject, fieldsRules, null)
}

/**
 *  Return an error object with list of error messages for each field specified in the rules
 * @param {Object} fieldsRules - example: { header: [required()], description: [maxLength(100)]}
 * @param {Context | null} _context - look at Context
 * @param {Object} obj - Domain object example {header: '', description: 'correct val length'}
 * @param {string | null} fieldName - Field name which we want to validate and skip other
 * @returns {Object} - Empty error object if all fields is valid otherwise { header: ['Missing required']}
 */
export function collectObjectErrors(fieldsRules, _context, obj, fieldName = null) {
    let errorResult = {}
    for (let {value, context, rule} of iterateObjByRules(fieldsRules, obj, _context, fieldName)) {
        let errors = get(errorResult, context.path, [])

        const isValid = rule.validator({value, context})
        const errorMessage = !isValid ? rule.getErrorMessage({value}) : ''
        if (!isEmpty(errorMessage)) errors.push(errorMessage)
        set(errorResult, context.path, errors)

        if (rule.collectError) {
            const childErrors = rule.collectError({value, context})
            set(errorResult, context.path, childErrors)
        }
    }
    return errorResult
}

/**
 *  Clear error messages for an error object on specific fields
 * @param {Object} error - example { header: ['Missing required', 'Too long'], description: ['Too long']}
 * @param fields - example ['header']
 *  Output side effect: error -> { header: [], description: ['Too long']}
 */
export function clearObjectErrors(error, fields) {
    if (!isEmpty(error)) for (let fieldName of fields) if (has(error, fieldName)) set(error, fieldName, [])
}

export function createCollector(fieldsRules) {
    return partial(collectObjectErrors, fieldsRules, null)
}
