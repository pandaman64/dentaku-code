import { assert } from 'chai'
import { describe, it } from 'mocha'
import { cursorPrettyPrint, cursorRoot } from '../language'
import { lex } from '../lexer'
import { Parser } from '../parser'

describe('recognize', () => {
  it('one line', () => {
    const input = '\t123 + 45\t\n'
    const tokens = lex(input)
    const parser = new Parser(tokens)
    const node = parser.parseFile()
    const root = cursorRoot(node)

    assert.deepEqual(parser.tokens, [])
    assert.equal(node.width, input.length)
    assert.equal(cursorPrettyPrint(root),
      String.raw`File@0..11
  Line@0..11
    Whitespace@0..1 "\t"
    Expr@1..10
      Term@1..5
        Prim@1..4
          Integer@1..4 "123"
        Whitespace@4..5 " "
      +@5..6 "+"
      Whitespace@6..7 " "
      Expr@7..10
        Term@7..10
          Prim@7..9
            Integer@7..9 "45"
          Whitespace@9..10 "\t"
    NewLine@10..11 "\n"
`)
  })

  it('multi lines', () => {
    const input = `123 + 45
    135 * 242
    (1 + 2) * 3 - 4 / 5
`
    const tokens = lex(input)
    const parser = new Parser(tokens)
    const node = parser.parseFile()
    const root = cursorRoot(node)

    assert.deepEqual(parser.tokens, [])
    assert.equal(node.width, input.length)
    assert.equal(cursorPrettyPrint(root),
      String.raw`File@0..47
  Line@0..9
    Expr@0..8
      Term@0..4
        Prim@0..3
          Integer@0..3 "123"
        Whitespace@3..4 " "
      +@4..5 "+"
      Whitespace@5..6 " "
      Expr@6..8
        Term@6..8
          Prim@6..8
            Integer@6..8 "45"
    NewLine@8..9 "\n"
  Line@9..23
    Whitespace@9..13 "    "
    Expr@13..22
      Term@13..22
        Prim@13..16
          Integer@13..16 "135"
        Whitespace@16..17 " "
        *@17..18 "*"
        Whitespace@18..19 " "
        Term@19..22
          Prim@19..22
            Integer@19..22 "242"
    NewLine@22..23 "\n"
  Line@23..47
    Whitespace@23..27 "    "
    Expr@27..46
      Term@27..39
        Prim@27..34
          (@27..28 "("
          Expr@28..33
            Term@28..30
              Prim@28..29
                Integer@28..29 "1"
              Whitespace@29..30 " "
            +@30..31 "+"
            Whitespace@31..32 " "
            Expr@32..33
              Term@32..33
                Prim@32..33
                  Integer@32..33 "2"
          )@33..34 ")"
        Whitespace@34..35 " "
        *@35..36 "*"
        Whitespace@36..37 " "
        Term@37..39
          Prim@37..38
            Integer@37..38 "3"
          Whitespace@38..39 " "
      -@39..40 "-"
      Whitespace@40..41 " "
      Expr@41..46
        Term@41..46
          Prim@41..42
            Integer@41..42 "4"
          Whitespace@42..43 " "
          /@43..44 "/"
          Whitespace@44..45 " "
          Term@45..46
            Prim@45..46
              Integer@45..46 "5"
    NewLine@46..47 "\n"
`)
  })
})
