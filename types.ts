import React from 'react';

export interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'Active' | 'Draft' | 'Low Stock';
  image: string;
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  items: number;
  status: 'Completed' | 'Pending' | 'Processing' | 'Cancelled';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  storeName: string;
  regNo: string;
  address: string;
  status: 'Approved' | 'Pending' | 'Blocked';
  walletBalance: number;
  joinedDate: string;
  image?: string;
}

export interface Cart {
  id: string;
  userEmail: string;
  userName: string;
  totalItems: number;
  totalQty: number;
  items: string[];
  lastUpdated: string;
  created: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  products: number;
  status: 'Active' | 'Inactive';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  products: number;
  status: 'Active' | 'Hidden';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  status: 'Active' | 'Suspended';
}

export interface Coupon {
  id: string;
  code: string;
  type: 'Fixed Amount' | 'Percentage';
  value: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  status: 'Active' | 'Expired' | 'Upcoming';
  categories: string[];
}

export interface PricingTierItem {
  name: string;
  minQty: number;
  maxQty: number | null; // null represents "+" (infinity)
  discount: number;
}

export interface PricingStrategy {
  id: string;
  name: string;
  description: string;
  type: 'Global' | 'Category' | 'Product';
  status: 'Active' | 'Inactive';
  isDefault: boolean;
  tiers: PricingTierItem[];
}

export interface Campaign {
  id: string;
  title: string;
  subject: string;
  status: 'DRAFT' | 'SENT' | 'FAILED' | 'SENDING';
  audience: string;
  recipients: number;
  delivered: number;
  failed: number;
  date: string;
  sentAt?: string;
  content?: string;
  attachments?: string[]; // Array of filenames
}

export type TableColumn<T> = {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
};