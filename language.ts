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
  ParenClose: ')'
} as const
export type Kind = typeof Kind[keyof typeof Kind]
