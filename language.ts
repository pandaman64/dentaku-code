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
