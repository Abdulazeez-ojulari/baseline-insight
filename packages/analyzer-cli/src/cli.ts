#!/usr/bin/env node
import { Command } from "commander";
import fg from "fast-glob";
import fs from "fs";
import path from "path";
import core from "@baseline-insight/core-engine";

const program = new Command();

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
    const patterns = ["**/*.{js,ts,jsx,tsx,html}"];
    const entries = await fg(patterns, {
      cwd: projectDir,
      ignore: ["node_modules/**", ".git/**", "dist/**"]
    });

    const found: Record<string, { count: number; samples: string[]; baseline: any }> = {};

    const tokenRegex = /\b([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+)\b/g;

    for (const rel of entries) {
      const file = path.join(projectDir, rel);
      try {
        const content = fs.readFileSync(file, "utf8");
        let m;
        while ((m = tokenRegex.exec(content)) !== null) {
          // console.log('dfgerre')
          const token = m[1];
          // match token to a feature in web-features
          const featureKey = core.findFeature(token);
          console.log(featureKey, token)
          if (featureKey) {
            if (!found[featureKey]) found[featureKey] = { count: 0, samples: [], baseline: null };
            found[featureKey].count++;
            if (found[featureKey].samples.length < 5) found[featureKey].samples.push(`${rel}:${m.index}`);
          }
        }
      } catch (err) {
        // console.log(err, 'aevwev')
      }
    }

    // console.log(found)
    // console.log(entries)
    for (const key of Object.keys(found)) {
      console.log(key)
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
