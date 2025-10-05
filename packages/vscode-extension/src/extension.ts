import * as vscode from "vscode";
import core from "@baseline-insight/core-engine";
import { parse } from "parse5";
import postcss from "postcss";
import { parse as jsparse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

export function activate(context: vscode.ExtensionContext) {

    let baselineYear = vscode.workspace.getConfiguration("baselineInsight").get("year", "2017");
    let enableHover = vscode.workspace.getConfiguration("baselineInsight").get("enableHover", true);
    let scanOnSave = vscode.workspace.getConfiguration("baselineInsight").get("scanOnSave", true);
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("baselineInsight.year")) {
            baselineYear = vscode.workspace.getConfiguration("baselineInsight").get("year", "2017");
            vscode.window.showInformationMessage(`Baseline year updated to ${baselineYear}`);
        }
        if (event.affectsConfiguration("baselineInsight.enableHover")) {
            enableHover = vscode.workspace.getConfiguration("baselineInsight").get("enableHover", true);
            vscode.window.showInformationMessage(`Baseline enableHover updated to ${enableHover}`);
        }
        if (event.affectsConfiguration("baselineInsight.scanOnSave")) {
            scanOnSave = vscode.workspace.getConfiguration("baselineInsight").get("scanOnSave", true);
            vscode.window.showInformationMessage(`Baseline scanOnSave updated to ${scanOnSave}`);
        }
    });

    if(enableHover){
        const hoverProvider = vscode.languages.registerHoverProvider(
            [
            { scheme: "file", language: "javascript" }, 
            { scheme: "file", language: "typescript" }, 
            { scheme: "file", language: "css" }, 
            { scheme: "file", language: "html" },
            { scheme: "file", language: "typescriptreact" },
            { scheme: "file", language: "javascriptreact" },
            ],
            {
            provideHover(document, position) {
                const lineText = document.lineAt(position.line).text;

                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) return;
                const word = document.getText(wordRange);

                const lines = [];

                try{
                    //   console.log(lineText, word)
                    const tokens = extractFeatures(document.fileName, lineText, word)
                    //   console.log(tokens)

                    for(const token of tokens){
                        const featureKey = core.findFeature(token.split('|')[0]) ?? core.findFeatureByBCD(token.split('|')[0]);
                        if (!featureKey) continue;

                        const baseline = core.isFeatureInBaseline(featureKey, { year: baselineYear, minBaseline: 'high' });
                        const info = core.getFeatureInfo(featureKey);
                        const support = core.getFeatureSupport(featureKey);

                        lines.push(`**Baseline Insight** — \`${featureKey}\``);
                        lines.push(`- In Baseline ${baselineYear}: **${baseline.inBaseline ? "Yes" : "No"}**`);
                        if (baseline.reason) lines.push(`- Reason: ${baseline.reason}`);
                        if (info?.description) lines.push(`- Description: ${info.description}`);
                        // if (support?.spec) lines.push(`- Spec: ${support.spec}`);
                        lines.push(`\n[Open MDN](${mdnLinkForFeature(featureKey)})`);
                    }
                }catch (err){console.log(err)}
                
                const contents = new vscode.MarkdownString()
                contents.appendMarkdown(lines.join("\n\n"))

                contents.isTrusted = true;
                return new vscode.Hover(contents, wordRange);
            }
            }
        );
        context.subscriptions.push(hoverProvider);
    }

    if(scanOnSave){
        const diagnosticCollection = vscode.languages.createDiagnosticCollection("baseline-insight");
        context.subscriptions.push(diagnosticCollection);

        vscode.workspace.onDidSaveTextDocument((doc) => {
            scanDocumentForDiagnostics(doc, diagnosticCollection, baselineYear);
        });

        if (vscode.window.activeTextEditor) {
            scanDocumentForDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection, baselineYear);
        }
    }
}

function mdnLinkForFeature(featureKey: string) {
    const q = encodeURIComponent(featureKey);
    return `https://developer.mozilla.org/en-US/search?q=${q}`;
}

const tokenRegex = /\b([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+)\b/g;

function extractJsFeatures(code: string, word?: string): string[] {
    let features: string[] = [];

    let ast;
    try {
        ast = jsparse(code, {
        sourceType: "unambiguous",
        plugins: [
            "typescript",
            "jsx",
            "classProperties",
            "objectRestSpread",
            "optionalChaining",
            "nullishCoalescingOperator",
            "dynamicImport",
        ],
        errorRecovery: true
        });

    } catch (err) {
        // console.warn("AST parse failed, falling back to regex", err);
        return code.match(tokenRegex) || [];
    }

    traverse(ast, {
        Identifier(path) {
            if(path.node.loc){
                features.push(`${path.node.name}|${path.node.loc.start.line},${path.node.loc.start.column}:${path.node.loc.end.line},${path.node.loc.end.column}`)
            }else{
                features.push(`${path.node.name}`)
            }
        },
        MemberExpression(path) {
            if (t.isIdentifier(path.node.property)) {
                if(path.node.loc){
                    features.push(`${path.node.property.name}|${path.node.loc.start.line},${path.node.loc.start.column}:${path.node.loc.end.line},${path.node.loc.end.column}`)
                }else{
                    features.push(`${path.node.property.name}`)
                }
            }
            if (t.isIdentifier(path.node.object)) {
                if(path.node.loc){
                    features.push(`${path.node.object.name}|${path.node.loc.start.line},${path.node.loc.start.column}:${path.node.loc.end.line},${path.node.loc.end.column}`)
                }else{
                    features.push(`${path.node.object.name}`)
                }
            }
        },
        CallExpression(path) {
            if (t.isIdentifier(path.node.callee)) {
                if(path.node.loc){
                    features.push(`${path.node.callee.name}|${path.node.loc.start.line},${path.node.loc.start.column}:${path.node.loc.end.line},${path.node.loc.end.column}`)
                }else{
                    features.push(`${path.node.callee.name}`)
                }
            }
            if (t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.property)) {
                if(path.node.loc){
                    features.push(`${path.node.callee.property.name}|${path.node.loc.start.line},${path.node.loc.start.column}:${path.node.loc.end.line},${path.node.loc.end.column}`)
                }else{
                    features.push(`${path.node.callee.property.name}`)
                }
            }
        },
    });
    
    if(word)
        features = features.filter(feature => feature.split('|')[0].endsWith(word))

    return [...new Set(features)];

}

