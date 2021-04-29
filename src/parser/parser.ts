import { Symbol, SymbolType } from './symbols'
import { stripStartEnd } from './lexer'
import { operations, Associativity, Notation } from './operations'

export function parse(symbols: Symbol[]) {
    return parseRec(symbols, 0)
}

const highestPrecedence =  operations.reduce((highest, operation) => {
    const { precedence } = operation
    return highest < precedence ? precedence : highest
}, 0)

function parseRec(symbols: Symbol[], precedence: number): number {
    symbols = stripStartEnd(symbols)
    if (symbols.length === 1) {
        if (symbols[0].type === SymbolType.NUMBER) {
            return symbols[0].value
        }
        throw new Error(`Unexpected symbol: ${symbols[0]}`)
    }
    if (precedence > highestPrecedence) {
        throw new Error(`Unmatched symbols: ${symbols}`)
    }
    const ops = operations.filter((op) => {
        return op.precedence === precedence
    })
    for (const op of ops) {
        let symbolSet = [...symbols]
        if (op.arity === 2 && op.associativity === Associativity.LEFT) {
            symbolSet.reverse()
        }
        for (let symbolIndex = 0; symbolIndex < symbolSet.length; symbolIndex++) {
            const symbol = symbolSet[symbolIndex]
            if (symbol.type === SymbolType.OPERATION) {
                if (symbol.value.type === op.type) {
                    let lhs = [...symbolSet].splice(0, symbolIndex)
                    let rhs = [...symbolSet].splice(symbolIndex + 1)
                    if (op.arity === 2 && op.associativity === Associativity.LEFT) {
                        const temp = lhs
                        lhs = rhs
                        rhs = temp
                        lhs.reverse()
                        rhs.reverse()
                    }
                    switch (op.arity) {
                        case 1:
                            switch (op.notation) {
                                case Notation.POSTFIX:
                                    return op.func(parseRec(lhs, precedence))
                                case Notation.PREFIX:
                                    return op.func(parseRec(rhs, precedence))
                                default:
                                    throw new Error(`Invalid notation: ${op.notation} for a unary operation: ${op.name}`)
                            }
                        case 2:
                            return op.func(parseRec(lhs, precedence), parseRec(rhs, precedence))
                        default:
                            throw new Error(`Operation: ${op.name} has invalid arity: ${op.arity}`)
                    }
                }
            }
        }
    }
    return parseRec(symbols, precedence+1)
}