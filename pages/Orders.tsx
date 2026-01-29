import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, Filter, Search, Eye, Download, Printer, 
  CheckCircle, Clock, XCircle, Calendar, CreditCard, User, Box,
  ChevronRight, ChevronLeft, MapPin, Building, Trash2, ArrowLeft, Minus, ShoppingBag, ShieldCheck, Wallet,
  ArrowUpDown, Phone, Mail, ChevronDown, ChevronUp, ShoppingCart
} from 'lucide-react';
import { Card, Badge, Button, Input, Select, Modal, Toggle, Pagination } from '../components/Common';
import { ORDERS, PRODUCTS, CUSTOMERS } from '../data';
import { Order, Product, Customer } from '../types';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- View State ---
  const [view, setView] = useState<'list' | 'create'>('list');

  // --- List View State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [orderSort, setOrderSort] = useState<SortConfig>(null);
  const [orderPage, setOrderPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // --- Create Order Wizard State ---
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  // Cart maps Product ID to Quantity
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [couponCode, setCouponCode] = useState('');
  const [useWallet, setUseWallet] = useState(false);

  // --- Wizard Sorting & Pagination State ---
  const [customerSort, setCustomerSort] = useState<SortConfig>(null);
  const [customerPage, setCustomerPage] = useState(1);
  const [customerItemsPerPage, setCustomerItemsPerPage] = useState(5);

  const [productSort, setProductSort] = useState<SortConfig>(null);
  const [productPage, setProductPage] = useState(1);
  const [productItemsPerPage, setProductItemsPerPage] = useState(5);
  const [productSearch, setProductSearch] = useState('');

  // --- Effects ---
  useEffect(() => {
    if (location.state && (location.state as any).openModal) {
      setView('create');
      setCurrentStep(1);
      setSelectedCustomer(null);
      setCart({});
    }
  }, [location]);

  // --- Helpers ---
  const getPaymentStatus = (status: string) => {
    if (status === 'Completed') return 'Paid';
    if (status === 'Processing') return 'Paid';
    if (status === 'Cancelled') return 'Refunded';
    return 'Unpaid';
  };

  const getPaymentBadge = (status: string) => {
    const paymentStatus = getPaymentStatus(status);
    switch (paymentStatus) {
      case 'Paid': return 'success';
      case 'Refunded': return 'neutral';
      case 'Unpaid': return 'warning';
      default: return 'neutral';
    }
  };

  const handleSort = (key: string, config: SortConfig, setConfig: (c: SortConfig) => void) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (config && config.key === key && config.direction === 'asc') {
      direction = 'desc';
    }
    setConfig({ key, direction });
  };

  const sortData = (data: any[], config: SortConfig) => {
    if (!config) return data;
    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];
      
      // Handle nested or numeric sorting if needed
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (typeof aValue === 'number' && typeof bValue === 'number') {
         // standard sort
      }

      if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // --- Filtering & Sorting for List View ---
  const filteredOrders = useMemo(() => {
    let result = ORDERS.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      const paymentStatus = getPaymentStatus(order.status);
      const matchesPayment = paymentFilter === 'All' || paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });

    return sortData(result, orderSort);
  }, [searchTerm, statusFilter, paymentFilter, orderSort]);

  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, orderPage, itemsPerPage]);

  // --- Wizard Data Logic ---
  const sortedCustomers = useMemo(() => sortData(CUSTOMERS, customerSort), [CUSTOMERS, customerSort]);
  const paginatedCustomers = useMemo(() => {
    const start = (customerPage - 1) * customerItemsPerPage;
    return sortedCustomers.slice(start, start + customerItemsPerPage);
  }, [sortedCustomers, customerPage, customerItemsPerPage]);

  const filteredProducts = useMemo(() => {
     return PRODUCTS.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase()));
  }, [productSearch]);
  
  const sortedProducts = useMemo(() => sortData(filteredProducts, productSort), [filteredProducts, productSort]);
  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * productItemsPerPage;
    return sortedProducts.slice(start, start + productItemsPerPage);
  }, [sortedProducts, productPage, productItemsPerPage]);

  // --- Cart Helpers ---
  const handleAddToCart = (productId: string, delta: number) => {
    setCart(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const newCart = { ...prev, [productId]: newQty };
      if (newQty === 0) delete newCart[productId];
      return newCart;
    });
  };

  const calculateTotals = () => {
    let subTotal = 0;
    Object.entries(cart).forEach(([pid, qty]) => {
      const product = PRODUCTS.find(p => p.id === pid);
      if (product) {
        subTotal += product.price * (qty as number);
      }
    });
    
    const vat = subTotal * 0.20; 
    const shipping = 0;
    let total = subTotal + vat + shipping;
    
    let walletDeduction = 0;
    if (useWallet && selectedCustomer) {
      walletDeduction = Math.min(total, selectedCustomer.walletBalance);
      total -= walletDeduction;
    }

    return { subTotal, vat, shipping, total, walletDeduction };
  };

  const totals = calculateTotals();

  // --- RENDER: WIZARD STEPS ---

  // STEP 1: Select Customer
  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      {selectedCustomer ? (
        <Card className="overflow-hidden border-indigo-200">
          <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-start">
            <div className="flex items-center gap-4">
               <div className="h-16 w-16 rounded-full border-4 border-white shadow-sm flex-shrink-0 bg-indigo-50 flex items-center justify-center overflow-hidden">
                  {selectedCustomer.image ? (
                     <img src={selectedCustomer.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                     <span className="text-xl font-bold text-indigo-600">{selectedCustomer.name.charAt(0)}</span>
                  )}
               </div>
               <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                  <p className="text-slate-500">{selectedCustomer.companyName}</p>
               </div>
            </div>
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-rose-500 transition-colors"
              title="Remove Selection"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Contact</label>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                   <Mail className="h-4 w-4 text-slate-400" /> {selectedCustomer.email}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                   <Phone className="h-4 w-4 text-slate-400" /> {selectedCustomer.phone}
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Business Details</label>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                   <Building className="h-4 w-4 text-slate-400" /> {selectedCustomer.storeName}
                </div>
                <div className="mt-1 text-sm text-slate-500 pl-6">
                   Reg: {selectedCustomer.regNo}
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Billing Address</label>
                <div className="mt-2 flex items-start gap-2 text-sm text-slate-700">
                   <MapPin className="h-4 w-4 text-slate-400 mt-0.5" /> 
                   <span className="max-w-[150px]">{selectedCustomer.address}</span>
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Wallet Balance</label>
                <div className="mt-2 flex items-center gap-2">
                   <Wallet className="h-5 w-5 text-indigo-500" />
                   <span className="text-xl font-bold text-indigo-700">£{selectedCustomer.walletBalance.toFixed(2)}</span>
                </div>
             </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="w-full max-w-md">
            <Input placeholder="Search by name, email, or company" icon={<Search className="h-4 w-4" />} />
          </div>
          <Card className="overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => handleSort('name', customerSort, setCustomerSort)}
                  >
                    <div className="flex items-center gap-1">
                      Customer
                      <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none"
                    onClick={() => handleSort('companyName', customerSort, setCustomerSort)}
                  >
                     <div className="flex items-center gap-1">
                      Company
                      <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {paginatedCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         {customer.image ? (
                            <img src={customer.image} alt="" className="h-10 w-10 rounded-full bg-slate-100 object-cover flex-shrink-0 border border-slate-200" />
                         ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0 border border-indigo-200">
                              {customer.name.charAt(0)}
                            </div>
                         )}
                         <div>
                            <div className="font-bold text-slate-900">{customer.name}</div>
                            <div className="text-xs text-slate-500">{customer.email}</div>
                            <div className="text-xs text-slate-500">{customer.phone}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 font-medium">{customer.companyName}</div>
                      <div className="text-xs text-slate-500">{customer.storeName}</div>
                      <div className="text-xs text-slate-400">Reg: {customer.regNo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">{customer.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={customer.status === 'Approved' ? 'success' : 'neutral'}>{customer.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        className="inline-flex items-center justify-center px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination 
                currentPage={customerPage}
                totalItems={sortedCustomers.length}
                itemsPerPage={customerItemsPerPage}
                onPageChange={setCustomerPage}
                onItemsPerPageChange={setCustomerItemsPerPage}
                entityName="customers"
            />
          </Card>
        </>
      )}
    </div>
  );

  // STEP 2: Add Products
  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="w-full max-w-md">
        <Input 
           placeholder="Search products by name, brand, or category" 
           icon={<Search className="h-4 w-4" />} 
           value={productSearch}
           onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
        />
      </div>
      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Image</th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none"
                onClick={() => handleSort('name', productSort, setProductSort)}
              >
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none"
                onClick={() => handleSort('price', productSort, setProductSort)}
              >
                 <div className="flex items-center gap-1">
                  Price
                  <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pack Size</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Credit</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {paginatedProducts.map(product => {
               const qty = cart[product.id] || 0;
               return (
                <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${qty > 0 ? 'bg-indigo-50/10' : ''}`}>
                   <td className="px-6 py-4">
                    <img src={product.image} alt="" className="h-10 w-10 rounded-lg border border-slate-200 bg-white" />
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {product.name}
                    <div className="text-xs text-slate-400 font-normal">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">Generic Brand</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">£{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">1 Unit</td>
                  <td className="px-6 py-4 text-sm text-slate-500">£0.00</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50"
                        onClick={() => handleAddToCart(product.id, -1)}
                        disabled={qty === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className={`w-8 text-center font-bold ${qty > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {qty}
                      </span>
                      <button 
                        className="p-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-600"
                        onClick={() => handleAddToCart(product.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
            )})}
          </tbody>
        </table>
        <Pagination 
            currentPage={productPage}
            totalItems={sortedProducts.length}
            itemsPerPage={productItemsPerPage}
            onPageChange={setProductPage}
            onItemsPerPageChange={setProductItemsPerPage}
            entityName="products"
        />
      </Card>
    </div>
  );

  // STEP 3: Review & Pay
  const renderStep3 = () => {
    const cartItems = Object.entries(cart).map(([pid, qty]) => {
      const p = PRODUCTS.find(x => x.id === pid);
      return { ...p, qty } as (Product & { qty: number });
    });

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
        {/* LEFT: Order Items */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 font-bold text-slate-900">Order Items</div>
             <table className="min-w-full divide-y divide-slate-100">
               <thead className="bg-white">
                 <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Remove</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-white">
                 {cartItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <img src={item.image} className="h-10 w-10 rounded border border-slate-200" alt="" />
                           <span className="font-medium text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">£{item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center border border-slate-200 rounded-lg">
                           <button className="px-2 py-1 hover:bg-slate-100 text-slate-500" onClick={() => handleAddToCart(item.id, -1)}>-</button>
                           <span className="px-2 text-sm font-semibold w-8 text-center">{item.qty}</span>
                           <button className="px-2 py-1 hover:bg-slate-100 text-indigo-600" onClick={() => handleAddToCart(item.id, 1)}>+</button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                          onClick={() => handleAddToCart(item.id, -item.qty)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                 ))}
               </tbody>
             </table>
           </Card>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="space-y-6">
           <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Customer Details</h3>
              {selectedCustomer && (
                <div className="space-y-3">
                   <div>
                     <p className="text-xs text-slate-500 uppercase tracking-wide">Name</p>
                     <p className="font-bold text-slate-900">{selectedCustomer.name}</p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                     <p className="font-medium text-slate-700">{selectedCustomer.email}</p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 uppercase tracking-wide">Store Name</p>
                     <p className="font-medium text-slate-700">{selectedCustomer.storeName}</p>
                   </div>
                </div>
              )}
           </Card>

           <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Apply Coupon</h3>
              <div className="flex gap-2">
                 <Input 
                   placeholder="ENTER COUPON CODE" 
                   value={couponCode} 
                   onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                   className="uppercase font-mono"
                 />
                 <Button variant="secondary">Apply</Button>
              </div>
           </Card>

           <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Payment Details</h3>
              
              <div className="space-y-3 text-sm">
                 <div className="flex justify-between text-slate-600">
                    <span>Sub Total</span>
                    <span className="font-medium">£{totals.subTotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-slate-600">
                    <span>VAT (20%)</span>
                    <span className="font-medium">£{totals.vat.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-slate-600">
                    <span>Shipping Fee</span>
                    <span className="font-medium text-emerald-600">FREE</span>
                 </div>
                 
                 <div className="py-3 border-t border-dashed border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                       <span className="font-medium text-slate-700 flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-indigo-500" /> Wallet Balance
                       </span>
                       <span className="font-bold text-slate-900">£{selectedCustomer?.walletBalance.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg mt-2">
                       <span className="text-sm font-medium text-slate-600">Use Wallet Credit</span>
                       <Toggle checked={useWallet} onChange={setUseWallet} />
                    </div>

                    {useWallet && (
                      <div className="flex justify-between text-indigo-600 bg-indigo-50 p-2 rounded-lg text-xs font-semibold mt-2">
                         <span>Applied</span>
                         <span>- £{totals.walletDeduction.toFixed(2)}</span>
                      </div>
                    )}
                 </div>

                 <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Pay</span>
                    <span>£{totals.total.toFixed(2)}</span>
                 </div>
              </div>

              <div className="mt-6">
                 <Button className="w-full justify-center py-3 text-base">
                    Pay £{totals.total.toFixed(2)}
                 </Button>
                 <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
                    <ShieldCheck className="h-3 w-3" />
                    Secure payment powered by Stripe
                 </div>
              </div>
           </Card>

           <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <p className="text-xs text-yellow-800 font-medium">Order Notes</p>
              <p className="text-xs text-yellow-600 mt-1">
                 Customer will receive an email confirmation immediately after payment.
              </p>
           </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  if (view === 'create') {
    return (
      <div className="max-w-[1600px] mx-auto pb-12">
        <div className="flex flex-col gap-8">
           {/* Header */}
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('list')}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-slate-900">Create New Order</h1>
           </div>

           {/* Professional Stepper */}
           <div className="w-full max-w-5xl mx-auto mb-10">
             <nav aria-label="Progress">
               <ol role="list" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:flex md:divide-x divide-slate-200">
                 {[
                   { id: 1, name: 'Customer', description: 'Select buyer details' },
                   { id: 2, name: 'Products', description: 'Add items to cart' },
                   { id: 3, name: 'Review', description: 'Confirm & Payment' },
                 ].map((step, stepIdx) => {
                   const isCompleted = currentStep > step.id;
                   const isCurrent = currentStep === step.id;
                   
                   return (
                     <li key={step.name} className="relative md:flex-1 md:flex">
                       <div className={`group flex items-center w-full`}>
                         <div className="flex items-center px-6 py-5 text-sm font-medium">
                           <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                             isCompleted ? 'border-indigo-600 bg-indigo-600 group-hover:bg-indigo-800' :
                             isCurrent ? 'border-indigo-600' :
                             'border-slate-300'
                           }`}>
                             {isCompleted ? (
                               <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                             ) : (
                               <span className={`text-lg font-bold ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>{step.id}</span>
                             )}
                           </span>
                           <span className="ml-4 flex flex-col items-start">
                             <span className={`text-sm font-bold uppercase tracking-wide ${isCurrent ? 'text-indigo-600' : 'text-slate-900'}`}>{step.name}</span>
                             <span className="text-sm font-medium text-slate-500">{step.description}</span>
                           </span>
                         </div>
                       </div>
                       
                       {/* Chevron separator for desktop */}
                       {stepIdx !== 2 && (
                         <div className="hidden md:block absolute top-0 right-0 h-full w-5" aria-hidden="true">
                            <svg
                              className="h-full w-full text-slate-200"
                              viewBox="0 0 22 80"
                              fill="none"
                              preserveAspectRatio="none"
                            >
                              <path
                                d="M0 -2L20 40L0 82"
                                vectorEffect="non-scaling-stroke"
                                stroke="currentColor"
                                strokeLinejoin="round"
                              />
                            </svg>
                         </div>
                       )}
                     </li>
                   );
                 })}
               </ol>
             </nav>
           </div>

           {/* Step Content */}
           <div className="min-h-[400px]">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
           </div>

           {/* Footer Actions */}
           <div className="flex justify-between items-center pt-8 border-t border-slate-200 mt-8">
              <div>
                {currentStep > 1 ? (
                  <Button 
                    variant="secondary" 
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    icon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    onClick={() => setView('list')}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              
              <div>
                {currentStep < 3 && (
                  <Button 
                    variant="primary" 
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={(currentStep === 1 && !selectedCustomer) || (currentStep === 2 && Object.keys(cart).length === 0)}
                  >
                    Next Step <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW (EXISTING) ---
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
          <p className="text-slate-500 mt-1">Manage customer orders and payment status.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            icon={<ShoppingCart className="h-4 w-4" />}
            onClick={() => navigate('/active-carts')}
          >
            Active Carts (36)
          </Button>
          <Button 
            icon={<Plus className="h-4 w-4" />} 
            onClick={() => {
              // Reset create state
              setCurrentStep(1);
              setSelectedCustomer(null);
              setCart({});
              setView('create');
            }}
          >
            Create Order
          </Button>
        </div>
      </div>

      {/* 2. Order Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          label="Total Orders" 
          value={ORDERS.length} 
          icon={Box} 
          color="indigo" 
          onClick={() => { setStatusFilter('All'); setPaymentFilter('All'); }}
        />
        <SummaryCard 
          label="Pending Processing" 
          value={ORDERS.filter(o => o.status === 'Pending' || o.status === 'Processing').length} 
          icon={Clock} 
          color="amber" 
          onClick={() => setStatusFilter('Pending')}
        />
        <SummaryCard 
          label="Completed Orders" 
          value={ORDERS.filter(o => o.status === 'Completed').length} 
          icon={CheckCircle} 
          color="emerald" 
          onClick={() => setStatusFilter('Completed')}
        />
        <SummaryCard 
          label="Cancelled / Returns" 
          value={ORDERS.filter(o => o.status === 'Cancelled').length} 
          icon={XCircle} 
          color="rose" 
          onClick={() => setStatusFilter('Cancelled')}
        />
      </div>

      <Card className="flex flex-col overflow-hidden">
        {/* 3. Filter Bar (Sticky) */}
        <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
             <div className="w-full lg:w-96">
               <Input 
                 placeholder="Search Order ID, Customer..." 
                 icon={<Search className="h-4 w-4" />} 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             
             <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <div className="w-40">
                   <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                     <option value="All">All Statuses</option>
                     <option value="Completed">Completed</option>
                     <option value="Processing">Processing</option>
                     <option value="Pending">Pending</option>
                     <option value="Cancelled">Cancelled</option>
                   </Select>
                </div>
                <div className="w-40">
                   <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                     <option value="All">Payment Status</option>
                     <option value="Paid">Paid</option>
                     <option value="Unpaid">Unpaid</option>
                     <option value="Refunded">Refunded</option>
                   </Select>
                </div>
                <Button variant="ghost" icon={<Filter className="h-4 w-4" />} onClick={() => { setSearchTerm(''); setStatusFilter('All'); setPaymentFilter('All'); }}>Reset</Button>
             </div>
          </div>
        </div>

        {/* 4. Orders Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('id', orderSort, setOrderSort)}>
                  <div className="flex items-center gap-2">Order ID <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('date', orderSort, setOrderSort)}>
                  <div className="flex items-center gap-2">Date <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('customer', orderSort, setOrderSort)}>
                   <div className="flex items-center gap-2">Customer <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('status', orderSort, setOrderSort)}>
                  <div className="flex items-center gap-2">Status <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('total', orderSort, setOrderSort)}>
                  <div className="flex items-center gap-2">Total <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="text-sm font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded cursor-pointer hover:bg-indigo-100"
                      onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}
                    >
                      {order.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mr-3 border border-slate-200">
                        {order.customer.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getPaymentBadge(order.status)}>
                      {getPaymentStatus(order.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      order.status === 'Completed' ? 'success' : 
                      order.status === 'Processing' ? 'info' : 
                      order.status === 'Cancelled' ? 'danger' : 'warning'
                    }>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        className="h-9 w-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all"
                        onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="h-9 w-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all"
                        title="Print Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-slate-900 font-medium">No orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination 
            currentPage={orderPage}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setOrderPage}
            onItemsPerPageChange={setItemsPerPage}
            entityName="orders"
        />
      </Card>

      {/* 6. Order Details View Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => { setIsDetailOpen(false); setSelectedOrder(null); }}
          title={`Order ${selectedOrder.id}`}
          size="lg"
          footer={
            <div className="flex gap-3 justify-between w-full">
               <div className="flex gap-2">
                 <Button variant="secondary" icon={<Printer className="h-4 w-4" />}>Print</Button>
                 <Button variant="secondary" icon={<Download className="h-4 w-4" />}>Invoice</Button>
               </div>
               <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>Close</Button>
               </div>
            </div>
          }
        >
          {/* Detailed content logic */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm">
                     <User className="h-6 w-6" />
                  </div>
                  <div>
                     <p className="text-sm text-slate-500">Customer</p>
                     <p className="font-bold text-slate-900 text-lg">{selectedOrder.customer}</p>
                     <p className="text-xs text-slate-400">customer@example.com</p>
                  </div>
               </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color, onClick }: any) => {
  const styles: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };
  
  return (
    <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      <div>
        <p className="text-sm font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl border ${styles[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
    </Card>
  );
};

export default OrdersPage;