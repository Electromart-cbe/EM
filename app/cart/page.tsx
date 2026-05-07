"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, CheckCircle } from "lucide-react";
import { sendCustomerEmail, sendShopEmail } from "@/lib/email";
import { useCart } from "@/context/ShoppingCartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  
  const formatUrl = (url?: string) => {
    if (!url) return `/images/placeholder.png`;
    if (url.startsWith('http')) return url;
    return url.toLowerCase().replace(/\s+/g, '-');
  };

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "Vikram",
    email: "vikram@gmail.com",
    phone: "1234567890",
    notes: ""
  });

  const handleQuantityChange = (id: string, current: number, change: number) => {
    const newQuantity = current + change;
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    } else {
      removeFromCart(id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sendCustomerEmail(formData, cart, cartTotal);
      await sendShopEmail(formData, cart, cartTotal);
      
      setIsSuccess(true);
      clearCart();
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Failed to send order emails", error);
      alert("There was an error placing your order. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for your order. We have received your request and will contact you shortly regarding delivery and payment.
          </p>
          <Link
            href="/products"
            className="inline-flex w-full justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-brand-orange hover:bg-[#ff943d] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
        <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 text-lg mb-8 max-w-md text-center">
          Looks like you haven't added any components to your cart yet.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-brand-orange hover:bg-[#ff943d] shadow-lg shadow-brand-orange/30 transition-all hover:-translate-y-0.5"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <Link href={`/products/${item.id}`} className="block flex-shrink-0 bg-gray-50 rounded-xl p-2 w-24 h-24 relative">
                  <img
                    src={formatUrl(item.images?.[0])}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-contain p-1"
                  />
                </Link>
                
                <div className="flex-grow">
                  <Link href={`/products/${item.id}`} className="font-semibold text-gray-900 hover:text-brand-orange transition-colors line-clamp-2">
                    {item.name}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">{item.category}</div>
                  <div className="font-bold text-gray-900 mt-2">
                    ₹{item.price.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      className="p-2 text-gray-600 hover:text-brand-orange transition-colors"
                      disabled={isSubmitting}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                      className="p-2 text-gray-600 hover:text-brand-orange transition-colors"
                      disabled={isSubmitting}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4 sm:ml-6"
                    disabled={isSubmitting}
                    aria-label="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Checkout Form */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span className="font-medium text-gray-900">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Calculated later</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-extrabold text-brand-orange">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {!isCheckingOut ? (
                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full flex items-center justify-center px-6 py-4 bg-brand-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors group"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              ) : (
                <div className="border-t border-gray-100 pt-6 mt-2">
                  <h3 className="font-bold text-gray-900 mb-4">Contact Details</h3>
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all"
                        placeholder="Vikram"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all"
                        placeholder="vikram@gmail.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all"
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={2}
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all resize-none"
                        placeholder="Any special instructions..."
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-brand-orange hover:bg-[#ff943d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-70 transition-all mt-6"
                    >
                      {isSubmitting ? "Processing..." : "Place Order"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      disabled={isSubmitting}
                      className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium py-2 text-center"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
