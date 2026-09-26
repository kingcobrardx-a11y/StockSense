import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './DataTable.css';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  pageSize = 10,
  searchQuery = '',
  searchFields = [],
  onRowClick,
  emptyMessage = 'No records found',
  isLoading = false,
  className = '',
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data by search query if provided
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();

    return data.filter((item) => {
      // If searchFields are specified, only search those
      if (searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
        });
      }
      // Otherwise search all column accessors
      return columns.some((col) => {
        if (!col.accessor) return false;
        const val = item[col.accessor];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchFields, columns]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, validCurrentPage, pageSize]);

  return (
    <div className={`data-table-container ${className}`}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`th-cell ${col.align ? `align-${col.align}` : ''}`}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="table-loading-cell">
                  <div className="table-spinner" />
                  <span>Loading data...</span>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row[keyField] || rowIdx}
                  className={`table-row ${onRowClick ? 'row-clickable' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`td-cell ${col.align ? `align-${col.align}` : ''}`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {!isLoading && filteredData.length > pageSize && (
        <div className="table-pagination">
          <div className="pagination-info">
            Showing <strong>{(validCurrentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(validCurrentPage * pageSize, filteredData.length)}</strong> of{' '}
            <strong>{filteredData.length}</strong> results
          </div>

          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={validCurrentPage === 1}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="page-indicator">
              Page {validCurrentPage} of {totalPages}
            </span>

            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={validCurrentPage === totalPages}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="page-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
