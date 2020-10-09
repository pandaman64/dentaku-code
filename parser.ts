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
// TERM := PRIM '*' TERM
//       | PRIM '/' PRIM
// PRIM := INTEGER
//       | '(' EXPR ')'

export function parseFile (tokens: Token[]): Token[] {
  while (tokens.length > 0) {
    tokens = parseLine(tokens)
  }
  return tokens
}

function parseLine (tokens: Token[]): Token[] {
  throw new Error()
}

function parseExpr (tokens: Token[]): Token[] {
  throw new Error()
}

function parseTerm (tokens: Token[]): Token[] {
  throw new Error()
}

function parsePrim (tokens: Token[]): Token[] {
  throw new Error()
}
