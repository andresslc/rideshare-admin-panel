import React from "react";

// Helper to extract plain text string from React elements or primitives for hover tooltip title
const getTitleText = (node) => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTitleText).filter(Boolean).join(" ").trim();
  if (React.isValidElement(node)) {
    return getTitleText(node.props?.children);
  }
  return "";
};

const Table = ({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = "No data available",
  className = "",
  defaultMaxWidth = "200px",
}) => {
  return (
    <div className={`overflow-x-auto ${className} max-h-[70vh] relative`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="sticky top-0 left-0 bg-white dark:bg-gray-900 z-10">
          <tr className="shadow-sm shadow-gray-300 dark:shadow-black">
            {columns.map((column) => {
              const isActionCol =
                column.key === "actions" ||
                column.key === "action" ||
                column.key === "select" ||
                column.truncate === false;

              const maxWidth =
                column.maxWidth ||
                (isActionCol ? undefined : defaultMaxWidth);

              return (
                <th
                  key={column.key}
                  style={maxWidth ? { maxWidth } : undefined}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                    isActionCol ? "whitespace-nowrap" : "max-w-[200px]"
                  } ${column.headerClassName || ""}`}
                  title={column.label}
                >
                  <div className="flex items-center space-x-1 min-w-0">
                    <span className="truncate">{column.label}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900"
            >
              {columns.map((column) => {
                const isActionCol =
                  column.key === "actions" ||
                  column.key === "action" ||
                  column.key === "select" ||
                  column.truncate === false;

                const maxWidth =
                  column.maxWidth ||
                  (isActionCol ? undefined : defaultMaxWidth);

                const cellValue = column.render
                  ? column.render(row[column.key], row)
                  : row[column.key];

                const titleText = isActionCol ? "" : getTitleText(cellValue);

                return (
                  <td
                    key={column.key}
                    style={maxWidth ? { maxWidth } : undefined}
                    className={`px-6 py-4 text-sm text-gray-900 dark:text-gray-100 ${
                      isActionCol
                        ? "whitespace-nowrap"
                        : "max-w-[200px] overflow-hidden"
                    } ${column.className || ""}`}
                    title={titleText || undefined}
                  >
                    {isActionCol ? (
                      cellValue
                    ) : (
                      <div
                        style={maxWidth ? { maxWidth } : undefined}
                        className="truncate max-w-[200px] min-w-0 [&_.flex]:min-w-0 [&_.flex]:max-w-full [&_.flex>span]:truncate [&_.flex>div]:min-w-0 [&_.flex>div>p]:truncate [&_.flex>*:first-child]:shrink-0"
                      >
                        {cellValue ?? "—"}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default Table;
