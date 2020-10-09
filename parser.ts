import { emptyNode, Node, Kind, pushNode, Token } from './language'

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
      pushNode(node, this.parseLine())
    }

    return node
  }

  parseLine (): Node {
    const node = emptyNode(Kind.Line)

    pushNode(node, this.skipWhitespace())
    pushNode(node, this.parseExpr())
    pushNode(node, this.skipWhitespace())
    pushNode(node, this.expect(Kind.NewLine))

    return node
  }

  parseExpr (): Node {
    const node = emptyNode(Kind.Expr)

    pushNode(node, this.parseTerm())
    pushNode(node, this.skipWhitespace())
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
    pushNode(node, this.skipWhitespace())
    pushNode(node, this.parseExpr())

    return node
  }

  parseTerm (): Node {
    const node = emptyNode(Kind.Term)

    pushNode(node, this.parsePrim())
    pushNode(node, this.skipWhitespace())
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
    pushNode(node, this.skipWhitespace())
    pushNode(node, this.parseTerm())

    return node
  }

  parsePrim (): Node {
    const node = emptyNode(Kind.Prim)

    switch (this.tokens[0].kind) {
      case Kind.Integer:
        pushNode(node, this.expect(Kind.Integer))
        return node

      case Kind.ParenOpen: {
        pushNode(node, this.expect(Kind.ParenOpen))
        pushNode(node, this.skipWhitespace())
        pushNode(node, this.parseExpr())
        pushNode(node, this.skipWhitespace())
        pushNode(node, this.expect(Kind.ParenClose))
        return node
      }

      default:
        throw new Error('invalid prim')
    }
  }

  skipWhitespace (): Token | undefined {
    if (this.tokens.length > 0 && this.tokens[0].kind === Kind.Whitespace) {
      return this.skip()
    }
  }

  skip (): Token {
    const token = this.tokens[0]
    this.tokens = this.tokens.slice(1)
    return token
  }

  expect (expected: Kind): Token {
    if (this.tokens.length > 0 && this.tokens[0].kind === expected) {
      return this.skip()
    } else {
      throw new Error(`token mismatch: expected ${expected}, got ${this.tokens.length > 0 ? this.tokens[0] : 'EOF'}`)
    }
  }
}
