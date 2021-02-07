"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
let diagnosticsCollection = vscode_1.languages.createDiagnosticCollection("NorminetteV2");
function activate(context) {
    vscode.workspace.onDidSaveTextDocument((e) => {
        let params = vscode.workspace.getConfiguration('norminettev2');
        let bin = params.get("norminette_bin");
        if ((e.languageId === "c" || e.languageId === "cpp") && e.uri.scheme === "file") {
            const cp = require('child_process');
            let str = "";
            str = e.uri.path;
            cp.exec('which ' + bin, (err, stdout, stderr) => {
                if (err) {
                    vscode.window.showInformationMessage("Error: " + bin + " was not found");
                }
            });
            cp.exec(bin + ' ' + str + " | tail -n +2", (err, stdout, stderr) => {
                let parseLine = (line) => {
                    var ret = { line: 0, col: 0, desc: "No error", id: "NO_ERROR" };
                    let rgx = /(\s*)(\w+)(\s*)(\()(line:\s*)([0-9]+)(,\s*)(col:\s*)([0-9]+)(\):)(\s*)(.+)/;
                    let match = rgx.exec(line);
                    if (match) {
                        ret.line = parseInt(match[6]);
                        ret.col = parseInt(match[9]);
                        ret.id = match[2];
                        ret.desc = match[12][0].toUpperCase() + match[12].slice(1);
                    }
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
                    diagnostics.push(new vscode_1.Diagnostic(r, obj.desc + " [" + obj.line + ":" + obj.col + ", " + obj.id + "]", vscode_1.DiagnosticSeverity.Warning));
                    diagnosticsCollection.set(e.uri, diagnostics);
                }
            });
        }
    });
    let disposable = vscode.commands.registerCommand('42-norminette-v2.launchNorm', () => {
        vscode.window.showInformationMessage("unimplemented yet");
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map