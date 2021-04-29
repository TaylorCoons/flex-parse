import { lex, stripStartEnd } from '../src/parser/lexer'
import { Symbol, SymbolType } from '../src/parser/symbols'
import { operations, OperationType, Operation } from '../src/parser/operations'
import { GroupingType } from '../src/parser/groupings'

function wrapStartEnd(symbols: Symbol[]): Symbol[] {
    return [
        {
            type: SymbolType.START,
            value: undefined,
            length: 0
        },
        ...symbols,
        {
            type: SymbolType.END,
            value: undefined,
            length: 0,
        }
    ]
}
describe('stripStartEnd', () => {
    test('Removes start and end', () => {
        expect(stripStartEnd([
            {
                type: SymbolType.START,
                value: undefined,
                length: 0
            },
            {
                type: SymbolType.NUMBER,
                value: 7,
                length: 1
            },
            {
                type: SymbolType.END,
                value: undefined,
                length: 0
            }
        ])).toStrictEqual([
            {
                type: SymbolType.NUMBER,
                value: 7,
                length: 1
            }
        ])
    })
})

describe('Lex tests', () => {
    const addOp = operations.find(op => op.type === OperationType.ADD) as Operation
    const subtractOp = operations.find(op => op.type === OperationType.SUBTRACT) as Operation
    const negateOp = operations.find(op => op.type === OperationType.NEGATE) as Operation
    const multiplyOp = operations.find(op => op.type === OperationType.MULTIPLY) as Operation
    const divideOp = operations.find(op => op.type === OperationType.DIVIDE) as Operation
    test('single ops', () => {
        expect(lex('+')[1]).toStrictEqual({
            type: SymbolType.OPERATION,
            value: addOp,
            length: 1
        })
        expect(lex('-')[1]).toStrictEqual({
            type: SymbolType.OPERATION,
            value: negateOp,
            length: 1
        })
        expect(lex('8-7')[2]).toStrictEqual({
            type: SymbolType.OPERATION,
            value: subtractOp,
            length: 1
        })
        expect(lex('*')[1]).toStrictEqual({
            type: SymbolType.OPERATION,
            value: multiplyOp,
            length: 1
        })
        expect(lex('/')[1]).toStrictEqual({
            type: SymbolType.OPERATION,
            value: divideOp,
            length: 1
        })
    })
    test('numbers', () => {
        expect(lex('0')[1]).toStrictEqual({
            type: SymbolType.NUMBER,
            value: 0,
            length: 1
        })
        expect(lex('1')[1]).toStrictEqual({
            type: SymbolType.NUMBER,
            value: 1,
            length: 1
        })
        expect(lex('12')[1]).toStrictEqual({
            type: SymbolType.NUMBER,
            value: 12,
            length: 2
        })
        expect(lex('909')[1]).toStrictEqual({
            type: SymbolType.NUMBER,
            value: 909,
            length: 3
        })
        expect(lex('001')[1]).toStrictEqual({
            type: SymbolType.NUMBER,
            value: 1,
            length: 3
        })
    })
    test('Compound expressions', () => {
        expect(lex('7+9')).toStrictEqual(wrapStartEnd([
            {
                type: SymbolType.NUMBER,
                value: 7,
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: addOp,
                length: 1
            },
            {
                type: SymbolType.NUMBER,
                value: 9,
                length: 1
            }
        ]))
        expect(lex('7-9')).toStrictEqual(wrapStartEnd([
            {
                type: SymbolType.NUMBER,
                value: 7,
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: subtractOp,
                length: 1
            },
            {
                type: SymbolType.NUMBER,
                value: 9,
                length: 1
            }
        ]))
        expect(lex('7--9')).toStrictEqual(wrapStartEnd([
            {
                type: SymbolType.NUMBER,
                value: 7,
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: subtractOp,
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: negateOp,
                length: 1
            },
            {
                type: SymbolType.NUMBER,
                value: 9,
                length: 1
            }
        ]))
        expect(lex('-7--9')).toStrictEqual(wrapStartEnd([
            {
                type: SymbolType.OPERATION,
                value: negateOp,
                length: 1
            },
            {
                type: SymbolType.NUMBER,
                value: 7,
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: subtractOp,
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: negateOp,
                length: 1
            },
            {
                type: SymbolType.NUMBER,
                value: 9,
                length: 1
            }
        ]))
    })
    test('Groupings', () => {
        expect(lex('()')).toStrictEqual(wrapStartEnd([
            {
                type: SymbolType.GROUPING,
                value: {
                    startSyntax: '(',
                    endSyntax: ')',
                    type: GroupingType.START
                },
                length: 1
            },
            {
                type: SymbolType.GROUPING,
                value: {
                    startSyntax: '(',
                    endSyntax: ')',
                    type: GroupingType.END
                },
                length: 1
            },
        ]))
    })
    test('Complex cases', () => {
        expect(lex('(4--5)--(6*-5)')).toStrictEqual(wrapStartEnd([
            {
                type: SymbolType.GROUPING,
                value: {
                    startSyntax: '(',
                    endSyntax: ')',
                    type: GroupingType.START
                },
                length: 1
            },
            {
                type: SymbolType.NUMBER,
                value: 4,
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: subtractOp,
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: negateOp,
                length: 1
            },
            {
                type: SymbolType.NUMBER,
                value: 5,
                length: 1
            },
            {
                type: SymbolType.GROUPING,
                value: {
                    startSyntax: '(',
                    endSyntax: ')',
                    type: GroupingType.END
                },
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: subtractOp,
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: negateOp,
                length: 1
            },
            {
                type: SymbolType.GROUPING,
                value: {
                    startSyntax: '(',
                    endSyntax: ')',
                    type: GroupingType.START
                },
                length: 1
            },
            {
                type: SymbolType.NUMBER,
                value: 6,
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: multiplyOp,
                length: 1
            },
            {
                type: SymbolType.OPERATION,
                value: negateOp,
                length: 1
            },
            {
                type: SymbolType.NUMBER,
                value: 5,
                length: 1
            },
            {
                type: SymbolType.GROUPING,
                value: {
                    startSyntax: '(',
                    endSyntax: ')',
                    type: GroupingType.END
                },
                length: 1
            }
        ]))
    })
})