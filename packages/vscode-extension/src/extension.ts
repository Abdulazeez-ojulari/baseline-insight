import * as vscode from "vscode";
import core from "@baseline-insight/core-engine";

export function activate(context: vscode.ExtensionContext) {

  const baselineYear = vscode.workspace.getConfiguration("baselineInsight").get("year", "2023");

  const hoverProvider = vscode.languages.registerHoverProvider(
    [{ scheme: "file", language: "javascript" }, { scheme: "file", language: "typescript" }, { scheme: "file", language: "css" }, { scheme: "file", language: "html" }],
    {
      provideHover(document, position) {
        // const lineText = document.lineAt(position.line).text;

        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) return;
        const word = document.getText(wordRange);

        const featureKey = core.findFeature(word) ?? core.findFeatureByBCD(word);
        if (!featureKey) return;

        const baseline = core.isFeatureInBaseline(featureKey, { year: baselineYear });
        const support = core.getFeatureSupport(featureKey);

        const lines = [];
        lines.push(`**Baseline Insight** — \`${featureKey}\``);
        lines.push(`- In Baseline ${baselineYear}: **${baseline.inBaseline ? "Yes" : "No"}**`);
        if (baseline.reason) lines.push(`- Reason: ${baseline.reason}`);
        if (support?.spec) lines.push(`- Spec: ${support.spec}`);
        lines.push(`\n[Open MDN](${mdnLinkForFeature(featureKey)})`);
        
        const contents = new vscode.MarkdownString()
        contents.appendMarkdown(lines.join("\n\n"))

        contents.isTrusted = true;
        return new vscode.Hover(contents, wordRange);
      }
    }
  );

  context.subscriptions.push(hoverProvider);

  const diagnosticCollection = vscode.languages.createDiagnosticCollection("baseline-insight");
  context.subscriptions.push(diagnosticCollection);

}

function mdnLinkForFeature(featureKey: string) {
  const q = encodeURIComponent(featureKey);
  return `https://developer.mozilla.org/en-US/search?q=${q}`;
}

export function deactivate() {}
