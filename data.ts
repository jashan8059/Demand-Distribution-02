import { Product, Order, Brand, Category, User, Customer, Cart, Coupon, PricingStrategy, Campaign } from './types';

export const PRODUCTS: Product[] = [
  { id: 'P001', name: 'Premium Office Chair', sku: 'FUR-001', category: 'Furniture', price: 299.00, stock: 45, status: 'Active', image: 'https://picsum.photos/40/40?random=1' },
  { id: 'P002', name: 'Ergonomic Keyboard', sku: 'TEC-023', category: 'Electronics', price: 89.50, stock: 12, status: 'Low Stock', image: 'https://picsum.photos/40/40?random=2' },
  { id: 'P003', name: 'Standing Desk Converter', sku: 'FUR-005', category: 'Furniture', price: 150.00, stock: 8, status: 'Low Stock', image: 'https://picsum.photos/40/40?random=3' },
  { id: 'P004', name: 'HD Monitor 27"', sku: 'TEC-101', category: 'Electronics', price: 220.00, stock: 150, status: 'Active', image: 'https://picsum.photos/40/40?random=4' },
  { id: 'P005', name: 'Wireless Mouse', sku: 'TEC-044', category: 'Electronics', price: 25.00, stock: 0, status: 'Draft', image: 'https://picsum.photos/40/40?random=5' },
  { id: 'P006', name: 'USB-C Hub', sku: 'ACC-002', category: 'Accessories', price: 45.99, stock: 200, status: 'Active', image: 'https://picsum.photos/40/40?random=6' },
  { id: 'P007', name: 'Noise Cancelling Headphones', sku: 'AUD-009', category: 'Audio', price: 350.00, stock: 32, status: 'Active', image: 'https://picsum.photos/40/40?random=7' },
];

export const ORDERS: Order[] = [
  { id: 'ORD-7782', customer: 'Acme Corp', date: 'Oct 24, 2023', total: 1250.00, items: 5, status: 'Completed' },
  { id: 'ORD-7783', customer: 'Globex Inc', date: 'Oct 24, 2023', total: 450.50, items: 2, status: 'Processing' },
  { id: 'ORD-7784', customer: 'Soylent Corp', date: 'Oct 23, 2023', total: 2300.00, items: 12, status: 'Pending' },
  { id: 'ORD-7785', customer: 'Initech', date: 'Oct 23, 2023', total: 120.00, items: 1, status: 'Completed' },
  { id: 'ORD-7786', customer: 'Umbrella Corp', date: 'Oct 22, 2023', total: 5600.00, items: 25, status: 'Processing' },
  { id: 'ORD-7787', customer: 'Cyberdyne', date: 'Oct 21, 2023', total: 890.00, items: 3, status: 'Cancelled' },
];

export const ACTIVE_CARTS: Cart[] = [
  { id: 'CRT-9001', userEmail: 'james@techhub.com', userName: 'James Cameron', totalItems: 3, totalQty: 15, items: ['Premium Office Chair', 'USB-C Hub'], lastUpdated: '10 mins ago', created: 'Oct 25, 2023' },
  { id: 'CRT-9002', userEmail: 'sarah@skynet.net', userName: 'Sarah Connor', totalItems: 1, totalQty: 50, items: ['Ergonomic Keyboard'], lastUpdated: '1 hour ago', created: 'Oct 25, 2023' },
  { id: 'CRT-9003', userEmail: 'rick@tyrell.com', userName: 'Rick Deckard', totalItems: 5, totalQty: 12, items: ['HD Monitor 27"', 'Wireless Mouse', 'HDMI Cable', 'Webcam'], lastUpdated: '3 hours ago', created: 'Oct 24, 2023' },
  { id: 'CRT-9004', userEmail: 'marty@hillvalley.com', userName: 'Marty McFly', totalItems: 2, totalQty: 2, items: ['Standing Desk Converter', 'Noise Cancelling Headphones'], lastUpdated: '1 day ago', created: 'Oct 23, 2023' },
  { id: 'CRT-9005', userEmail: 'ripley@weyland.com', userName: 'Ellen Ripley', totalItems: 8, totalQty: 100, items: ['USB-C Hub', 'Ergonomic Keyboard', 'Mouse Pad', 'Laptop Stand'], lastUpdated: '2 days ago', created: 'Oct 22, 2023' },
  { id: 'CRT-9006', userEmail: 'walter@white.com', userName: 'Walter White', totalItems: 1, totalQty: 5, items: ['Chemistry Set'], lastUpdated: '5 days ago', created: 'Oct 20, 2023' },
];

