import { emptyNode, Node, Kind, pushNode, Token, errorToken } from './language'

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

  parseFile (): Node {
    const node = emptyNode(Kind.File)

    while (this.tokens.length > 0) {
      const line = this.parseLine()
      if (line.width !== 0) {
        pushNode(node, line)
      } else {
        // prevent from loop infinitely: eat next token as an error
        const skip = this.skip()
        skip.kind = Kind.Error
        pushNode(node, skip)
      }
    }

    return node
  }

  parseLine (): Node {
    const node = emptyNode(Kind.Line)

    pushNode(node, this.skipTrivial())
    pushNode(node, this.parseExpr())
    pushNode(node, this.skipTrivial())
    pushNode(node, this.expect(Kind.NewLine))

    return node
  }

  parseExpr (): Node {
    const node = emptyNode(Kind.Expr)

    pushNode(node, this.parseTerm())
    pushNode(node, this.skipTrivial())
    // 演算子を先読み
    if (this.tokens.length === 0) {
      return node
    }
    switch (this.tokens[0].kind) {
      case Kind.Plus:
      case Kind.Minus:
        pushNode(node, this.skip())
        break

      default:
        return node
    }
    pushNode(node, this.skipTrivial())
    pushNode(node, this.parseExpr())

    return node
  }

  parseTerm (): Node {
    const node = emptyNode(Kind.Term)

    pushNode(node, this.parsePrim())
    pushNode(node, this.skipTrivial())
    // 演算子を先読み
    if (this.tokens.length === 0) {
      return node
    }
    switch (this.tokens[0].kind) {
      case Kind.Mult:
      case Kind.Div:
        pushNode(node, this.skip())
        break

      default:
        return node
    }
    pushNode(node, this.skipTrivial())
    pushNode(node, this.parseTerm())

    return node
  }

  parsePrim (): Node {
    const node = emptyNode(Kind.Prim)

    if (this.tokens.length === 0) {
      // console.log('missing prim')
      pushNode(node, errorToken())
      return node
    }

    switch (this.tokens[0].kind) {
      case Kind.Integer:
        pushNode(node, this.expect(Kind.Integer))
        break

      case Kind.ParenOpen:
        pushNode(node, this.expect(Kind.ParenOpen))
        pushNode(node, this.skipTrivial())
        pushNode(node, this.parseExpr())
        pushNode(node, this.skipTrivial())
        pushNode(node, this.expect(Kind.ParenClose))
        break

      default:
        // console.log('invalid prim')
        pushNode(node, errorToken())
    }

    return node
  }

  skipTrivial (): Token[] {
    let index = this.tokens.findIndex(token => token.kind !== Kind.Whitespace && token.kind !== Kind.Error)
    if (index === -1) {
      index = this.tokens.length
    }
    return this.tokens.splice(0, index)
  }

  skip (): Token {
    if (this.tokens.length > 0) {
      const token = this.tokens[0]
      this.tokens = this.tokens.slice(1)
      return token
    } else {
      return errorToken()
    }
  }

  expect (expected: Kind): Token {
    if (this.tokens.length > 0 && this.tokens[0].kind === expected) {
      return this.skip()
    } else {
      // console.log(`token mismatch: expected ${expected}, got ${this.tokens.length > 0 ? this.tokens[0] : 'EOF'}`)
      return errorToken()
    }
  }
}
