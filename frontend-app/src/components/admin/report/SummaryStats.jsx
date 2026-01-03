export default function SummaryStats({
  totalOrders = 0,
  totalRevenue = 0,
  cancelledOrders = 0,
  avgOrderValue = 0,
}) {
  const fmtMoney = (n) =>
    n.toLocaleString(undefined, { style: "currency", currency: "IDR" });

  return (
    <div className="rounded-xl border border-amber-300 p-6 shadow-sm bg-white">
      <div className="flex flex-wrap items-center justify-center gap-8 text-center">
        <div>
          <p className="text-2xl md:text-3xl font-bold text-amber-700">
            {totalOrders}
          </p>
          <p className="text-sm text-gray-600">Total Pesanan</p>
        </div>
        <div className="h-12 w-px bg-amber-200 hidden sm:block" />
        <div>
          <p className="text-2xl md:text-3xl font-bold text-amber-700">
            {fmtMoney(totalRevenue)}
          </p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
        <div className="h-12 w-px bg-amber-200 hidden sm:block" />
        <div>
          <p className="text-2xl md:text-3xl font-bold text-amber-700">
            {cancelledOrders}
          </p>
          <p className="text-sm text-gray-600">Pesanan Batal</p>
        </div>
        <div className="h-12 w-px bg-amber-200 hidden sm:block" />
        <div>
          <p className="text-2xl md:text-3xl font-bold text-amber-700">
            {fmtMoney(avgOrderValue)}
          </p>
          <p className="text-sm text-gray-600">Rata-rata Order</p>
        </div>
      </div>
    </div>
  );
}
