import {
    createCollector,
    createValidator,
    defined,
    dependOn,
    itemRules,
    maxLength,
    minLength,
    required,
} from '../src'


const answerRule = {
    id: [required()],
    text: [
        dependOn(({ parent }) => {
            return parent.isText ? required() : null
        }),
    ],
    image: [
        dependOn(({ parent }) => {
            return !parent.isText ? required() : null
        }),
    ],
}
const questionRule = {
    id: [required()],
    text: [required(), maxLength(500)],
    answers: [minLength(2), itemRules(answerRule)],
    isText: [],
}
const rules = {
    cover: {
        header: [required(), minLength(2), maxLength(400)],
    },
    questions: [minLength(1), maxLength(3), itemRules(questionRule)],
}

it('test isValidObject when rule incorrect then expect error with path', () => {
    const rules = {
        field1: [],
        field2: {
            field21: [],
            field22: {
                field221: [],
            },
        },
        field3: {
            field31: [],
            field32: {},
            field34: undefined,
        },
    }
    const validObject = {}
    const validator = createValidator(rules)
    // Assert
    expect(() => {
        // Act
        validator(validObject)
    }).toThrow('Field value by path "field3.field32" has incorrect value should be array with rules')
})

test.each([
    ['defined field missing', { field1: [defined()] }, {}, false],
    ['defined field has', { field1: [defined()] }, { field1: '' }, true],
    ['required field is missing', { field1: [required()] }, {}, false],
    ['required field is empty', { field1: [required()] }, { field1: '' }, false],
    ['required field has value', { field1: [required()] }, { field1: 'valueExists' }, true],
    ['max length of char field is exceeded', { field1: [maxLength(5)] }, { field1: '123456' }, false],
    ['max length of char field is exceeded', { field1: [maxLength(5)] }, { field1: '12345' }, true],
    ['max length of list field is exceeded', { field1: [maxLength(5)] }, { field1: [1, 2, 3, 4, 5] }, true],
    ['min length of field value is exceeded', { field1: [minLength(1)] }, { field1: '' }, false],
    ['min length of char field is exceeded', { field1: [minLength(1)] }, { field1: '1' }, true],
    ['min length of list field is exceeded', { field1: [minLength(1)] }, { field1: [1, 2] }, true],
    [
        'itemRules for each list item',
        { listField: [itemRules({ childField: [required()] })] },
        { listField: [{ childField: 'value1' }, { childField: 'value2' }] },
        true,
    ],
    [
        'itemRules for each list item',
        { listField: [itemRules({ childField: [required()] })] },
        { listField: [{ childField: '' }, { childField: 'value2' }] },
        false,
    ],
    [
        'dependOn case when field is required and value filled',
        { field: [dependOn(({ self }) => (self.isText ? required() : null))] },
        { isText: true, field: 'value' },
        true,
    ],
    [
        'dependOn case when field is required but value is empty',
        { field: [dependOn(({ self }) => (self.isText ? required() : null))] },
        { isText: true, field: '' },
        false,
    ],
    [
        'dependOn case when field is not required and value is empty',
        { field: [dependOn(({ self }) => (self.isText ? required() : null))] },
        { isText: false, field: '' },
        true,
    ],
    [
        'dependOn case when field is required but value is empty',
        {
            rootField: {
                parentField: {
                    selfField: [
                        dependOn(({ root, parent, self }) =>
                            root.rootIsText && parent.parentIsText && self.selfIsText ? required() : null,
                        ),
                    ],
                },
            },
        },
        {
            rootIsText: true,
            rootField: {
                parentIsText: true,
                parentField: {
                    selfIsText: true,
                    selfField: '',
                },
            },
        },
        false,
    ],
    [
        'dependOn case when field is not required and value is empty',
        {
            rootField: {
                parentField: {
                    selfField: [
                        dependOn(({ root, parent, self }) =>
                            root.rootIsText && parent.parentIsText && self.selfIsText ? required() : null,
                        ),
                    ],
                },
            },
        },
        {
            rootIsText: true,
            rootField: {
                parentIsText: true,
                parentField: {
                    selfIsText: false,
                    selfField: '',
                },
            },
        },
        true,
    ],
])('test %s isValidObject(%s, %s)', (name, rules, obj, expectedResult) => {
    const validator = createValidator(rules)
    // Act
    const isValid = validator(obj)
    // Assert
    expect(isValid).toBe(expectedResult)
})

