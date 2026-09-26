import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import './DataTable.css';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No records found matching criteria.',
  onRowClick = null,
  pageSize = 10,
  showPagination = true,
  className = '',
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = showPagination ? data.slice(startIndex, startIndex + pageSize) : data;

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  return (
    <div className={`datatable-container ${className}`}>
      <div className="datatable-scroll-wrapper">
        <table className="custom-datatable">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.header || idx}
                  style={{
                    width: col.width || 'auto',
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, rIdx) => {
                const rowKey = row[keyField] || rIdx;
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={onRowClick ? 'clickable-row' : ''}
                  >
                    {columns.map((col, cIdx) => {
                      let cellContent;
                      if (typeof col.render === 'function') {
                        cellContent = col.render(row, rIdx);
                      } else if (typeof col.accessor === 'function') {
                        cellContent = col.accessor(row);
                      } else {
                        cellContent = row[col.accessor];
                      }

                      return (
                        <td
                          key={cIdx}
                          style={{ textAlign: col.align || 'left' }}
                        >
                          {cellContent !== undefined && cellContent !== null ? cellContent : '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="datatable-empty-cell">
                  <div className="datatable-empty-state">
                    <Inbox size={32} className="empty-icon" />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination && data.length > pageSize && (
        <div className="datatable-pagination">
          <span className="pagination-info">
            Showing <strong className="text-white">{startIndex + 1}</strong> to{' '}
            <strong className="text-white">{Math.min(startIndex + pageSize, data.length)}</strong> of{' '}
            <strong className="text-white">{data.length}</strong> entries
          </span>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              onClick={handlePrev}
              disabled={currentPage === 1}
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <span className="pagination-page-indicator">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="pagination-btn"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
