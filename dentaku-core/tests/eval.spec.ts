import { assert } from 'chai'
import { describe, it } from 'mocha'
import { evalFile } from '../eval'
import { cursorPrettyPrint, cursorRoot } from '../language'
import { lex } from '../lexer'
import { Parser } from '../parser'
import jsc from 'jsverify'

describe('parse success', () => {
  it('one liner', () => {
    const input = '123 + 45  \n'
    const tokens = lex(input)
    const parser = new Parser(tokens)
    const rootNode = parser.parseFile()
    const rootCursor = cursorRoot(rootNode)
    assert.deepEqual(evalFile(rootCursor), [{ start: 0, end: 8, value: 168 }], cursorPrettyPrint(rootCursor))
  })

  it('multi lines', () => {
    const input = `123 + 45
    1 + 2 * 3 - 6 / 2
`
    const tokens = lex(input)
    const parser = new Parser(tokens)
    const rootNode = parser.parseFile()
    const rootCursor = cursorRoot(rootNode)
    assert.deepEqual(evalFile(rootCursor), [
      { start: 0, end: 8, value: 168 },
      { start: 13, end: 30, value: 4 }
    ])
  })
})

describe('evaluator is error tolerant', () => {
  jsc.property('proptest', jsc.string, input => {
    const tokens = lex(input)
    const parser = new Parser(tokens)
    const rootNode = parser.parseFile()
    const rootCursor = cursorRoot(rootNode)
    evalFile(rootCursor)
    return true
  })
})
