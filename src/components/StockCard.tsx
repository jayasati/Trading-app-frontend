export default function StockCard({ stock }: any) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer">

      <div className="font-semibold text-gray-800">
        {stock.name}
      </div>

      <div className="text-sm text-gray-500">
        {stock.symbol}
      </div>

      <div className="mt-2 text-lg font-semibold text-gray-900">
        ₹ -- 
      </div>

      <div className="text-green-500 text-sm">
        +0.00%
      </div>

    </div>
  );
}