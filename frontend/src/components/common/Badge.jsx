export function Badge({
  children,
  variant = 'neutral', // 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'receipt' | 'delivery' | 'transfer' | 'adjustment'
  size = 'md',        // 'sm' | 'md'
  dot = false,
  className = '',
}) {
  const normVariant = variant ? variant.toLowerCase() : 'neutral';
  
  return (
    <span className={`badge badge-${normVariant} badge-${size} ${className}`.trim()}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function TransactionBadge({ type }) {
  const map = {
    RECEIPT: { label: 'Receipt', variant: 'receipt' },
    DELIVERY: { label: 'Delivery', variant: 'delivery' },
    TRANSFER: { label: 'Transfer', variant: 'transfer' },
    ADJUSTMENT: { label: 'Adjustment', variant: 'adjustment' },
  };

  const item = map[type] || { label: type || 'Unknown', variant: 'neutral' };
  return (
    <Badge variant={item.variant} dot>
      {item.label}
    </Badge>
  );
}

export function StockStatusBadge({ quantity, reorderLevel }) {
  const qty = Number(quantity) || 0;
  const reorder = Number(reorderLevel) || 0;

  if (qty <= 0) {
    return (
      <Badge variant="danger" dot>
        Out of Stock
      </Badge>
    );
  }

  if (qty <= reorder) {
    return (
      <Badge variant="warning" dot>
        Low Stock ({qty})
      </Badge>
    );
  }

  return (
    <Badge variant="success" dot>
      In Stock ({qty})
    </Badge>
  );
}
