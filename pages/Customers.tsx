import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Eye, Edit2, Ban, CheckCircle, Clock, XCircle, UsersRound,
  MapPin, Phone, Mail, Building, ArrowUpDown
} from 'lucide-react';
import { Card, Badge, Button, Input, Modal, Pagination } from '../components/Common';
import { CUSTOMERS } from '../data';
import { Customer } from '../types';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const CustomersPage: React.FC = () => {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Data State (Simulated local state for adding new customers)
  const [customersData, setCustomersData] = useState<Customer[]>(CUSTOMERS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    regNo: '',
    storeName: '',
    address1: '',
    address2: '',
    city: '',
    postcode: ''
  });

  // --- Filtering & Sorting ---
  const filteredCustomers = useMemo(() => {
    let result = customersData.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [customersData, searchTerm, sortConfig]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.companyName) return;

    const newCustomer: Customer = {
      id: `C${(Math.floor(Math.random() * 9000) + 1000).toString()}`,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      companyName: formData.companyName,
      storeName: formData.storeName || formData.companyName,
      regNo: formData.regNo,
      address: `${formData.address1}, ${formData.city} ${formData.postcode}`,
      status: 'Approved',
      walletBalance: 0,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image: undefined
    };

    setCustomersData([newCustomer, ...customersData]);
    setIsModalOpen(false);
    // Reset form
    setFormData({
        firstName: '', lastName: '', email: '', phone: '',
        companyName: '', regNo: '', storeName: '',
        address1: '', address2: '', city: '', postcode: ''
    });
  };

  // --- Stats ---
  const total = customersData.length;
  const approved = customersData.filter(c => c.status === 'Approved').length;
  const pending = customersData.filter(c => c.status === 'Pending').length;
  const blocked = customersData.filter(c => c.status === 'Blocked').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customers</h1>
          <p className="text-slate-500 mt-1">Manage B2B client accounts and approvals.</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:w-80">
             <Input 
                placeholder="Search by name, email, company..." 
                icon={<Search className="h-4 w-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>Add New Customer</Button>
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Customers" value={total} icon={UsersRound} color="indigo" />
        <SummaryCard label="Approved" value={approved} icon={CheckCircle} color="emerald" />
        <SummaryCard label="Pending" value={pending} icon={Clock} color="amber" />
        <SummaryCard label="Blocked" value={blocked} icon={Ban} color="rose" />
      </div>

      {/* 3. Customers Table */}
      <Card className="flex flex-col overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">Customer <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('companyName')}>
                  <div className="flex items-center gap-2">Company <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">Status <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('walletBalance')}>
                  <div className="flex items-center gap-2">Wallet <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('joinedDate')}>
                  <div className="flex items-center gap-2">Joined <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold text-sm border border-slate-200">
                          {customer.image ? <img src={customer.image} className="h-full w-full rounded-full object-cover" alt="" /> : customer.name.charAt(0)}
                        </div>
                        <div>
                           <div className="text-sm font-bold text-slate-900">{customer.name}</div>
                           <div className="flex flex-col gap-0.5">
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>
                           </div>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-bold text-slate-900">{customer.companyName}</div>
                     <div className="text-xs text-slate-500">{customer.storeName}</div>
                     <div className="text-xs text-slate-400 font-mono mt-0.5">Reg: {customer.regNo}</div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-start gap-1.5 max-w-[200px]">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-600 truncate">{customer.address}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <Badge variant={
                        customer.status === 'Approved' ? 'success' : 
                        customer.status === 'Pending' ? 'warning' : 'danger'
                     }>
                        {customer.status}
                     </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-semibold text-slate-700">
                     £{customer.walletBalance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                     {customer.joinedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-2">
                       <button className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all" title="View">
                         <Eye className="h-4 w-4" />
                       </button>
                       <button className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all" title="Edit">
                         <Edit2 className="h-4 w-4" />
                       </button>
                       <button className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all" title="Disable">
                         <Ban className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedCustomers.length === 0 && (
                 <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No customers found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
            currentPage={currentPage}
            totalItems={filteredCustomers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            entityName="customers"
        />
      </Card>

      {/* 4. Add New Customer Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Customer" 
        size="lg"
        footer={
           <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Add Customer</Button>
          </div>
        }
      >
        <div className="space-y-6">
           {/* Section 1 */}
           <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                 <UsersRound className="h-4 w-4 text-indigo-500" /> Customer Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input label="First Name" placeholder="e.g. John" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                 <Input label="Last Name" placeholder="e.g. Doe" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                 <Input label="Email Address" type="email" placeholder="john@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 <Input label="Phone Number" placeholder="+44 7000 000000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
           </div>

           {/* Section 2 */}
           <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                 <Building className="h-4 w-4 text-indigo-500" /> Company Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <Input label="Company Name" placeholder="Legal Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                 </div>
                 <Input label="Company Reg. Number" placeholder="e.g. GB123456" value={formData.regNo} onChange={e => setFormData({...formData, regNo: e.target.value})} />
                 <Input label="Store Name (Trading As)" placeholder="Shop Name" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} />
              </div>
           </div>

           {/* Section 3 */}
           <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                 <MapPin className="h-4 w-4 text-indigo-500" /> Address Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <Input label="Address Line 1" placeholder="Building, Street" value={formData.address1} onChange={e => setFormData({...formData, address1: e.target.value})} />
                 </div>
                 <div className="md:col-span-2">
                    <Input label="Address Line 2" placeholder="Apartment, Suite (Optional)" value={formData.address2} onChange={e => setFormData({...formData, address2: e.target.value})} />
                 </div>
                 <Input label="City" placeholder="e.g. London" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                 <Input label="Postcode" placeholder="e.g. W1 2AB" value={formData.postcode} onChange={e => setFormData({...formData, postcode: e.target.value})} />
              </div>
           </div>
        </div>
      </Modal>

    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color }: any) => {
  const styles: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
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

export default CustomersPage;