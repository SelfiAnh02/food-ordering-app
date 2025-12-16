import { Outlet, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png"; // pastikan path benar
import NavbarCustomer from "../../components/customer/NavbarCustomer";
import FooterCustomer from "../../components/customer/FooterCustomer";

export default function CustomersLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <NavbarCustomer
        logo={logo}
        brandLine1="Sa'jane"
        brandLine2="Tea & Coffee Bar"
        tableNumber="3"
      />

      {/* tambahkan padding bottom supaya konten tidak tertutup footer fixed
          dan padding top supaya tidak tertutup navbar fixed (header tinggi ~110px -> pt-28 ~112px) */}
      <main className="px-4 pb-24 pt-28">
        {children ? children : <Outlet />}
      </main>

      <FooterCustomer
        active="home"
        cartCount={0}
        onHome={() => navigate("/")}
        onCart={() => navigate("/cart")}
        onOrders={() => navigate("/orders")}
      />
    </div>
  );
}
