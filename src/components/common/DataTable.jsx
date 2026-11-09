import {
  Search,
  Download,
  Plus,
  RefreshCcw,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import Table from "../ui/Table";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { PAGINATION_CONFIG } from "../../config/constants";

const getPageNumbers = (currentPage, totalPages) => {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

const DataTable = ({
  data = [],
  columns = [],
  title,
  searchable = false,
  exportable = false,
  addButton = true,
  onAdd,
  onExport,
  loading = false,
  emptyMessage = "No data available",
  totalPages = 1,
  totalData = 0,
  currentPage = 1,
  pageSize = PAGINATION_CONFIG.defaultPageSize,
  searchTerm = "",
  searchPlaceholder = "Search...",
  onPageChange,
  onPageSizeChange,
  onSearch,
  selectedUsers = [],
  handleBulkSuspend,
  handleBulkUnsuspend,
  handleExportCSV,
  exportBTn
}) => {
  // Export handler
  const handleExport = () => {
    if (onExport) {
      // Call custom export function and get formatted data
      const formattedData = onExport(data);

      if (!formattedData || formattedData.length === 0) {
        console.warn("No data to export");
        return;
      }

      // Get headers from the first row keys
      const headers = Object.keys(formattedData[0]);

      // Create CSV content
      const csvContent = [
        // Header row
        headers.map((header) => `"${header}"`).join(","),
        // Data rows
        ...formattedData.map((row) =>
          headers
            .map((header) => {
              let value = row[header] || "";
              // Clean and escape for CSV
              value = value.toString().replace(/"/g, '""');
              return `"${value}"`;
            })
            .join(",")
        ),
      ].join("\n");

      // Create and download file
      const BOM = "\uFEFF"; // Byte Order Mark for proper UTF-8 encoding
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${title?.replace(/\s+/g, "_") || "data"}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } else {
      // Fallback to original logic if no custom export function
      const csv = [
        columns.map((col) => col.label).join(","),
        ...data.map((row) =>
          columns.map((col) => row[col.key] || "").join(",")
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "data"}.csv`;
      a.click();
    }
  };

  const handleSearch = (e) => {
    if (loading) return;

    onSearch && onSearch(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
          )}
          {/* <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalData)} of {totalData} results
          </p> */}
        </div>
        <div className="flex items-center space-x-2">
          {/* {exportable && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              icon={<Download className="w-4 h-4" />}
              disabled={loading}
            >
              Export
            </Button>
          )} */}
          {addButton && onAdd && (
            <Button
              size="sm"
              onClick={onAdd}
              icon={<Plus className="w-4 h-4" />}
              disabled={loading}
            >
              Add New
            </Button>
          )}
          {exportBTn && (
            <div className="flex space-x-2 ">
              <Button
                variant="outline"
                onClick={handleBulkSuspend}
                disabled={selectedUsers.length === 0}
              >
                Suspend Selected
              </Button>

              <Button
                variant="outline"
                onClick={handleBulkUnsuspend}
                disabled={selectedUsers.length === 0}
              >
                Reinstate Selected
              </Button>

              <Button variant="secondary" onClick={handleExportCSV}>
                Export CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        {searchable && (
          <div className="flex-1 max-w-md">
            <Input
              placeholder={searchPlaceholder || "Search..."}
              value={searchTerm}
              onChange={(e) => handleSearch(e)}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
              rightIcon={
                searchTerm ? (
                  <button
                    type="button"
                    onClick={() => handleSearch({ target: { value: "" } })}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null
              }
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <RefreshCcw className={`animate-spin text-primary-600`} />{" "}
            <span className="text-gray-400">Loading...</span>
          </div>
        ) : (
          <Table data={data} columns={columns} loading={loading} emptyMessage={emptyMessage} />
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
          <select
            name="pageSize"
            id="pageSize"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
            value={pageSize}
            onChange={(e) =>
              onPageSizeChange && onPageSizeChange(Number(e.target.value))
            }
          >
            {PAGINATION_CONFIG.pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            entries
          </span>
        </div>
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-1 max-w-full">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || loading}
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
            >
              <ChevronLeft size={20} />
            </Button>
            {getPageNumbers(currentPage, totalPages).map((page, index) => (
              page === "..." ? (
                <span key={`dots-${index}`} className="px-2 py-1 text-gray-500">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "primary" : "outline"}
                  disabled={loading}
                  size="sm"
                  onClick={() => onPageChange && onPageChange(page)}
                >
                  {page}
                </Button>
              )
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || loading}
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
