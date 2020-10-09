import { Kind, Token } from './language'

// Language Definition:
// FILE := LINE*
// LINE := EXPR '\n'
// EXPR := INTEGER
//       | '(' EXPR ')'
//       | EXPR '+' EXPR
//       | EXPR '-' EXPR
//       | EXPR '*' EXPR
//       | EXPR '/' EXPR

// Parsing Definition
// EXPR := TERM '+' EXPR
//       | TERM '-' EXPR
//       | TERM
// TERM := PRIM '*' TERM
//       | PRIM '/' TERM
//       | PRIM
// PRIM := INTEGER
//       | '(' EXPR ')'

export class Parser {
  tokens: Token[]

  constructor (tokens: Token[]) {
    this.tokens = tokens
  }

  parseFile () {
    while (this.tokens.length > 0) {
      this.parseLine()
    }
  }

  parseLine () {
    this.skipWhitespace()
    this.parseExpr()
    this.skipWhitespace()
    this.expect(Kind.NewLine)
  }

  parseExpr () {
    this.parseTerm()
    this.skipWhitespace()
    // 演算子を先読み
    if (this.tokens.length === 0) {
      return
    }
    switch (this.tokens[0].kind) {
      case Kind.Plus:
      case Kind.Minus:
        this.skip()
        break

      default:
        return
    }
    this.skipWhitespace()
    this.parseExpr()
  }

  parseTerm () {
    this.parsePrim()
    this.skipWhitespace()
    // 演算子を先読み
    if (this.tokens.length === 0) {
      return
    }
    switch (this.tokens[0].kind) {
      case Kind.Mult:
      case Kind.Div:
        this.skip()
        break

      default:
        return
    }
    this.skipWhitespace()
    this.parseTerm()
  }

  parsePrim () {
    switch (this.tokens[0].kind) {
      case Kind.Integer:
        this.expect(Kind.Integer)
        return

      case Kind.ParenOpen: {
        this.expect(Kind.ParenOpen)
        this.skipWhitespace()
        this.parseExpr()
        this.skipWhitespace()
        this.expect(Kind.ParenClose)
        return
      }

      default:
        throw new Error('invalid prim')
    }
  }

  skipWhitespace () {
    let index = 0
    while (index < this.tokens.length && this.tokens[index].kind === Kind.Whitespace) {
      index++
    }
    this.tokens = this.tokens.slice(index)
  }

  skip () {
    this.tokens = this.tokens.slice(1)
  }

  expect (expected: Kind) {
    if (this.tokens.length > 0 && this.tokens[0].kind === expected) {
      this.skip()
    } else {
      throw new Error(`token mismatch: expected ${expected}, got ${this.tokens.length > 0 ? this.tokens[0] : 'EOF'}`)
    }
  }
}
