import { Operation, OperationType } from './operations'
import { Grouping, GroupingSentenal, GroupingType } from './groupings'

export enum SymbolType {
    START,
    END,
    NUMBER,
    GROUPING,
    OPERATION
}

export type Symbol = OperationSymbol | NumberSymbol | GroupingSymbol | StartSymbol | EndSymbol

export interface OperationSymbol {
    type: SymbolType.OPERATION;
    value: Operation;
    length: number;
}

export interface NumberSymbol {
    type: SymbolType.NUMBER;
    value: number;
    length: number;
}

export interface GroupingSymbol {
    type: SymbolType.GROUPING;
    value: Grouping;
    length: number;
}

export interface StartSymbol {
    type: SymbolType.START;
    value: undefined;
    length: 0;
}

export interface EndSymbol {
    type: SymbolType.END;
    value: undefined;
    length: 0;
}

export type SymbolMatch = OperationSymbolMatch | NumberSymbolMatch | GroupingSymbolMatch | StartSymbolMatch | EndSymbolMatch

export interface OperationSymbolMatch {
    type: SymbolType.OPERATION,
    operationType: OperationType
}

export interface NumberSymbolMatch {
    type: SymbolType.NUMBER
}

export interface GroupingSymbolMatch {
    type: SymbolType.GROUPING,
    groupingType: GroupingType,
    groupingSentinal: GroupingSentenal
}

export interface StartSymbolMatch {
    type: SymbolType.START
}

export interface EndSymbolMatch {
    type: SymbolType.END
}