function extractHtmlFeatures(html: string, word?: string): string[] {
    const document = parse(html, { sourceCodeLocationInfo: true });
    let features: string[] = [];

    function walk(node: any) {
        if (node.tagName) {
            if(node.sourceCodeLocation){
                features.push(`html.elements.${node.tagName}|${node.sourceCodeLocation.startLine},${node.sourceCodeLocation.startCol}:${node.sourceCodeLocation.endLine},${node.sourceCodeLocation.endCol}`);
            }else{
                features.push(`html.elements.${node.tagName}`);
            }

            if (node.attrs) {
                node.attrs.forEach((attr: any) => {
                    if(node.sourceCodeLocation && node.sourceCodeLocation.attrs){
                        const sourceCodeLocation = node.sourceCodeLocation.attrs[attr.name]
                        features.push(`html.elements.${node.tagName}.${attr.name}|${sourceCodeLocation.startLine},${sourceCodeLocation.startCol}:${sourceCodeLocation.endLine},${sourceCodeLocation.endCol}`);
                    }else{
                        features.push(`html.elements.${node.tagName}`);
                    }
                });
            }
        }

        if (node.childNodes) {
            node.childNodes.forEach(walk);
        }
    }

    walk(document);

    if(word)
        features = features.filter(feature => feature.split('|')[0].endsWith(word))

    return features;
}

function extractCssFeatures(css: string, word?: string): string[] {
    if(css.endsWith('{')){
        css = css.split('{')[0]
    }
    const root = postcss.parse(css);
    let features: string[] = [];

    root.walkDecls(decl => {
        if(decl.source && decl.source.start){
            features.push(`css.properties.${decl.prop}|${decl.source.start.line},${decl.source.start.column}:${decl.source.end?.line},${decl.source.end?.column}`);
        }else {
            features.push(`css.properties.${decl.prop}`);
        }
    });

    root.walkAtRules(rule => {
        if(rule.source && rule.source.start){
            features.push(`css.at-rules.${rule.name}|${rule.source.start.line},${rule.source.start?.column}:${rule.source.end?.line},${rule.source.end?.column}`);
        }else {
            features.push(`css.at-rules.${rule.name}`);
        }
    });

    if(word)
        features = features.filter(feature => feature.split('|')[0].endsWith(word))

    return features;
}

export function extractFeatures(
  file: string,
  code: string,
  word?: string
): string[] {

    if(file.endsWith('.html')){
        return extractHtmlFeatures(code, word);
    }else if(file.endsWith('.css')){
        return extractCssFeatures(code, word);
    }else if(file.endsWith('.ts')) {
        return extractJsFeatures(code, word);
    }else if(file.endsWith('.tsx')) {
        return [ ...extractJsFeatures(code, word), ...extractHtmlFeatures(code, word)];
    }else if(file.endsWith('.js')) {
        return extractJsFeatures(code, word);
    }else if(file.endsWith('.jsx')) {
        return [ ...extractJsFeatures(code, word), ...extractHtmlFeatures(code, word)];
    }else {
        return []
    }
}

function scanDocumentForDiagnostics(document: vscode.TextDocument, diagnostics: vscode.DiagnosticCollection, baselineYear: string) {
    if (!["javascript", "typescript", "css", "html", "typescriptreact", "javascriptreact"].includes(document.languageId)) return;
    const text = document.getText();
    const diags: vscode.Diagnostic[] = [];
    
    const tokens = extractFeatures(document.fileName, text)

    try{
        for(const token of tokens){
            const featureKey = core.findFeature(token.split('|')[0]) ?? core.findFeatureByBCD(token.split('|')[0]);
            if (!featureKey) continue;

            const baseline = core.isFeatureInBaseline(featureKey, { year: baselineYear, minBaseline: 'high' });

            if (!baseline.inBaseline) {
              
                let startPos = parseInt(token.split('|')[1].split(':')[0].split(',')[0])
                let startCol = parseInt(token.split('|')[1].split(':')[0].split(',')[1])
                let endPos = parseInt(token.split('|')[1].split(':')[1].split(',')[0])
                let endCol = parseInt(token.split('|')[1].split(':')[1].split(',')[1])
                const startPosition = new vscode.Position(startPos-1, startCol-1);
                const endPosition = new vscode.Position(endPos-1, endCol-1);
                // console.log(startPos, startCol, endPos, endCol)
                // console.log(startPos, endPos, token,featureKey )
                const rng = new vscode.Range(startPosition, endPosition);
                const diag = new vscode.Diagnostic(rng, `Feature ${featureKey} from ${token.split('|')[0]} is not in Baseline ${baselineYear}`, vscode.DiagnosticSeverity.Warning);
                diag.source = "baseline-insight";
                diags.push(diag);
            }
        }
    }catch (err){}

    diagnostics.set(document.uri, diags);
}

export function deactivate() {}
