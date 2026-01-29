import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, ShoppingCart, Users, Package, Mail, Tag, 
  AlertCircle, ArrowRight, Layers, Activity, ArrowUpDown
} from 'lucide-react';
import { Card, Button, Badge } from '../components/Common';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ORDERS, PRODUCTS, USERS, BRANDS, CATEGORIES } from '../data';

// --- Data Preparation ---
const totalOrders = ORDERS.length;
const pendingOrders = ORDERS.filter(o => o.status === 'Pending').length;
const totalProducts = PRODUCTS.length;
const totalUsers = USERS.length;

const orderStatusData = [
  { name: 'Completed', value: ORDERS.filter(o => o.status === 'Completed').length, color: '#10b981' },
  { name: 'Pending', value: pendingOrders, color: '#f59e0b' },
  { name: 'Processing', value: ORDERS.filter(o => o.status === 'Processing').length, color: '#3b82f6' },
  { name: 'Cancelled', value: ORDERS.filter(o => o.status === 'Cancelled').length, color: '#ef4444' },
].filter(d => d.value > 0);

const activeProducts = PRODUCTS.filter(p => p.status === 'Active').length;
const lowStockProducts = PRODUCTS.filter(p => p.status === 'Low Stock' || p.stock < 10).length;
const activeBrands = BRANDS.filter(b => b.status === 'Active').length;

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const Dashboard: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRecentOrders = useMemo(() => {
    // We take the top 5 recent, but allow sorting within that view or sort the source before slicing?
    // Usually dashboard shows "Recent" implying time sort. 
    // Let's take the first 5 then allow user to sort that snapshot for UX feel.
    let data = [...ORDERS].slice(0, 5);
    
    if (sortConfig) {
      data.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle numeric values
        if (sortConfig.key === 'total') {
            aValue = Number(aValue);
            bValue = Number(bValue);
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [sortConfig]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">Welcome back. Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span>System Operational</span>
           </div>
           <div className="bg-slate-900 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
           </div>
        </div>
      </div>

      {/* SECTION 1: QUICK ACTIONS */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard 
            title="Create Order" 
            desc="New customer order" 
            icon={Plus} 
            color="indigo" 
            link="/orders" 
            primary 
          />
          <ActionCard 
            title="Add Product" 
            desc="Update catalog" 
            icon={Package} 
            color="emerald" 
            link="/products" 
          />
          <ActionCard 
            title="Add Coupon" 
            desc="Create promotion" 
            icon={Tag} 
            color="pink" 
            link="/coupons" 
          />
          <ActionCard 
            title="New Campaign" 
            desc="Email marketing" 
            icon={Mail} 
            color="violet" 
            link="/marketing" 
          />
        </div>
      </div>

      {/* SECTION 2: CORE BUSINESS HEALTH (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Orders" value={totalOrders} icon={ShoppingCart} color="blue" link="/orders" />
        <KpiCard title="Pending Orders" value={pendingOrders} icon={AlertCircle} color="amber" link="/orders" />
        <KpiCard title="Total Products" value={totalProducts} icon={Package} color="emerald" link="/products" />
        <KpiCard title="Total Users" value={totalUsers} icon={Users} color="indigo" link="/users" />
      </div>

      {/* SECTION 3: ORDERS ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Orders by Status Chart */}
        <Card className="p-0 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Orders Overview</h3>
            <p className="text-sm text-slate-500">Status distribution</p>
          </div>
          <div className="flex-1 min-h-[320px] relative bg-white flex flex-col items-center justify-center p-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
               <span className="text-4xl font-extrabold text-slate-900">{totalOrders}</span>
               <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Orders</span>
            </div>
          </div>
        </Card>

        {/* RIGHT: Recent Orders Table */}
        <Card className="lg:col-span-2 overflow-hidden border border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
              <p className="text-sm text-slate-500">Latest customer transactions</p>
            </div>
            <Link to="/orders">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                View All <ArrowRight className="h-4 w-4 ml-1"/>
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-2">Order <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('customer')}>
                    <div className="flex items-center gap-2">Customer <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('total')}>
                    <div className="flex items-center gap-2">Total <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('status')}>
                     <div className="flex items-center gap-2">Status <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedRecentOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded">{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-3 border border-slate-300">
                                {order.customer.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-900">{order.customer}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={
                          order.status === 'Completed' ? 'success' : 
                          order.status === 'Processing' ? 'info' : 
                          order.status === 'Cancelled' ? 'danger' : 'warning'
                        }>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                         <div className="flex justify-center items-center">
                            <Link to="/orders">
                              <button className="h-9 w-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all">
                                  <ArrowRight className="h-4 w-4" />
                              </button>
                            </Link>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* SECTION 4: PRODUCT & CATALOG HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Package className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Inventory Status</h3>
             </div>
             <Link to="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Manage</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <StatBox label="Total Products" value={totalProducts} color="slate" />
             <StatBox label="Active" value={activeProducts} color="emerald" />
             <StatBox label="Low Stock" value={lowStockProducts} color="amber" />
          </div>
        </Card>

        {/* Brands & Categories */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Layers className="h-5 w-5 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Catalog</h3>
             </div>
             <div className="flex gap-4">
               <Link to="/brands" className="text-sm font-medium text-slate-500 hover:text-indigo-600">Brands</Link>
               <Link to="/categories" className="text-sm font-medium text-slate-500 hover:text-indigo-600">Categories</Link>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <StatBox label="Total Brands" value={BRANDS.length} color="slate" />
             <StatBox label="Active Brands" value={activeBrands} color="indigo" />
             <StatBox label="Categories" value={CATEGORIES.length} color="violet" />
          </div>
        </Card>
      </div>

    </div>
  );
};

// --- Sub-Components ---

const ActionCard = ({ title, desc, icon: Icon, color, link, primary }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white',
    violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white',
  };

  return (
    <Link to={link} state={{ openModal: true }} className="block group">
      <div className={`
        h-full p-5 rounded-2xl border transition-all duration-300
        ${primary 
          ? 'bg-indigo-600 border-indigo-600 shadow-md hover:shadow-lg hover:bg-indigo-700' 
          : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'}
      `}>
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl transition-colors duration-300 ${primary ? 'bg-white/20 text-white' : colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className={`p-1 rounded-full ${primary ? 'bg-white/10' : 'bg-slate-100'} opacity-0 group-hover:opacity-100 transition-opacity`}>
             <ArrowRight className={`h-3 w-3 ${primary ? 'text-white' : 'text-slate-600'}`} />
          </div>
        </div>
        <div className="mt-4">
          <h3 className={`font-bold text-lg ${primary ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
          <p className={`text-sm mt-1 ${primary ? 'text-indigo-100' : 'text-slate-500'}`}>{desc}</p>
        </div>
      </div>
    </Link>
  );
};

const KpiCard = ({ title, value, icon: Icon, color, link }: any) => {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <Link to={link}>
      <Card className="p-6 flex items-center justify-between hover:shadow-lg hover:border-indigo-100 transition-all cursor-pointer h-full">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${colorMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </Card>
    </Link>
  );
};

const StatBox = ({ label, value, color }: any) => {
  const styles: any = {
    slate: 'bg-slate-50 border-slate-200 text-slate-900',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    violet: 'bg-violet-50 border-violet-100 text-violet-700',
  };
  return (
    <div className={`p-4 rounded-xl border ${styles[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold uppercase opacity-70 mt-1">{label}</div>
    </div>
  );
};

export default Dashboard;