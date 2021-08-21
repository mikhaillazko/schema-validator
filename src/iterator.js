import {isArray, isEmpty, isFunction, isPlainObject, get} from "lodash";


export function Context(context, obj) {
    if (context === null) {
        this.root = obj
        this.parent = null
        this.self = obj
        this.path = ''
        this.key = null
    } else {
        this.root = context.root
        this.parent = context.self
        this.self = obj
        this.path = context.path
        this.key = null
    }
}

export function* iterateObjByRules(ruleRoot, obj, _context = null, _fieldName = null) {
    for (const [fieldName, rules] of Object.entries(ruleRoot)) {
        let context = new Context(_context, obj)
        context.path = _context === null ? fieldName : context.path + '.' + fieldName
        context.key = fieldName

        let isInnerRule = isPlainObject(rules) && !isEmpty(rules)
        if (!isInnerRule && !isArray(rules))
            throw new Error(`Field value by path "${context.path}" has incorrect value should be array with rules`)

        if (_fieldName && _fieldName !== fieldName) continue

        const fieldValue = get(obj, fieldName, {})
        if (isInnerRule) {
            yield* iterateObjByRules(ruleRoot[fieldName], fieldValue, context)
        } else {
            for (const rule of rules) {
                let _rule = rule
                if (isFunction(rule)) {
                    // evaluate lazy rule
                    _rule = rule({ ...context, value: fieldValue })
                    if (_rule === null) continue
                }
                yield { value: fieldValue, context, rule: _rule }
            }
        }
    }
}
