#!/usr/bin/env node
import { Command } from "commander";
import fg from "fast-glob";
import fs from "fs";
import path from "path";
import core from "@baseline-insight/core-engine";
import { parse } from "parse5";
import postcss from "postcss";

const program = new Command();

type FileType = ".js" | ".html" | ".css" | ".ts" | ".jsx" | ".tsx"

const tokenRegex = /\b([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+)\b/g;

function extractJsFeatures(code: string): string[] {
  const features: string[] = [];
  let match;
  while ((match = tokenRegex.exec(code)) !== null) {
    features.push(match[1]);
  }
  return features;
}

function extractHtmlFeatures(html: string): string[] {
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
  return features;
}

function extractCssFeatures(css: string): string[] {
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
  code: string,
  type: FileType
): string[] {
  switch (type) {
    case ".js":
      return extractJsFeatures(code);
    case ".ts":
      return extractJsFeatures(code);
    case ".tsx":
      return extractJsFeatures(code);
    case ".jsx":
      return extractJsFeatures(code);
    case ".html":
      return extractHtmlFeatures(code);
    case ".css":
      return extractCssFeatures(code);
    default:
      return [];
  }
}

program
  .name("baseline-insight")
  .description("Scan a project and generate Baseline compatibility report")
  .option("-d, --dir <dir>", "Directory to scan", ".")
  .option("-o, --out <file>", "Output file", "baseline-report.json")
  .option("-y, --year <year>", "Baseline year target", "2023")
  .action(async (opts) => {
    console.log(process.cwd())
    const projectDir = path.resolve(process.cwd(), opts.dir);
    console.log(projectDir)
    const patterns = ["**/*.{js,ts,jsx,tsx,html,css}"];
    const entries = await fg(patterns, {
      cwd: projectDir,
      ignore: ["node_modules/**", ".git/**", "dist/**"]
    });

    const found: Record<string, { 
      count: number; 
      samples: string[];
      featureId: string;
      info: ReturnType<typeof core.getFeatureInfo> | null;
      baseline: ReturnType<typeof core.isFeatureInBaseline> | null;
      support: ReturnType<typeof core.getFeatureSupport>;
     }> = {};

    for (const rel of entries) {
      const file = path.join(projectDir, rel);
      const extname = path.extname(file) as FileType
      console.log(extname)

      try {
        const content = fs.readFileSync(file, "utf8");
        const tokens = extractFeatures(content, extname);
        for(const token of tokens){
          console.log(token)
          const featureKey = (core.findFeature(token)) || core.findFeatureByBCD(token);
          console.log(featureKey)
          if (featureKey) {
            // if (!found[featureKey]) found[featureKey] = { count: 0, samples: [], baseline: null };
            if (!found[featureKey]) {
              const info = core.getFeatureInfo(featureKey);
              found[featureKey] = {
                count: 0,
                featureId: featureKey,
                samples: [],
                info,
                baseline: core.isFeatureInBaseline(featureKey, { year: new Date().getUTCFullYear() }),
                support: core.getFeatureSupport(featureKey),
              };
            }
            found[featureKey].count++;
            if (found[featureKey].samples.length < 5) found[featureKey].samples.push(`${rel}`);
          }
        }

      } catch (err) {
        // console.log(err, 'aevwev')
      }
    }

    // console.log(found)
    // console.log(entries)
    for (const key of Object.keys(found)) {
      // console.log(key)
      const info = core.isFeatureInBaseline(key, opts.year);
      found[key].baseline = info;
    }

    const report = {
      scannedFiles: entries.length,
      baselineYear: opts.year,
      features: found,
      generatedAt: new Date().toISOString()
    };

    fs.writeFileSync(path.resolve(opts.out), JSON.stringify(report, null, 2), "utf8");
    console.log(`Baseline report added to ${opts.out}`);
  });

program.parse();
