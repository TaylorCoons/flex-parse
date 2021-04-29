import { Symbol, SymbolType } from './symbols'
import { groupings } from './groupings'

export enum OperationType {
    MULTIPLY,
    DIVIDE,
    ADD,
    SUBTRACT,
    NEGATE,
    EXPONENTIATE,
    FACTORIAL
}
export enum Associativity {
    LEFT,
    RIGHT,
    NONE
}
export enum Notation {
    POSTFIX,
    INFIX,
    PREFIX
}
export type Operation = UnaryOperation | BinaryOperation
export interface UnaryOperation {
    name: string;
    type: OperationType;
    syntax: string;
    previousSymbols?: Symbol[];
    precedence: number;
    arity: 1;
    notation: Notation;
    func: (...args: number[]) => number;
}
export interface BinaryOperation {
    name: string;
    type: OperationType;
    syntax: string;
    previousSymbols?: Symbol[];
    precedence: number;
    arity: number;
    associativity: Associativity;
    notation: Notation.INFIX;
    func: (...args: number[]) => number;
}

export const operations: Operation[] = [
    {
        name: 'add',
        type: OperationType.ADD,
        syntax: '+',
        precedence: 0,
        arity: 2,
        associativity: Associativity.LEFT,
        notation: Notation.INFIX,
        func: (x, y) => x + y
    },
    {
        name: 'subtract',
        type: OperationType.SUBTRACT,
        syntax: '-',
        previousSymbols: [
            {
                type: SymbolType.NUMBER,
                value: 0,
                length: 0
            },
            {
                type: SymbolType.GROUPING,
                value: groupings[0],
                length: 0
            }
        ],
        precedence: 0,
        arity: 2,
        associativity: Associativity.LEFT,
        notation: Notation.INFIX,
        func: (x, y) => x - y
    },
    {
        name: 'negation',
        type: OperationType.NEGATE,
        syntax: '-',
        precedence: 0,
        arity: 1,
        notation: Notation.PREFIX,
        func: (x) => -x
    },
    {
        name: 'multiply',
        type: OperationType.MULTIPLY,
        syntax: '*',
        precedence: 1,
        arity: 2,
        associativity: Associativity.LEFT,
        notation: Notation.INFIX,
        func: (x, y) => x * y
    },
    {
        name: 'divide',
        type: OperationType.DIVIDE,
        syntax: '/',
        precedence: 1,
        arity: 2,
        associativity: Associativity.LEFT,
        notation: Notation.INFIX,
        func: (x, y) => x / y
    },
    {
        name: 'exponential',
        type: OperationType.EXPONENTIATE,
        syntax: '^',
        precedence: 2,
        arity: 2,
        associativity: Associativity.RIGHT,
        notation: Notation.INFIX,
        func: (x, y) => Math.pow(x, y)
    },
    {
        name: 'factorial',
        type: OperationType.FACTORIAL,
        syntax: '!',
        precedence: 3,
        arity: 1,
        notation: Notation.POSTFIX,
        func: function exp(x): number {
            if (x < 0) {
                throw new Error('Negative factorial not allowed')
            }
            if (x === 0) {
                return 1
            }
            if (x === 1) {
                return 1
            }
            return x * exp(x - 1)
        }
    }
]