export const CUSTOMERS: Customer[] = [
  { 
    id: 'C001', name: 'James Cameron', email: 'james@techhub.com', phone: '+44 7700 900077', 
    companyName: 'TechHub Ltd', storeName: 'TechHub London', regNo: 'GB12345678', 
    address: '123 Tech Street, London, EC1A 1BB', status: 'Approved', walletBalance: 150.00,
    joinedDate: 'Oct 15, 2023', image: 'https://i.pravatar.cc/150?u=C001'
  },
  { 
    id: 'C002', name: 'Sarah Connor', email: 'sarah@skynet.net', phone: '+44 7700 900088', 
    companyName: 'Cyberdyne Systems', storeName: 'Cyberdyne Retail', regNo: 'GB87654321', 
    address: '456 Future Rd, Manchester, M1 2AB', status: 'Approved', walletBalance: 45.50,
    joinedDate: 'Sep 20, 2023', image: 'https://i.pravatar.cc/150?u=C002'
  },
  { 
    id: 'C003', name: 'Ellen Ripley', email: 'ripley@weyland.com', phone: '+44 7700 900099', 
    companyName: 'Weyland-Yutani', storeName: 'Nostromo Supplies', regNo: 'GB99887766', 
    address: '789 Space Blvd, Liverpool, L3 4CD', status: 'Pending', walletBalance: 0.00,
    joinedDate: 'Nov 01, 2023'
  },
  { 
    id: 'C004', name: 'Rick Deckard', email: 'rick@tyrell.com', phone: '+44 7700 900100', 
    companyName: 'Tyrell Corp', storeName: 'RepliCant', regNo: 'GB55443322', 
    address: '2049 Blade Runner St, Los Angeles, LA', status: 'Approved', walletBalance: 500.00,
    joinedDate: 'Aug 10, 2023', image: 'https://i.pravatar.cc/150?u=C004'
  },
  { 
    id: 'C005', name: 'Dana Scully', email: 'dana@fbi.gov', phone: '+44 7700 900101', 
    companyName: 'FBI', storeName: 'X-Files Archive', regNo: 'GB11223344', 
    address: '1013 Truth Rd, Washington, DC', status: 'Blocked', walletBalance: 120.50,
    joinedDate: 'Jan 12, 2023', image: 'https://i.pravatar.cc/150?u=C005'
  },
  { 
    id: 'C006', name: 'Marty McFly', email: 'marty@hillvalley.com', phone: '+44 7700 900102', 
    companyName: 'Doc Brown Ent', storeName: 'Time Travel Emporium', regNo: 'GB99880011', 
    address: '88 MPH Lane, Hill Valley, CA', status: 'Approved', walletBalance: 19.85,
    joinedDate: 'Oct 21, 2023', image: 'https://i.pravatar.cc/150?u=C006'
  },
];

export const COUPONS: Coupon[] = [
  { id: 'CPN-001', code: 'WELCOME20', type: 'Percentage', value: 20, minOrder: 50, maxDiscount: 100, usageLimit: 1000, usedCount: 450, validFrom: '2023-01-01', validUntil: '2024-12-31', status: 'Active', categories: ['Electronics', 'Accessories'] },
  { id: 'CPN-002', code: 'SUMMER10', type: 'Fixed Amount', value: 10, minOrder: 100, maxDiscount: 10, usageLimit: 500, usedCount: 500, validFrom: '2023-06-01', validUntil: '2023-08-31', status: 'Expired', categories: ['Furniture'] },
  { id: 'CPN-003', code: 'BFCM50', type: 'Percentage', value: 50, minOrder: 200, maxDiscount: 500, usageLimit: 100, usedCount: 0, validFrom: '2024-11-24', validUntil: '2024-11-27', status: 'Upcoming', categories: ['All'] },
  { id: 'CPN-004', code: 'FLASH25', type: 'Percentage', value: 25, minOrder: 0, maxDiscount: 50, usageLimit: 50, usedCount: 12, validFrom: '2023-10-25', validUntil: '2024-10-30', status: 'Active', categories: ['Electronics'] },
  { id: 'CPN-005', code: 'SHIPFREE', type: 'Fixed Amount', value: 15, minOrder: 75, maxDiscount: 15, usageLimit: 2000, usedCount: 1205, validFrom: '2023-01-01', validUntil: '2024-12-31', status: 'Active', categories: ['All'] },
];

export const BRANDS: Brand[] = [
  { id: 'B001', name: 'TechGiant', logo: 'https://picsum.photos/32/32?random=10', products: 120, status: 'Active' },
  { id: 'B002', name: 'FurniCo', logo: 'https://picsum.photos/32/32?random=11', products: 85, status: 'Active' },
  { id: 'B003', name: 'AudioPhile', logo: 'https://picsum.photos/32/32?random=12', products: 45, status: 'Active' },
  { id: 'B004', name: 'CableMaster', logo: 'https://picsum.photos/32/32?random=13', products: 200, status: 'Inactive' },
];

