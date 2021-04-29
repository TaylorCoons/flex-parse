export enum GroupingType {
    START,
    END
}
export interface Grouping {
    startSyntax: string,
    endSyntax: string,
    type?: GroupingType 
}
export const groupings = [
    {
        startSyntax: '(',
        endSyntax: ')'
    }
]