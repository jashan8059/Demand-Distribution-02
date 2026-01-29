import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, PieChart, ShoppingBag, Layers, Box, ShoppingCart, 
  Users, Ticket, Tag, Megaphone, Heart, Settings, Search, Bell, Menu, X, ChevronDown, User as UserIcon,
  Maximize, Minimize, UsersRound
} from 'lucide-react';
import { Input } from './Common';

const SidebarItem: React.FC<{ to: string, icon: any, label: string, active: boolean }> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
      active 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
    {label}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: PieChart },
    { name: 'Brands', href: '/brands', icon: ShoppingBag },
    { name: 'Categories', href: '/categories', icon: Layers },
    { name: 'Products', href: '/products', icon: Box },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Customers', href: '/customers', icon: UsersRound },
    { name: 'Coupons', href: '/coupons', icon: Ticket },
    { name: 'Pricing Tiers', href: '/pricing', icon: Tag },
    { name: 'Marketing', href: '/marketing', icon: Megaphone },
    { name: 'Loyalty Program', href: '/loyalty', icon: Heart },
    { name: 'Administration', href: '/admin', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-900">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              US
            </div>
            UrbanShelf
          </div>
          <button 
            className="ml-auto lg:hidden text-slate-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navigation.map((item) => (
            <SidebarItem 
              key={item.name}
              to={item.href}
              icon={item.icon}
              label={item.name}
              active={location.pathname === item.href}
            />
          ))}
        </div>

        {/* User Profile Summary at bottom of sidebar */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <img 
              className="h-9 w-9 rounded-full bg-slate-100" 
              src="https://picsum.photos/100/100?random=user" 
              alt="Profile" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Alex Morgan</p>
              <p className="text-xs text-slate-500 truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden p-2 text-slate-400 hover:text-slate-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Global Search */}
            <div className="flex-1 max-w-lg mx-auto lg:mx-0 lg:mr-auto">
              <div className="w-full max-w-md">
                <Input 
                  placeholder="Search products, orders, customers..." 
                  icon={<Search className="h-4 w-4" />}
                  className="bg-slate-50 border-transparent focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-4 ml-4">
              <button 
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:block"
                onClick={toggleFullScreen}
                title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
              >
                {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>

              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                   <UserIcon className="h-5 w-5" />
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};