// frontend-app/src/pages/staff/Dashboard.jsx
import CategoryTabs from "../../components/staff/CategoryTabs";
import ProductList from "../../components/staff/ProductList";
import OrderCart from "../../components/staff/OrderCart";

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>
      <div className="flex gap-4">
        <CategoryTabs />
        <ProductList />
        <OrderCart />
      </div>
    </div>
  );
}
