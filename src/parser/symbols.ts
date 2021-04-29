import { Operation } from './operations'
import { Grouping } from './groupings'

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