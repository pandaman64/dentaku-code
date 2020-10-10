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
  text: string,
}

export type Node = {
  kind: Kind,
  width: number,
  text?: string,
  children?: Node[],
}

export function emptyNode (kind: Kind): Node {
  return {
    kind,
    width: 0,
    children: []
  }
}

export function pushNode (node: Node, child?: Node) {
  if (child === undefined) {
    return
  }

  if (node.children === undefined) {
    node.width = child.width
    node.children = [child]
  } else {
    node.width += child.width
    node.children.push(child)
  }
}

export type Cursor = {
  offset: number,
  node: Node,
  parent?: Cursor,
}

export function cursorRoot (node: Node): Cursor {
  return {
    offset: 0,
    node
  }
}

export function * cursorChildren (cursor: Cursor): Iterable<Cursor> {
  let offset = cursor.offset
  if (cursor.node.children !== undefined) {
    for (const child of cursor.node.children) {
      const childOffset = offset
      offset += child.width
      yield {
        offset: childOffset,
        node: child,
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
  buffer += `${cursor.node.kind}@${cursor.offset}..${cursor.offset + cursor.node.width}`
  if (cursor.node.text !== undefined) {
    // JSON.stringify for escaping special characters
    buffer += ` ${JSON.stringify(cursor.node.text)}`
  }
  buffer += '\n'

  for (const child of cursorChildren(cursor)) {
    buffer += cursorPrettyPrintAt(child, level + 1)
  }

  return buffer
}

export function cursorPrettyPrint (cursor: Cursor): string {
  return cursorPrettyPrintAt(cursor, 0)
}
