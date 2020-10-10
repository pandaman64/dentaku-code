import { assert } from 'chai'
import { describe, it } from 'mocha'
import jsc from 'jsverify'
import { Kind } from '../language'
import { lex } from '../lexer'

describe('lexer test', () => {
  it('oneliners', () => {
    const result = lex('123456 \t23+-*/()あいうえお')
    assert.deepEqual(result, [
      { kind: Kind.Integer, width: 6, text: '123456' },
      { kind: Kind.Whitespace, width: 2, text: ' \t' },
      { kind: Kind.Integer, width: 2, text: '23' },
      { kind: Kind.Plus, width: 1, text: '+' },
      { kind: Kind.Minus, width: 1, text: '-' },
      { kind: Kind.Mult, width: 1, text: '*' },
      { kind: Kind.Div, width: 1, text: '/' },
      { kind: Kind.ParenOpen, width: 1, text: '(' },
      { kind: Kind.ParenClose, width: 1, text: ')' },
      { kind: Kind.Error, width: 5, text: 'あいうえお' }
    ])
  })

  it('multiline', () => {
    const result = lex('123\n45')
    assert.deepEqual(result, [
      { kind: Kind.Integer, width: 3, text: '123' },
      { kind: Kind.NewLine, width: 1, text: '\n' },
      { kind: Kind.Integer, width: 2, text: '45' }
    ])
  })

  it('empty', () => {
    assert.deepEqual(lex(''), [])
  })

  jsc.property('lexer preserves text length', jsc.string, input => {
    const result = lex(input)
    const computed = result.reduce((sum, token) => sum + token.width, 0)
    return computed === input.length && result.map(token => token.text).join('') === input
  })
})
