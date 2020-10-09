export const Kind = {
  Error: 'Error',
  Whitespace: 'Whitespace',
  NewLine: 'NewLine',
  Integer: 'Integer',
  Plus: '+',
  Minus: '-',
  Mult: '*',
  Div: '/',
  ParenOpen: '(',
  ParenClose: ')',
  File: 'File',
  Line: 'Line',
  Expr: 'Expr',
  Term: 'Term',
  Prim: 'Prim'
} as const
export type Kind = typeof Kind[keyof typeof Kind]

export type Token = {
  kind: Kind,
  width: number,
}

export type GreenNode = {
  kind: Kind,
  width: number,
  children?: GreenNode[],
}

export function emptyNode (kind: Kind): GreenNode {
  return {
    kind,
    width: 0,
    children: []
  }
}

export function pushNode (green: GreenNode, child?: GreenNode) {
  if (child === undefined) {
    return
  }

  if (green.children === undefined) {
    green.width = child.width
    green.children = [child]
  } else {
    green.width += child.width
    green.children.push(child)
  }
}

export type Cursor = {
  offset: number,
  green: GreenNode,
  parent?: Cursor,
}

export function cursorRoot (green: GreenNode): Cursor {
  return {
    offset: 0,
    green
  }
}

export function * cursorChildren (cursor: Cursor): Iterable<Cursor> {
  let offset = cursor.offset
  if (cursor.green.children !== undefined) {
    for (const child of cursor.green.children) {
      const childOffset = offset
      offset += child.width
      yield {
        offset: childOffset,
        green: child,
        parent: cursor
      }
    }
  }
}

function cursorPrettyPrintAt (cursor: Cursor, level: number): string {
  let buffer = ''
  for (let i = 0; i < level; i++) {
    buffer += '  '
  }
  buffer += `${cursor.green.kind}@${cursor.offset}..${cursor.offset + cursor.green.width}\n`

  for (const child of cursorChildren(cursor)) {
    buffer += cursorPrettyPrintAt(child, level + 1)
  }

  return buffer
}

export function cursorPrettyPrint (cursor: Cursor): string {
  return cursorPrettyPrintAt(cursor, 0)
}
