import * as vscode from 'vscode';
import { languages, Diagnostic, DiagnosticSeverity } from 'vscode';

let diagnosticsCollection = languages.createDiagnosticCollection("NorminetteV2");

export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.onDidSaveTextDocument((_e) => {
		let params = vscode.workspace.getConfiguration('norminettev2');
		if (params.get("auto_launch")) {
				vscode.commands.executeCommand("42-norminette-v2.launchNorm");
		}
	});

	let parseLine = (line: string) => {
		var ret = {line: 0, col: 0, desc: "No error", id: "NO_ERROR"};
		let rgx: RegExp = /(\s*)(\w+)(\s*)(\()(line:\s*)([0-9]+)(,\s*)(col:\s*)([0-9]+)(\):)(\s*)(.+)/;
		let match = rgx.exec(line);
		if (match) {
			ret.line = parseInt(match[6]);
			ret.col = parseInt(match[9]);
			ret.id = match[2];
			ret.desc = match[12][0].toUpperCase() + match[12].slice(1);
		}
		return ret;
	};
	

	let _d0 = vscode.commands.registerCommand('42-norminette-v2.launchNorm', () => {
		let params = vscode.workspace.getConfiguration('norminettev2');
		let bin = params.get("norminette_bin");
		let e = vscode.window.activeTextEditor?.document!;
		if ((e.languageId === "c" ||  e.languageId === "cpp") && e.uri.scheme === "file") {
			const cp = require('child_process');
			let str: string = "";
			str = e.uri.path;
			cp.exec('which ' + bin, (err: string, stdout: string, stderr: string) => {
				if (err) {
					vscode.window.showInformationMessage("Error: " + bin + " was not found");
				}
			});
			cp.exec(bin + ' ' + str + " | tail -n +2", (err: string, stdout: string, stderr: string) => {
				let lines = stdout.split("\n");
				let diagnostics : Diagnostic[] = [];

				diagnosticsCollection.clear();
				for (let line in lines) {
					var obj = parseLine(lines[line]);
					var linePos = e.lineAt(obj.line - 1);
					var r = new vscode.Range(linePos.range.start, linePos.range.end);
					diagnostics.push(new Diagnostic(r, obj.desc + " [" + obj.line + ":" + obj.col + ", " + obj.id + "]", DiagnosticSeverity.Warning));
					diagnosticsCollection.set(e.uri, diagnostics);
				}
			});
		}
	});

	let _d1 = vscode.commands.registerCommand('42-norminette-v2.clear', () => {
		diagnosticsCollection.clear();
	});
	

	context.subscriptions.push(_d0);
	context.subscriptions.push(_d1);
}

// this method is called when your extension is deactivated
export function deactivate() {}
