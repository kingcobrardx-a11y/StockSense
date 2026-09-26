export function Table({ children, className = '' }) {
  return (
    <div className="table-responsive">
      <table className={`data-table ${className}`.trim()}>{children}</table>
    </div>
  );
}

export function TableHead({ children }) {
  return <thead className="table-head">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody className="table-body">{children}</tbody>;
}

export function TableRow({ children, className = '', onClick }) {
  const clickableClass = onClick ? 'table-row-clickable' : '';
  return (
    <tr className={`table-row ${clickableClass} ${className}`.trim()} onClick={onClick}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children, className = '', align = 'left', ...props }) {
  return (
    <th className={`table-header-cell align-${align} ${className}`.trim()} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', align = 'left', ...props }) {
  return (
    <td className={`table-cell align-${align} ${className}`.trim()} {...props}>
      {children}
    </td>
  );
}
