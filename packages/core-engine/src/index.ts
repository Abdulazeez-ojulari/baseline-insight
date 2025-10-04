// packages/core-engine/src/index.ts

import { features as rawFeatures } from "web-features";

type BaselineLevel = false | "low" | "high";

type WFStatus = {
  baseline?: BaselineLevel;
  baseline_low_date?: string;
  baseline_high_date?: string;
  support?: Record<string, string | boolean | undefined>;
};

type WFFeature = {
  caniuse?: string;
  compat_features?: string[];
  description?: string;
  description_html?: string;
  group?: string;
  name?: string;
  spec?: string;
  status?: WFStatus;
};

const features: Record<string, WFFeature> = (rawFeatures as unknown) as Record<string, WFFeature>;

function normalize(s?: string) {
  return (s || "").toString().trim().toLowerCase();
}

function parseYear(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    console.log('trying to parse year')
    const m = String(dateStr).match(/^\s*(\d{4})\s*$/);
    if (m) return Number(m[1]);
    return null;
  }
  return d.getUTCFullYear();
}

function baselineRank(level: BaselineLevel | undefined | null): number {
  // console.log('ranking')
  if (level === "high") return 2;
  if (level === "low") return 1;
  return 0;
}

function findFeature(query: string): string | null {
  if (!query) return null;
  const q = normalize(query);

  if (features[q]) return q;

  if (features[query]) return query;

  for (const key of Object.keys(features)) {
    const entry = features[key];
    if (key.toLowerCase() === q) return key;
    // if (normalize(entry.name).includes(q) && entry.name) return key;
    
    if (Array.isArray(entry.caniuse)) {
      for (const c of entry.caniuse) {
        if (c && c.toLowerCase() === q) return key;
      }
    }else{
      if (entry.caniuse && entry.caniuse.toLowerCase() === q) return key;
    }
    
    if (Array.isArray(entry.compat_features)) {
      for (const c of entry.compat_features) {
        // console.log(c, 'bdc')
        if(c.toLowerCase() === q || c.toLowerCase().endsWith(`.${q}`)) return key
        
      }
    }
    
    // if ((entry.description && normalize(entry.description).includes(q)) || (entry.description_html && normalize(entry.description_html).includes(q))) {
    //   return key;
    // }
  }

  // const last = query.split(".").slice(-1)[0];
  // if (last && last !== query) {
  //   for (const key of Object.keys(features)) {
  //     const entry = features[key];
  //     if (normalize(entry.name).includes(normalize(last))) return key;
  //   }
  // }

  return null;
}


function findFeatureByBCD(bcdKey: string): string | null {
  if (!bcdKey) return null;
  const q = bcdKey.toString();
  // console.log(q, 'bdckey')
  for (const key of Object.keys(features)) {
    const entry = features[key];
    if (Array.isArray(entry.compat_features)){
      for (const c of entry.compat_features) {
        // console.log(c, 'bdc')
        if(c.toLowerCase() === q || c.toLowerCase().endsWith(`.${q}`)) return key

      }
    }
    // if (Array.isArray(entry.compat_features) && entry.compat_features.includes(q)) return key;
  }
  return null;
}

function getFeatureInfo(featureKey: string) {
  const entry = features[featureKey];
  if (!entry) return null;
  return {
    name: entry.name ?? null,
    description: entry.description ?? entry.description_html ?? null,
    caniuse: entry.caniuse ?? null,
    compat_features: entry.compat_features ?? [],
    group: entry.group ?? null,
    spec: entry.spec ?? null,
  };
}

function isFeatureInBaseline(
  featureKey: string,
  opts?: { year?: number | string; minBaseline?: "low" | "high" }
) {
  const entry = features[featureKey];
  if (!entry) return { inBaseline: false, reason: "feature not found" };

  const status = (entry.status || {}) as WFStatus;
  const minBaseline = opts?.minBaseline ?? "low";

  if (!opts?.year) {
    const baseline = status.baseline ?? false;
    const achieved: "none" | "low" | "high" = baseline === "high" ? "high" : baseline === "low" ? "low" : "none";
    const inBaseline = baselineRank(baseline) >= baselineRank(minBaseline as BaselineLevel);
    return { inBaseline, achieved, reason: `status:${String(baseline)}` };
  }

  const year = Number(opts.year);
  if (Number.isNaN(year)) return { inBaseline: false, reason: "invalid year" };

  const highYear = parseYear(status.baseline_high_date ?? null);
  const lowYear = parseYear(status.baseline_low_date ?? null);
  // console.log('highYear', 'lowYear')
  // console.log(highYear, lowYear)
  // console.log(status.baseline)

  let achievedLevel: "none" | "low" | "high" = "none";
  let achievedAtYear: number | null = null;

  if (highYear !== null && highYear <= year) {
    achievedLevel = "high";
    achievedAtYear = highYear;
  } else if (lowYear !== null && lowYear <= year) {
    achievedLevel = "low";
    achievedAtYear = lowYear;
  } else if (highYear === null && lowYear === null) {
    if (status.baseline === "high") {
      achievedLevel = "high";
    } else if (status.baseline === "low") {
      achievedLevel = "low";
    }
  }

  const inBaseline = baselineRank(achievedLevel === "none" ? (false as BaselineLevel) : (achievedLevel as BaselineLevel)) >= baselineRank(minBaseline as BaselineLevel);

  return { inBaseline, achieved: achievedLevel, achievedAtYear, reason: inBaseline ? "meets threshold" : "below threshold" };
}

function getFeatureSupport(featureKey: string) {
  const entry = features[featureKey];
  if (!entry) return null;
  return (entry.status && (entry.status.support ?? null)) ?? null;
}

export default {
  findFeature,
  findFeatureByBCD,
  getFeatureInfo,
  isFeatureInBaseline,
  getFeatureSupport,
  // _raw: features
};
