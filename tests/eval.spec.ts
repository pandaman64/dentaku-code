import { assert } from 'chai'
import { describe, it } from 'mocha'
import { evalFile } from '../eval'
import { cursorRoot } from '../language'
import { lex } from '../lexer'
import { Parser } from '../parser'

describe('parse success', () => {
  it('one liner', () => {
    const input = '123 + 45  \n'
    const tokens = lex(input)
    const parser = new Parser(tokens)
    const rootNode = parser.parseFile()
    const rootCursor = cursorRoot(rootNode)
    assert.deepEqual(evalFile(rootCursor), [168])
  })

  it('multi lines', () => {
    const input = `123 + 45
    1 + 2 * 3 - 6 / 2
`
    const tokens = lex(input)
    const parser = new Parser(tokens)
    const rootNode = parser.parseFile()
    const rootCursor = cursorRoot(rootNode)
    assert.deepEqual(evalFile(rootCursor), [168, 4])
  })
})
