export enum GroupingType {
    Parenthesis
}
export enum GroupingSentenal {
    START,
    END
}
export interface Grouping {
    type: GroupingType,
    name: string
    startSyntax: string,
    endSyntax: string,
    sentenal?: GroupingSentenal
}
export const groupings = [
    {
        type: GroupingType.Parenthesis,
        name: 'Parenthesis',
        startSyntax: '(',
        endSyntax: ')'
    }
]