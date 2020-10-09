import { Kind } from './language'

export type Token = {
    kind: Kind,
    width: number,
}

function match (input: string, res: [Kind, RegExp][]): Token | undefined {
  for (const [kind, re] of res) {
    const result = input.match(re)
    if (result !== null) {
      return {
        kind,
        width: result[0].length
      }
    }
  }
}

export function lex (input: string): Token[] {
  const NEWLINE = /^(\r\n|\n)/
  const INTEGERS = /^[0-9]+/
  const WHITESPACES = /^[ \t]+/
  const PLUS = /^\+/
  const MINUS = /^-/
  const MULT = /^\*/
  const DIV = /^\//
  const OPEN = /^\(/
  const CLOSE = /^\)/
  const RES: [Kind, RegExp][] = [
    [Kind.NewLine, NEWLINE],
    [Kind.Integer, INTEGERS],
    [Kind.Whitespace, WHITESPACES],
    [Kind.Plus, PLUS],
    [Kind.Minus, MINUS],
    [Kind.Mult, MULT],
    [Kind.Div, DIV],
    [Kind.ParenOpen, OPEN],
    [Kind.ParenClose, CLOSE]
  ]

  const ret: Token[] = []
  let error: Token | undefined

  while (input.length > 0) {
    const token = match(input, RES)
    if (token !== undefined) {
      if (error !== undefined) {
        ret.push(error)
        error = undefined
      }
      ret.push(token)
      input = input.substring(token.width)
    } else {
      const codePointLength = String.fromCodePoint(input.codePointAt(0)!).length
      if (error !== undefined) {
        error.width += codePointLength
      } else {
        error = {
          kind: Kind.Error,
          width: codePointLength
        }
      }
      input = input.substring(codePointLength)
    }
  }

  if (error !== undefined) {
    ret.push(error)
  }

  return ret
}
