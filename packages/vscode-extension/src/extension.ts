import * as vscode from "vscode";
import core from "@baseline-insight/core-engine";
import { parse } from "parse5";
import postcss from "postcss";

export function activate(context: vscode.ExtensionContext) {

  const baselineYear = vscode.workspace.getConfiguration("baselineInsight").get("year", "2023");

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
          console.log(lineText, word)
          const tokens = extractFeatures(document.fileName, lineText, word)
          console.log(tokens)

          for(const token of tokens){
            const featureKey = core.findFeature(token) ?? core.findFeatureByBCD(token);
            if (!featureKey) break;

            const baseline = core.isFeatureInBaseline(featureKey, { year: baselineYear });
            const info = core.getFeatureInfo(featureKey);
            const support = core.getFeatureSupport(featureKey);

            lines.push(`**Baseline Insight** — \`${featureKey}\``);
            lines.push(`- In Baseline ${baselineYear}: **${baseline.inBaseline ? "Yes" : "No"}**`);
            if (baseline.reason) lines.push(`- Reason: ${baseline.reason}`);
            if (info?.description) lines.push(`- Description: ${info.description}`);
            // if (support?.spec) lines.push(`- Spec: ${support.spec}`);
            lines.push(`\n[Open MDN](${mdnLinkForFeature(featureKey)})`);
          }
        }catch (err){}
        
        const contents = new vscode.MarkdownString()
        contents.appendMarkdown(lines.join("\n\n"))

        contents.isTrusted = true;
        return new vscode.Hover(contents, wordRange);
      }
    }
  );

  context.subscriptions.push(hoverProvider);
}

function mdnLinkForFeature(featureKey: string) {
  const q = encodeURIComponent(featureKey);
  return `https://developer.mozilla.org/en-US/search?q=${q}`;
}

const tokenRegex = /\b([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+)\b/g;

function extractJsFeatures(code: string): string[] {
  const features: string[] = [];
  let match;
  while ((match = tokenRegex.exec(code)) !== null) {
    features.push(match[1]);
  }
  return features;
}

function extractHtmlFeatures(html: string, word: string): string[] {
  const document = parse(html);
  const features: string[] = [];

  function walk(node: any) {
    if (node.tagName) {
      features.push(`html.elements.${node.tagName}`);

      if (node.attrs) {
        node.attrs.forEach((attr: any) => {
          features.push(`html.attributes.${node.tagName}.${attr.name}`);
        });
      }
    }

    if (node.childNodes) {
      node.childNodes.forEach(walk);
    }
  }

  walk(document);

  let feature = features.filter(feature => feature.endsWith(word))
  return feature;
}

function extractCssFeatures(css: string): string[] {
  if(css.endsWith('{')){
    css = css.split('{')[0]
  }
  const root = postcss.parse(css);
  const features: string[] = [];

  root.walkDecls(decl => {
    features.push(`css.properties.${decl.prop}`);
  });

  root.walkAtRules(rule => {
    features.push(`css.at-rules.${rule.name}`);
  });

  return features;
}

export function extractFeatures(
  file: string,
  code: string,
  word: string
): string[] {

  if(file.endsWith('.html')){
    return extractHtmlFeatures(code, word);
  }else if(file.endsWith('.css')){
    return extractCssFeatures(code);
  }else if(file.endsWith('.ts')) {
    return extractJsFeatures(code);
  }else if(file.endsWith('.tsx')) {
    return extractJsFeatures(code);
  }else if(file.endsWith('.js')) {
    return extractJsFeatures(code);
  }else if(file.endsWith('.jsx')) {
    return extractJsFeatures(code);
  }else {
    return []
  }
}

export function deactivate() {}
