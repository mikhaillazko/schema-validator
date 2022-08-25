# schema-validator
Library for validate schema and properties of js object

### Install 
`$ npm install @lazko/schema-validator`

### Example of usage:

```javascript
// Schema rules declaration
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

// Create validator
const validator = createValidator(rules)

//Using validator
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
const isValid = validator(obj)

```
