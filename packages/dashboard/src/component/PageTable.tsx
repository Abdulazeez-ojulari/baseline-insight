/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigProvider, Table } from "antd";
import React from "react";

class TableData {
    dataSource?: any[];
    column?: any[];
    loading?: boolean;
    total?: number;
    pageSize?: number;
    onPagination?: () => void;
    shouldExpand?: boolean;
    scrollX?: number;
    emptyHeadingText?: string;
    emptyParagraphText?: string;
    rowSelection?: any;
    onRowSelect: (record: any, rowIndex: number | undefined) => void = () => {};
    pageTitle?: string | React.ReactNode;
    tableHeadAction?: React.ReactNode;
    extraItem?: React.ReactNode;
  }

export const PageTable: React.FC<TableData> = ({
  column,
  dataSource,
  loading,
  scrollX,
  onRowSelect,
  pageTitle,
  tableHeadAction,
  extraItem,
  rowSelection,
}) => {

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-[#1B1D21] font-bold font-[satoshi-bold] text-[1.2rem]">
          {pageTitle}
        </h2>
        {tableHeadAction}
      </div>
      {extraItem}
      <ConfigProvider
        theme={{
          components: {
            Table: {
              borderColor:
                (dataSource?.length as number) === 0
                  ? "transparent"
                  : "#DEE4EB",
            },
          },
        }}
      >
        <Table
          columns={column}
          loading={loading}
          dataSource={dataSource}
          className="mt-5"
          // pagination={{
          //   position: ["bottomLeft"],
          //   onChange: onPaginate,
          //   itemRender: (_current: any, type: any, originalElement: any) => {
          //     if (type === "prev") {
          //       return (
          //         <a className="hover:text-[#102e34] flex items-center gap-2">
          //           <Left />
          //           Previous
          //         </a>
          //       );
          //     }
          //     if (type === "next") {
          //       return (
          //         <a className="hover:text-[#102e34] flex items-center gap-2">
          //           Next <Right />
          //         </a>
          //       );
          //     }
          //     return originalElement;
          //   },
          //   showSizeChanger: false,
          //   hideOnSinglePage: true,
          //   total,
          //   pageSize,
          //   // showTotal: (total: number) => {
          //   //   return(
          //   //   <p className="text-[0.9rem] text-[fig-regular]">
          //   //     <span className="text-[#102e34]">Showing </span>{" "}
          //   //     <span className="font-medium">
          //   //       Page {state.page + 1} of {total}
          //   //     </span>
          //   //   </p>
          //   // )},
          // }}
          onRow={(record: any, index: number | undefined) => {
            return {
              className: "cursor-pointer",
              onClick: async () => {
                onRowSelect(record, index);
              },
            };
          }}
          scroll={{ x: scrollX ? scrollX : 800 }}
          locale={{
            emptyText: (
              <div className="h-60 grid gap-3 place-content-center">
                <div className="mx-auto">
                  {/* <NoDataFound /> */}
                </div>
                <h1 className="text-[#102e34] text-[1.3rem] font-[satoshi-bold] font-bold">
                  No data found
                </h1>
                <p className="text-[#8593A3] text-[0.9rem] font-[satoshi-light] font-extralight">
                  We cant find any data for this page
                </p>
              </div>
            ),
          }}
          rowSelection={
            rowSelection
              ? {
                  ...rowSelection,
                }
              : undefined
          }
        />
      </ConfigProvider>
    </>
  );
};
