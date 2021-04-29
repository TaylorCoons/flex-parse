import { GroupingSymbol, Symbol, SymbolType } from './symbols'
import { stripStartEnd } from './lexer'
import { operations, Associativity, Notation } from './operations'
import { GroupingSentenal } from './groupings'

export function parse(symbols: Symbol[]) {
    return parseRec(symbols, 0)
}

const highestPrecedence =  operations.reduce((highest, operation) => {
    const { precedence } = operation
    return highest < precedence ? precedence : highest
}, 0)

function groupMatch(startSymbol: Symbol, endSymbol: Symbol): boolean {
    return (endSymbol.type === SymbolType.GROUPING 
        && startSymbol.type === SymbolType.GROUPING
        && startSymbol.value.type === endSymbol.value.type
        && startSymbol.value.sentenal === GroupingSentenal.START
        && endSymbol.value.sentenal === GroupingSentenal.END)
}

function stripGrouping(symbols: Symbol[]) {
    const startSymbol = symbols[0]
    const endSymbol = symbols[symbols.length - 1]
    const match = groupMatch(startSymbol, endSymbol)
    if (match) {
        return [...symbols.slice(1, symbols.length - 1)]
    } else {
        return symbols
    }
}

function skipGrouping(startIndex: number, symbols: Symbol[], reversed: boolean): number {
    const startSymbol = symbols[startIndex]
    let groupingStack: GroupingSymbol[] = []
    const startSentenal: GroupingSentenal = reversed ? GroupingSentenal.END : GroupingSentenal.START
    const endSentenal: GroupingSentenal = reversed ? GroupingSentenal.START : GroupingSentenal.END
    if (startSymbol.type === SymbolType.GROUPING && startSymbol.value.sentenal === startSentenal) {
        for (let index = startIndex + 1; index < symbols.length; index++) {
            const currSymbol = symbols[index] 
            if (currSymbol.type === SymbolType.GROUPING && currSymbol.value.type === startSymbol.value.type) {
                if (currSymbol.value.sentenal === startSentenal) {
                    groupingStack.push(currSymbol)
                } else if (currSymbol.value.sentenal === endSentenal) {
                    if (groupingStack.length) {
                        groupingStack.pop()
                    } else {
                        return index
                    }
                }
            } 
        }
    }
    return startIndex
}

function parseRec(symbols: Symbol[], precedence: number): number {
    symbols = stripStartEnd(symbols)
    if (groupMatch(symbols[0], symbols[symbols.length - 1])) {
        symbols = stripGrouping(symbols)
        precedence = 0
    }
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
        let reversed: boolean = false
        if (op.arity === 2 && op.associativity === Associativity.LEFT) {
            symbolSet.reverse()
            reversed = true
        }
        for (let symbolIndex = 0; symbolIndex < symbolSet.length; symbolIndex++) {
            symbolIndex = skipGrouping(symbolIndex, symbolSet, reversed)
            const symbol = symbolSet[symbolIndex]
            if (symbol.type === SymbolType.OPERATION) {
                if (symbol.value.type === op.type) {
                    let lhs = [...symbolSet].splice(0, symbolIndex)
                    let rhs = [...symbolSet].splice(symbolIndex + 1)
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
                            if (op.associativity === Associativity.LEFT) {
                                const temp = lhs
                                lhs = rhs
                                rhs = temp
                                lhs.reverse()
                                rhs.reverse()
                            }
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