import { Cursor, cursorChildren, Kind } from './language'

export type EvalResult = {
  start: number,
  end: number,
  value?: number,
}

function nonTrivialRange (cursor: Cursor): [number, number] {
  const children = [...cursorChildren(cursor)]
  if (children.length === 0) {
    switch (cursor.node.kind) {
      // trivial terminal
      case Kind.Error:
      case Kind.Whitespace:
      case Kind.NewLine:
        return [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]

      default:
        return [cursor.offset, cursor.offset + cursor.node.width]
    }
  }

  let start = Number.MAX_SAFE_INTEGER
  let end = Number.MIN_SAFE_INTEGER
  for (const child of children) {
    const [startChild, endChild] = nonTrivialRange(child)
    if (start > startChild) {
      start = startChild
    }
    if (end < endChild) {
      end = endChild
    }
  }

  return [start, end]
}

export function evalFile (file: Cursor): EvalResult[] {
  const ret = []

  for (const child of cursorChildren(file)) {
    if (child.node.kind === Kind.Line) {
      const value = evalLine(child)
      if (value !== undefined) {
        const [start, end] = nonTrivialRange(child)
        ret.push({
          start,
          end,
          value
        })
      }
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

function evalLine (line: Cursor): number | undefined {
  for (const child of cursorChildren(line)) {
    if (isExpr(child.node.kind)) {
      return evalExpr(child)
    }
  }

  return undefined
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

function evalExpr (expr: Cursor): number | undefined {
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
          const value = evalExpr(child)
          if (value === undefined) {
            return undefined
          }
          ret.push(value)
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

  return undefined
}
