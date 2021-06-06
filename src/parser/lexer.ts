import { Operation, operations } from './operations'
import { SymbolType, Symbol, SymbolMatch } from './symbols'
import { GroupingSentenal, Grouping, groupings } from './groupings'

export function stripStartEnd(symbols: Symbol[]): Symbol[] {
    return symbols.filter((symbol) => {
        return !(symbol.type === SymbolType.START || symbol.type === SymbolType.END)
    })
}

export function stripWhite(content: string): string {
    return content.replace(/\s+/g, '')
}

export function validate(content: string): boolean {
    const opString = operations.map((op) => {
        return `\\${op.syntax}`
    }).join()
    return new RegExp(`[^0-9${opString}]`, 'g').test(content)
}

function checkPreviousSymbols(previousSymbol: Symbol, previousMatches: SymbolMatch[] | undefined) {
    if (previousMatches === undefined) {
        return true
    }
    let valid = false
    for (const previousMatch of previousMatches) {
        if (previousSymbol.type === previousMatch.type) {
            switch (previousMatch.type) {
                case SymbolType.OPERATION:
                    const symbolOperation = previousSymbol.value as Operation
                    if (previousMatch.operationType === symbolOperation.type) {
                        valid = true
                    }
                break;
                case SymbolType.GROUPING:
                    const symbolGrouping = previousSymbol.value as Grouping
                    if (previousMatch.groupingType === symbolGrouping.type && previousMatch.groupingSentinal === symbolGrouping.sentenal) {
                        valid = true
                    }
                break;
                default:
                    valid = true
            }
        }
    }
    return valid
}
function lexOperation(content: string, symbols: Symbol[]): Symbol | undefined {
    for (const operation of operations) {
        const engine = new RegExp(`^\\${operation.syntax}`)
        if (content.match(engine) && checkPreviousSymbols(symbols[symbols.length - 1], operation.previousSymbols)) {
            return {
                type: SymbolType.OPERATION,
                value: operation,
                length: operation.syntax.length
            }
        }
    }
    return undefined
}
function lexNumber(content: string): Symbol | undefined {
    const res: string | undefined = content.match(/^[0-9]+/)?.[0]
    if (!res) {
        return undefined
    }
    const value = parseInt(res, 10)
    if (value === NaN) {
        throw new Error(`Could not convert value: ${res} to number`)
    }
    return {
        type: SymbolType.NUMBER,
        value: value,
        length: res.length
    }
}
function lexGrouping(content: string): Symbol | undefined {
    for (const grouping of groupings) {
        const startEngine = new RegExp(`^\\${grouping.startSyntax}`)
        const endEngine = new RegExp(`^\\${grouping.endSyntax}`)
        if (content.match(startEngine)) {
            return {
                type: SymbolType.GROUPING,
                value: {
                    ...grouping,
                    sentenal: GroupingSentenal.START
                },
                length: grouping.startSyntax.length
            }
        }
        if (content.match(endEngine)) {
            return {
                type: SymbolType.GROUPING,
                value: {
                    ...grouping,
                    sentenal: GroupingSentenal.END
                },
                length: grouping.endSyntax.length
            }
        }
    }
    return undefined
}
export function lex(content: string): Symbol[] {
    let buff: string = content
    const symbols: Symbol[] = [{
        type: SymbolType.START,
        value: undefined,
        length: 0
    }]
    while (buff.length) {
        const possibleSymbols = [
            lexOperation(buff, symbols),
            lexNumber(buff),
            lexGrouping(buff)
        ]
        const lexedSymbols: Symbol[] = possibleSymbols.filter(value => value !== undefined) as Symbol[]
        if (lexedSymbols.length === 0) {
            throw new Error(`Unexpected syntax found at: ${buff}`)     
        }
        if (lexedSymbols.length > 1) {
            throw new Error(`Ambiguous syntax found at: ${buff}`)
        }
        symbols.push(lexedSymbols[0])
        buff = buff.substr(lexedSymbols[0].length)
    }
    symbols.push({
        type: SymbolType.END,
        value: undefined,
        length: 0
    })
    return symbols
}

