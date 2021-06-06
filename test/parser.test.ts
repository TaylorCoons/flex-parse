import { parse } from '../src/parser/parser'
import { lex } from '../src/parser/lexer'

describe('Parser tests', () => {
    test('Basic test with precedence 0', () => {
        expect(parse(lex('1+2'))).toBe(3)
        expect(parse(lex('2-1'))).toBe(1)
        expect(parse(lex('1+2+3'))).toBe(6)
        expect(parse(lex('1-2'))).toBe(-1)
        expect(parse(lex('3*4'))).toBe(12)
        expect(parse(lex('12/4'))).toBe(3)
    })
    test('Basic unary operations with precedence 0', () => {
        expect(parse(lex('-1'))).toBe(-1)
    })
    test('Basic unary operations prefix', () => {
        expect(parse(lex('-3'))).toBe(-3)
    })
    test('Basic unary operation with postfix', () => {
        expect(parse(lex('4!'))).toBe(24)
    })
    test('Basic Unary with binary', () => {
        expect(parse(lex('2--1'))).toBe(3)
    })
    test('Basic right hand associative operator', () => {
        expect(parse(lex('2^3'))).toBe(8)
        expect(parse(lex('2^3^2'))).toBe(512)
    })
    test('Right hand associative with lower precedence', () => {
        expect(parse(lex('2^3^2+1'))).toBe(513)
        expect(parse(lex('2^3+3^2'))).toBe(17)
        expect(parse(lex('2^2+2^3^2+2^3'))).toBe(524)
    })
    test('Unary with binary back to back', () => {
        expect(parse(lex('1+-3'))).toBe(-2)
    })
    test('Division with multiplication', () => {
        expect(parse(lex('7*2/7'))).toBe(2)
    })
    test('Multiple unary expressions back to back', () => {
        expect(parse(lex('7-8-8'))).toBe(-9)
    })
    test('Complex Statements', () => {
        expect(parse(lex('2*4+3*8^7-4/2'))).toBe(6291462)
        expect(parse(lex('4--8^9/2'))).toBe(67108868)
        expect(parse(lex('7-8-8+7*2/7-0+1+-3'))).toBe(-9)
    })
})

describe('Grouping tests', () => {
    test('Basic grouping', () => {
        expect(parse(lex('(1)'))).toBe(1)
        expect(parse(lex('(1+1)'))).toBe(2)
    })
    test('Basic grouping with order', () => {
        expect(parse(lex('2*(1+1)'))).toBe(4)
    })
    test('Nested groupings', () => {
        expect(parse(lex('2*(2^(2+1))'))).toBe(16)
    })
    test('Prefix unary with group', () => {
        expect(parse(lex('-(3+1)'))).toBe(-4)
    })
    test('Postfix unary with group', () => {
        expect(parse(lex('(5-1)!'))).toBe(24)
    })
    test('Subtraction with factorial', () => {
        expect(parse(lex('3!-2'))).toBe(4)
    })
})