export const CATEGORIES: Category[] = [
  { id: 'C001', name: 'Electronics', description: 'Gadgets and devices', products: 450, status: 'Active' },
  { id: 'C002', name: 'Furniture', description: 'Office and home furniture', products: 120, status: 'Active' },
  { id: 'C003', name: 'Accessories', description: 'Cables, hubs, and stands', products: 300, status: 'Active' },
  { id: 'C004', name: 'Audio', description: 'Headphones and speakers', products: 85, status: 'Hidden' },
];

export const USERS: User[] = [
  { id: 'U001', name: 'John Doe', email: 'john@urbanshelf.com', role: 'Admin', status: 'Active' },
  { id: 'U002', name: 'Jane Smith', email: 'jane@urbanshelf.com', role: 'Manager', status: 'Active' },
  { id: 'U003', name: 'Bob Johnson', email: 'bob@external.com', role: 'Viewer', status: 'Suspended' },
  { id: 'U004', name: 'Alice Williams', email: 'alice@urbanshelf.com', role: 'Manager', status: 'Active' },
];

export const PRICING_STRATEGIES: PricingStrategy[] = [
  {
    id: 'PS-001',
    name: 'Standard Wholesale',
    description: 'Default tiered pricing for bulk buyers',
    type: 'Global',
    status: 'Active',
    isDefault: true,
    tiers: [
      { name: 'Small Bulk', minQty: 10, maxQty: 49, discount: 5 },
      { name: 'Large Bulk', minQty: 50, maxQty: null, discount: 10 }
    ]
  },
  {
    id: 'PS-002',
    name: 'Volume Breakers',
    description: 'Aggressive discounts for high volume movers',
    type: 'Global',
    status: 'Active',
    isDefault: false,
    tiers: [
      { name: 'Starter', minQty: 5, maxQty: 9, discount: 2 },
      { name: 'Mover', minQty: 10, maxQty: 19, discount: 5 },
      { name: 'Power', minQty: 20, maxQty: null, discount: 8 }
    ]
  },
  {
    id: 'PS-003',
    name: 'VIP Discount',
    description: 'Special pricing for VIP account holders',
    type: 'Global',
    status: 'Inactive',
    isDefault: false,
    tiers: [
      { name: 'All Orders', minQty: 1, maxQty: null, discount: 15 }
    ]
  }
];

export const CAMPAIGNS: Campaign[] = [
  { 
    id: 'CAM-001', 
    title: 'VELO Deal Alert: Buy 10 Sleeves, Get 1 FREE!', 
    subject: 'Special offer just for you!', 
    status: 'DRAFT', 
    audience: 'Approved Users', 
    recipients: 201, 
    delivered: 0, 
    failed: 0, 
    date: 'Oct 26, 2023', 
    sentAt: '' 
  },
  { 
    id: 'CAM-002', 
    title: 'New Product Launch: 4K Monitors', 
    subject: 'Upgrade your workspace today', 
    status: 'SENT', 
    audience: 'All Users', 
    recipients: 1500, 
    delivered: 1480, 
    failed: 20, 
    date: 'Oct 20, 2023', 
    sentAt: 'Oct 20, 2023 10:00 AM' 
  },
  { 
    id: 'CAM-003', 
    title: 'Weekly Newsletter - October #4', 
    subject: 'Industry insights and top picks', 
    status: 'SENT', 
    audience: 'All Users', 
    recipients: 1200, 
    delivered: 1195, 
    failed: 5, 
    date: 'Oct 15, 2023', 
    sentAt: 'Oct 15, 2023 09:30 AM' 
  },
  { 
    id: 'CAM-004', 
    title: 'Flash Sale: 24 Hours Only', 
    subject: 'Don\'t miss out on these deals', 
    status: 'FAILED', 
    audience: 'Approved Users', 
    recipients: 50, 
    delivered: 10, 
    failed: 40, 
    date: 'Oct 10, 2023', 
    sentAt: 'Oct 10, 2023 02:00 PM' 
  },
  { 
    id: 'CAM-005', 
    title: 'Q4 Wholesale Pricing Update', 
    subject: 'Important update regarding your account', 
    status: 'SENDING', 
    audience: 'Approved Users', 
    recipients: 300, 
    delivered: 150, 
    failed: 0, 
    date: 'Oct 27, 2023', 
    sentAt: 'Sending now...' 
  },
];