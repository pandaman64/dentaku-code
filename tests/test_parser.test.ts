import { assert } from 'chai'
import { describe, it } from 'mocha'
import { lex } from '../lexer'
import { Parser } from '../parser'

describe('recognize', () => {
  it('one line', () => {
    const tokens = lex('\t123 + 45\t\n')
    const parser = new Parser(tokens)
    parser.parseFile()
    assert.deepEqual(parser.tokens, [])
  })

  it('multi lines', () => {
    const tokens = lex(`123 + 45
    135 * 242
    (1 + 2) * (3 - 4) / 5
`)
    const parser = new Parser(tokens)
    parser.parseFile()
    assert.deepEqual(parser.tokens, [])
  })
})
