// src/components/BaselineReport.tsx
import React, { useEffect, useState } from "react";
import { PageTable } from "./component/PageTable";
// import reportData from "../baseline-report.json";

type Feature = {
  featureId: string;
  count: number;
  samples: string[];
  info: {
    name: string;
    description: string;
  };
  baseline: {
    inBaseline: boolean;
    achieved: string;
    reason: string;
  };
};

type Report = {
  scannedFiles: number;
  baselineYear: string;
  features: Array<Feature>;
  generatedAt: string;
};

const BaselineReport: React.FC = () => {
  const [report, setReport] = useState<Report | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
  
  fetch("/baseline-report.json").then(async (r) => {
    
    if (r.ok) {
      const json = await r.json();
      let features: Feature[] = Object.entries(json.features).map(
        ([featureId, data]: [string, any]) => ({
          featureId,
          ...data,
        })
      )

      features = features.sort((a, b) => {
        
        if (a.baseline.inBaseline !== b.baseline.inBaseline) {
          return a.baseline.inBaseline ? 1 : -1;
        }
        
        return a.baseline.reason.localeCompare(b.baseline.reason);
      });

      setIsLoading(false)
      json.features = features
      setReport(json)

    } else {
      setIsLoading(false)
    }
  }).catch(() => {
      setIsLoading(false)
    });
  }, [])

  const columns = [
    {
      title: () => {
        return (
          <p className="text-[0.8rem] font-medium font-[satoshi-medium] text-[#213547]">
            Feature
          </p>
        );
      },
      key: "feature",
      fixed: "left",
      width: 200,
      render: (_: any, record: Feature) => {
        return (
          <span className="">
            <p className="">
              {record?.info.name ?? "-"}
            </p>
          </span>
        );
      },
    },
    {
      title: () => {
        return (
          <p className="text-[0.8rem] font-medium font-[satoshi-medium] text-[#213547]">
            Description
          </p>
        );
      },
      render: (_: any, record: Feature) => {
        return (
          <span className="">
            <p className="">
              {record?.info.description ?? "-"}
            </p>
          </span>
        );
      },
      key: "description",
    },
    {
      title: () => {
        return (
          <p className="text-[0.8rem] font-medium font-[satoshi-medium] text-[#213547]">
            In Baseline?
          </p>
        );
      },
      key: "In Baseline?",
      width: 200,
      render: (_: any, record: Feature) => {
        return (
          <span className="">
            <p className="">
              {record.baseline.inBaseline ? (
                <span className="text-green-600 font-semibold">Yes ✅</span>
              ) : (
                <span className="text-red-600 font-semibold">No ❌</span>
              )}
            </p>
          </span>
        );
      },
    },
    {
      title: () => {
        return (
          <p className="text-[0.8rem] font-medium font-[satoshi-medium] text-[#213547]">
            Reason
          </p>
        );
      },
      key: "Reason",
      width: 150,
      render: (_: any, record: Feature) => {
        return (
          <span className="">
            <p className="">{record?.baseline.reason ?? "-"}</p>
          </span>
        );
      },
    },
  ];

  if (!report) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Baseline Insight Dashboard</h1>
        <p>No `baseline-report.json` found in the public root. Run the CLI and place the report at <code>/public/baseline-report.json</code>.</p>
      </main>
    );
  }

  const features = Object.entries(report.features);
  const total = features.length;
  const nonBaseline = features.filter(([, v]) => !v.baseline?.inBaseline).length;
  const baselineCount = total - nonBaseline;


  return (
    <div className="p-4 md:p-6 py-10 h-full">
      <h1 className="text-2xl font-bold font-[satoshi-bold]">Baseline Report</h1>
      <p className="text-[0.8rem] font-medium font-[satoshi-medium] text-[#213547]">Report generated: {report.generatedAt}</p>
      <p className="text-[0.8rem] font-medium font-[satoshi-medium] text-[#213547]">Scanned files: {report.scannedFiles}</p>
      <h2 className="text-[0.8rem] font-bold font-[satoshi-bold] text-[#213547]">Summary</h2>
      <p className="text-[0.8rem] font-medium font-[satoshi-medium] text-[#213547]">
        Baseline {report.baselineYear}: {baselineCount}/{total} features included. Non-Baseline: {nonBaseline}
      </p>
      <div className="overflow-auto h-full mt-5 min-h-[70svh]">
        <PageTable
          onRowSelect={() => {}}
          column={columns}
          dataSource={report.features}
          loading={isLoading}
          total={features?.length}
          // pageSize={state.limit}
        />
      </div>
    </div>
  );
};

export default BaselineReport;