it('test isValidObject generic case with all possible combination of fields and rules expect true', () => {
    const obj = {
        cover: {
            header: 'My header',
        },
        questions: [
            {
                id: 'qthdpd',
                text: 'first question',
                answers: [
                    {
                        id: 'uoegv1',
                        text: 'right',
                        image: '',
                    },
                    {
                        id: '8ycxyj',
                        text: 'wrong',
                        image: '',
                    },
                ],
                isText: true,
            },
            {
                id: 'vraozi',
                text: 'second question',
                answers: [
                    {
                        id: 'nbfm2j',
                        text: '',
                        image: 'https://any.s3.domen/4623473/media/5332899/45134/NORMAL',
                    },
                    {
                        id: 'cmwn2x',
                        text: '',
                        image: 'https://any.s3.domen/4623473/media/5332899/45133/NORMAL',
                    },
                ],
                isText: false,
            },
        ],
    }
    const validator = createValidator(rules)
    // Act
    const isValid = validator(obj)
    // Assert
    expect(isValid).toBe(true)
})

it('test isValidObject in case when part of object by special fieldName cover is valid and another part invalid expect true', () => {
    const rules = {
        cover: {
            header: [required(), minLength(2), maxLength(40)],
        },
        question: {
            id: [required()],
            text: [required(), maxLength(50)],
        },
    }
    const obj = {
        cover: {
            header: 'My header',
        },
        question: {
            id: '',
            text: '',
        },
    }
    const validator = createValidator(rules)
    // Act
    const isValid = validator(obj, 'cover')
    // Assert
    expect(isValid).toBe(true)
})

it('test collectObjectErrors generic case with all possible combination of fields and rules expect empty object', () => {
    const obj = {
        cover: {
            header: 'My header',
        },
        questions: [
            {
                id: 'qthdpd',
                text: 'first question',
                answers: [
                    {
                        id: 'uoegv1',
                        text: 'right',
                        image: '',
                    },
                    {
                        id: '8ycxyj',
                        text: 'wrong',
                        image: '',
                    },
                ],
                isText: true,
            },
            {
                id: 'vraozi',
                text: 'second question',
                answers: [
                    {
                        id: 'nbfm2j',
                        text: '',
                        image: 'https://any.s3.domen/4623473/media/5332899/45134/NORMAL',
                    },
                    {
                        id: 'cmwn2x',
                        text: '',
                        image: 'https://any.s3.domen/4623473/media/5332899/45133/NORMAL',
                    },
                ],
                isText: false,
            },
        ],
    }
    const collector = createCollector(rules)
    // Act
    const errorObj = collector(obj)
    // Assert
    expect(errorObj).toEqual({
        cover: {
            header: [],
        },
        questions: [
            {
                answers: [
                    {
                        id: [],
                        text: [],
                    },
                    {
                        id: [],
                        text: [],
                    },
                ],
                id: [],
                text: [],
            },
            {
                answers: [
                    {
                        id: [],
                        image: [],
                    },
                    {
                        id: [],
                        image: [],
                    },
                ],
                id: [],
                text: [],
            },
        ],
    })
})

it('test collectObjectErrors generic case with all possible combination of fields and rules expect error obj with same struct and message', () => {
    const obj = {
        cover: {
            header: '',
        },
        questions: [
            {
                id: 'id1',
                text: '',
                answers: [
                    {
                        id: '',
                        text: 'correct',
                        image: '',
                    },
                    {
                        id: 'id2',
                        text: 'wrong',
                        image: '',
                    },
                ],
                isText: true,
            },
            {
                id: 'id2',
                text: 'second question',
                answers: [
                    {
                        id: 'id3',
                        text: '',
                        image: 'https://any.s3.domen/4623473/media/5332899/45134/NORMAL',
                    },
                    {
                        id: 'id4',
                        text: '',
                        image: 'https://any.s3.domen/4623473/media/5332899/45133/NORMAL',
                    },
                ],
                isText: false,
            },
        ],
    }
    const collector = createCollector(rules)
    // Act
    const errorObj = collector(obj)
    // Assert
    expect(errorObj).toEqual({
        cover: { header: ['This field is required', 'Must be no less than 2 characters'] },
        questions: [
            {
                id: [],
                text: ['This field is required'],
                answers: [
                    {
                        id: ['This field is required'],
                        text: [],
                    },
                    {
                        id: [],
                        text: [],
                    },
                ],
            },
            {
                id: [],
                text: [],
                answers: [
                    {
                        id: [],
                        image: [],
                    },
                    {
                        id: [],
                        image: [],
                    },
                ],
            },
        ],
    })
})
