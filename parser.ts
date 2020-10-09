import { Kind } from './language'
import { Token } from './lexer'

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

export function parseFile (tokens: Token[]): Token[] {
  while (tokens.length > 0) {
    tokens = parseLine(tokens)
  }
  return tokens
}

function parseLine (tokens: Token[]): Token[] {
  tokens = skipWhitespace(tokens)
  tokens = parseExpr(tokens)
  tokens = skipWhitespace(tokens)
  tokens = expect(tokens, Kind.NewLine)
  return tokens
}

function parseExpr (tokens: Token[]): Token[] {
  tokens = parseTerm(tokens)
  tokens = skipWhitespace(tokens)
  // 演算子を先読み
  if (tokens.length === 0) {
    return tokens
  }
  switch (tokens[0].kind) {
    case Kind.Plus:
    case Kind.Minus:
      tokens = tokens.slice(1)
      break

    default:
      return tokens
  }
  tokens = skipWhitespace(tokens)
  tokens = parseExpr(tokens)
  return tokens
}

function parseTerm (tokens: Token[]): Token[] {
  tokens = parsePrim(tokens)
  tokens = skipWhitespace(tokens)
  // 演算子を先読み
  if (tokens.length === 0) {
    return tokens
  }
  switch (tokens[0].kind) {
    case Kind.Mult:
    case Kind.Div:
      tokens = tokens.slice(1)
      break

    default:
      return tokens
  }
  tokens = skipWhitespace(tokens)
  tokens = parseTerm(tokens)
  return tokens
}

function parsePrim (tokens: Token[]): Token[] {
  switch (tokens[0].kind) {
    case Kind.Integer:
      return tokens.slice(1)

    case Kind.ParenOpen: {
      tokens = tokens.slice(1)
      tokens = skipWhitespace(tokens)
      tokens = parseExpr(tokens)
      tokens = skipWhitespace(tokens)
      tokens = expect(tokens, Kind.ParenClose)
      return tokens
    }

    default:
      throw new Error('invalid prim')
  }
}

function skipWhitespace (tokens: Token[]): Token[] {
  let index = 0
  while (index < tokens.length && tokens[index].kind === Kind.Whitespace) {
    index++
  }
  return tokens.slice(index)
}

function expect (tokens: Token[], expected: Kind): Token[] {
  if (tokens.length > 0 && tokens[0].kind === expected) {
    return tokens.slice(1)
  } else {
    throw new Error(`token mismatch: expected ${expected}, got ${tokens.length > 0 ? tokens[0] : 'EOF'}`)
  }
}
