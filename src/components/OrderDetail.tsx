interface OrderData {
  date: string;
  location: string;
  orderNumber: string;
  hasQR: boolean;
}

export function OrderDetail({ data }: { data: OrderData }) {
  return (
    <div className="px-6 pb-4 pl-[calc(56px+1.5rem)]">
      <div className="border border-border p-4 font-mono text-xs space-y-1.5 bg-background">
        <div className="grid grid-cols-[100px_1fr] gap-1">
          <span className="text-muted-foreground">Date</span>
          <span>{data.date}</span>
        </div>
        <div className="grid grid-cols-[100px_1fr] gap-1">
          <span className="text-muted-foreground">Location</span>
          <span>{data.location}</span>
        </div>
        <div className="grid grid-cols-[100px_1fr] gap-1">
          <span className="text-muted-foreground">Order No.</span>
          <span>{data.orderNumber}</span>
        </div>
        {data.hasQR && (
          <div className="grid grid-cols-[100px_1fr] gap-1 items-start pt-2">
            <span className="text-muted-foreground">QR Code</span>
            <div className="w-16 h-16 border border-border bg-foreground/5 flex items-center justify-center">
              <span className="text-muted-foreground text-[10px]">QR</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
