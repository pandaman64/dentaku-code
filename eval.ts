import { Cursor, cursorChildren, Kind } from './language'

export function evalFile (file: Cursor): number[] {
  const ret = []

  for (const child of cursorChildren(file)) {
    if (child.node.kind === Kind.Line) {
      ret.push(evalLine(child))
    }
  }

  return ret
}

function isExpr (kind: Kind): boolean {
  switch (kind) {
    case Kind.Integer:
    case Kind.Prim:
    case Kind.Term:
    case Kind.Expr:
      return true

    default:
      return false
  }
}

function evalLine (line: Cursor): number {
  for (const child of cursorChildren(line)) {
    if (isExpr(child.node.kind)) {
      return evalExpr(child)
    }
  }

  throw new Error('expr not found')
}

function operator (expr: Cursor): '+' | '-' | '*' | '/' | undefined {
  for (const child of cursorChildren(expr)) {
    switch (child.node.kind) {
      case Kind.Plus:
      case Kind.Minus:
      case Kind.Mult:
      case Kind.Div:
        return child.node.kind
    }
  }

  return undefined
}

function evalExpr (expr: Cursor): number {
  switch (expr.node.kind) {
    case Kind.Integer:
      return parseInt(expr.node.text!, 10)

    case Kind.Prim:
      for (const child of cursorChildren(expr)) {
        if (isExpr(child.node.kind)) {
          return evalExpr(child)
        }
      }
      break

    case Kind.Term:
    case Kind.Expr: {
      const ret = []
      for (const child of cursorChildren(expr)) {
        if (isExpr(child.node.kind)) {
          ret.push(evalExpr(child))
        }
      }

      switch (operator(expr)) {
        case Kind.Plus:
          return ret[0] + ret[1]
        case Kind.Minus:
          return ret[0] - ret[1]
        case Kind.Mult:
          return ret[0] * ret[1]
        case Kind.Div:
          return ret[0] / ret[1]
        case undefined:
          return ret[0]
      }
    }
  }

  throw new Error('invalid expr')
}
