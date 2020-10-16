// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { lex } from 'dentaku-core/lexer';
import { Parser } from 'dentaku-core/parser';
import { cursorRoot, cursorPrettyPrint } from 'dentaku-core/language';
import { evalFile } from 'dentaku-core/eval';

// Reference code for Inlay calculation
// https://github.com/rust-analyzer/rust-analyzer/blob/fb2d332f5f6aa45eb282aebdd01de4bc0ef8a39e/editors/code/src/inlay_hints.ts#L46

// Reference config for Inlay calculation
// https://github.com/rust-analyzer/rust-analyzer/blob/fb2d332f5f6aa45eb282aebdd01de4bc0ef8a39e/editors/code/package.json#L782

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "dentaku-code" is now active!');

    const decoration = vscode.window.createTextEditorDecorationType({
        after: {
            color: "#A0A0A0F0",
            backgroundColor: "#11223300",
            fontStyle: "normal",
        }
    });

    let editor: vscode.TextEditor | undefined = undefined;
    const changeEditor = vscode.window.onDidChangeTextEditorVisibleRanges(ev => {
        editor = ev.textEditor;
    });
    context.subscriptions.push(changeEditor);
    const changeDoc = vscode.workspace.onDidChangeTextDocument(ev => {
        const doc = ev.document;
        const text = doc.getText();
        const tokens = lex(text);
        const parser = new Parser(tokens);
        const node = parser.parseFile();
        const rootCursor = cursorRoot(node);
        const results = evalFile(rootCursor);
        const ranges: vscode.DecorationOptions[] = results
            .filter(result => result.value !== undefined)
            .map(result => {
                const start = doc.positionAt(result.expr.offset);
                const end = doc.positionAt(result.expr.offset + result.expr.node.width);
                const range = doc.validateRange(new vscode.Range(start, end));
                return {
                    range,
                    renderOptions: {
                        after: {
                            contentText: ` = ${result.value}`
                        }
                    }
                };
            });
        if (editor !== undefined) {
            editor.setDecorations(decoration, ranges);
        }
    });
    context.subscriptions.push(changeDoc);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('dentaku-code.helloWorld', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from dentaku-code!');
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
