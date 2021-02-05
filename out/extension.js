"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
let diagnosticsCollection = vscode_1.languages.createDiagnosticCollection("NorminetteV2");
function activate(context) {
    vscode.workspace.onDidSaveTextDocument((e) => {
        if (e.languageId === "c" && e.uri.scheme === "file") {
            const cp = require('child_process');
            let str = "";
            str = e.uri.path;
            cp.exec('norminettev2 ' + str + " | tail -n +2", (err, stdout, stderr) => {
                let parseLine = (line) => {
                    line = line.substr(30);
                    var ret = { line: 0, col: 0, desc: "No error" };
                    ret.line = +(line.split(",")[0]);
                    ret.col = +(line.split(":")[1].slice(0, -1));
                    ret.desc = line.split(":")[2].trim();
                    return ret;
                };
                let lines = stdout.split("\n");
                let diagnostics = [];
                diagnosticsCollection.clear();
                for (let line in lines) {
                    var obj = parseLine(lines[line]);
                    var r1 = e.lineAt(obj.line - 1);
                    var r2 = e.lineAt(obj.line - 1);
                    var r = new vscode.Range(r1.range.start, r2.range.end);
                    diagnostics.push(new vscode_1.Diagnostic(r, obj.desc, vscode_1.DiagnosticSeverity.Error));
                    diagnosticsCollection.set(e.uri, diagnostics);
                }
            });
        }
    });
    let disposable = vscode.commands.registerCommand('42-norminette-v2.launchNorm', () => {
        vscode.window.showInformationMessage("" + vscode.workspace.name);
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map