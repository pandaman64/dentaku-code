import { Kind, Token } from './language'

function match (input: string, res: [Kind, RegExp][]): Token {
  for (const [kind, re] of res) {
    const result = input.match(re)
    if (result !== null) {
      return {
        kind,
        width: result[0].length
      }
    }
  }

  throw new Error('no match')
}

export function lex (input: string): Token[] {
  const NEWLINE = /^(\r\n|\r|\n)/
  const INTEGERS = /^[0-9]+/
  const WHITESPACES = /^[\r\t ]+/
  const PLUS = /^\+/
  const MINUS = /^-/
  const MULT = /^\*/
  const DIV = /^\//
  const OPEN = /^\(/
  const CLOSE = /^\)/
  const OTHERS = /^[^0-9+\-*/()\r\n\t ]+/
  const RES: [Kind, RegExp][] = [
    [Kind.NewLine, NEWLINE],
    [Kind.Integer, INTEGERS],
    [Kind.Whitespace, WHITESPACES],
    [Kind.Plus, PLUS],
    [Kind.Minus, MINUS],
    [Kind.Mult, MULT],
    [Kind.Div, DIV],
    [Kind.ParenOpen, OPEN],
    [Kind.ParenClose, CLOSE],
    [Kind.Error, OTHERS]
  ]

  const ret: Token[] = []

  while (input.length > 0) {
    const token = match(input, RES)
    ret.push(token)
    input = input.substring(token.width)
  }

  return ret
}
