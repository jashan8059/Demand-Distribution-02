import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Mail, ShoppingCart, Clock, AlertCircle, 
  ArrowUpDown, ArrowLeft, MailCheck
} from 'lucide-react';
import { Card, Button, Input, Pagination } from '../components/Common';
import { ACTIVE_CARTS } from '../data';
import { Cart } from '../types';
import { Link } from 'react-router-dom';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const ActiveCartsPage: React.FC = () => {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set());

  // --- Sorting & Filtering ---
  const filteredCarts = useMemo(() => {
    let result = ACTIVE_CARTS.filter(cart => 
      cart.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cart.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cart.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      result.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [searchTerm, sortConfig]);

  const paginatedCarts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCarts.slice(start, start + itemsPerPage);
  }, [filteredCarts, currentPage, itemsPerPage]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSendReminder = (id: string, name: string) => {
    // In a real app, this would call an API
    if (confirm(`Send cart reminder email to ${name}?`)) {
      setSentEmails(prev => new Set(prev).add(id));
      alert(`Reminder email sent successfully to ${name}`);
    }
  };

  // --- Stats ---
  const totalActiveCarts = ACTIVE_CARTS.length;
  const highQtyCarts = ACTIVE_CARTS.filter(c => c.totalQty > 50).length;
  // Mock logic for "Oldest Cart"
  const oldestCartDays = 5;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4">
        <Link to="/orders" className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors w-fit">
           <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Carts ({totalActiveCarts})</h1>
            <p className="text-slate-500 mt-1">Customers with items currently in cart but not checked out.</p>
          </div>
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard 
          label="Total Active Carts" 
          value={totalActiveCarts} 
          icon={ShoppingCart} 
          color="blue" 
        />
        <SummaryCard 
          label="Customers with Items > 50 Qty" 
          value={highQtyCarts} 
          icon={AlertCircle} 
          color="amber" 
        />
        <SummaryCard 
          label="Oldest Cart (Days)" 
          value={oldestCartDays} 
          icon={Clock} 
          color="slate" 
        />
      </div>

      <Card className="flex flex-col overflow-hidden">
        {/* 3. Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="w-full sm:w-80">
            <Input 
              placeholder="Search carts..." 
              icon={<Search className="h-4 w-4" />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" icon={<Download className="h-4 w-4" />}>Export CSV</Button>
        </div>

        {/* 4. Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-2">Cart ID <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('userEmail')}>
                  <div className="flex items-center gap-2">User Email <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('userName')}>
                  <div className="flex items-center gap-2">User Name <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('totalItems')}>
                  <div className="flex items-center gap-2 justify-center">Total Items <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('totalQty')}>
                  <div className="flex items-center gap-2 justify-center">Total Qty <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('lastUpdated')}>
                   <div className="flex items-center gap-2">Last Updated <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('created')}>
                   <div className="flex items-center gap-2">Created <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {paginatedCarts.map((cart) => (
                <tr key={cart.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => handleSendReminder(cart.id, cart.userName)}
                      disabled={sentEmails.has(cart.id)}
                      className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-all ${
                        sentEmails.has(cart.id)
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default'
                          : 'border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                      }`}
                      title={sentEmails.has(cart.id) ? "Reminder Sent" : "Send Reminder Email"}
                    >
                      {sentEmails.has(cart.id) ? <MailCheck className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-600">
                    {cart.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {cart.userEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    {cart.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-600">
                    {cart.totalItems}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-slate-900">
                    {cart.totalQty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="truncate max-w-[200px] text-sm text-slate-500" title={cart.items.join(', ')}>
                       {cart.items.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {cart.lastUpdated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {cart.created}
                  </td>
                </tr>
              ))}
              {paginatedCarts.length === 0 && (
                 <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">No active carts found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
            currentPage={currentPage}
            totalItems={filteredCarts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            entityName="carts"
        />
      </Card>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color }: any) => {
  const styles: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl border ${styles[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
    </Card>
  );
};

export default ActiveCartsPage;