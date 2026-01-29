import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/Products';
import OrdersPage from './pages/Orders';
import AnalyticsPage from './pages/Analytics';
import GenericPage from './pages/GenericPage';
import AdminPage from './pages/Admin';
import BrandsPage from './pages/Brands';
import CategoriesPage from './pages/Categories';
import CustomersPage from './pages/Customers';
import ActiveCartsPage from './pages/ActiveCarts';
import CouponsPage from './pages/Coupons';
import PricingTiersPage from './pages/PricingTiers';
import MarketingPage from './pages/Marketing';
import { USERS } from './data';
import { Badge } from './components/Common';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/active-carts" element={<ActiveCartsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/pricing" element={<PricingTiersPage />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />

          <Route path="/users" element={
            <GenericPage 
              title="Users" 
              description="Manage system access and roles."
              data={USERS}
              columns={[
                { header: 'User', accessor: (item: any) => (
                   <div>
                     <div className="font-medium text-slate-900">{item.name}</div>
                     <div className="text-xs text-slate-500">{item.email}</div>
                   </div>
                )},
                { header: 'Role', accessor: (item: any) => (
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                     {item.role}
                   </span>
                )},
                { header: 'Status', accessor: (item: any) => (
                  <Badge variant={item.status === 'Active' ? 'success' : 'danger'}>{item.status}</Badge>
                )}
              ]}
              actionLabel="Add User"
            />
          } />

          {/* Placeholders for other routes to ensure navigation works visually */}
          <Route path="/loyalty" element={<GenericPage title="Loyalty Program" description="Points and rewards configuration." data={[]} columns={[]} actionLabel="Configure" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;