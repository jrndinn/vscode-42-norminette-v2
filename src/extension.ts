import * as vscode from 'vscode';
import { languages, Diagnostic, DiagnosticSeverity } from 'vscode';

let diagnosticsCollection = languages.createDiagnosticCollection("NorminetteV2");

export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.onDidSaveTextDocument((e) => {

		let params = vscode.workspace.getConfiguration('norminettev2');
		let bin = params.get("norminette_bin");
		if (e.languageId === "c" && e.uri.scheme === "file") {
			const cp = require('child_process');
			let str: string = "";
			str = e.uri.path;
			cp.exec('which ' + bin, (err: string, stdout: string, stderr: string) => {
				if (err) {
					vscode.window.showInformationMessage("Error: " + bin + " was not found");
				}
			});
			cp.exec(bin + ' ' + str + " | tail -n +2", (err: string, stdout: string, stderr: string) => {
				let parseLine = (line: string) => {
					line = line.substr(30);
					var ret = {line: 0, col: 0, desc: "No error"};
					ret.line = +(line.split(",")[0]);
					ret.col = +(line.split(":")[1].slice(0, -1));
					ret.desc = line.split(":")[2].trim();
					return ret;
				};
				
				let lines = stdout.split("\n");
				let diagnostics : Diagnostic[] = [];

				diagnosticsCollection.clear();
				for (let line in lines) {
					var obj = parseLine(lines[line]);
					var r1 = e.lineAt(obj.line - 1);
					var r2 = e.lineAt(obj.line - 1);
					var r = new vscode.Range(r1.range.start, r2.range.end);
					diagnostics.push(new Diagnostic(r, obj.desc, DiagnosticSeverity.Warning));
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

// this method is called when your extension is deactivated
export function deactivate() {}
