import { Link, useNavigate } from "react-router";
import { UtensilsCrossed, ShoppingBag, Star, Truck, Shield, Clock, ArrowRight, Store, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">MB Crunchy</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white" onClick={() => navigate("/admin")}>
              Admin <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 rounded-full text-sm text-orange-700 font-medium mb-6">
          <Sparkles className="h-4 w-4" /> Fresh & Delicious
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
          Your Favorite
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent block">
            Food & Groceries
          </span>
          Delivered Fast
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          From our kitchen to your doorstep. Fresh meals, quality groceries, and everything you need — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-orange-200">
            <UtensilsCrossed className="h-5 w-5 mr-2" /> Order Kitchen
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-2">
            <ShoppingBag className="h-5 w-5 mr-2" /> Shop Mart
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose MB Crunchy?</h2>
          <p className="text-gray-500 mt-2">Quality food and groceries delivered with care</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Star, title: "Premium Quality", desc: "Hand-picked ingredients and freshly prepared meals every day" },
            { icon: Truck, title: "Fast Delivery", desc: "Free delivery on orders above ₹200. Track your order in real-time" },
            { icon: Shield, title: "Hygiene First", desc: "Strict hygiene standards followed in our kitchen and packaging" },
            { icon: Clock, title: "Open 7 Days", desc: "From 9 AM to 10 PM — we're here when you need us" },
            { icon: ShoppingBag, title: "Kitchen & Mart", desc: "Order fresh food and grocery essentials from one platform" },
            { icon: Star, title: "Best Value", desc: "Competitive prices with regular offers and combo deals" },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="group p-6 rounded-2xl bg-white border border-orange-100 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Admin CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Manage Your Store</h2>
          <p className="text-orange-100 mb-8 text-lg">Access the admin panel to manage products, categories, orders, and more.</p>
          <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-6 rounded-xl shadow-lg" onClick={() => navigate("/admin")}>
            <Shield className="h-5 w-5 mr-2" /> Admin Dashboard
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Store className="h-5 w-5 text-orange-400" />
                <span className="font-bold text-white text-lg">MB Crunchy</span>
              </div>
              <p className="text-sm">Fresh & delicious food and groceries delivered to your doorstep.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <p className="hover:text-orange-400 cursor-pointer">Kitchen Menu</p>
                <p className="hover:text-orange-400 cursor-pointer">Mart Products</p>
                <p className="hover:text-orange-400 cursor-pointer">Special Offers</p>
                <p className="hover:text-orange-400 cursor-pointer">Contact Us</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm">
                <p>📞 +91 9876543210</p>
                <p>✉️ hello@mbcrunchy.com</p>
                <p>📍 Your City, India</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-xs">
            <p>© 2026 MB Crunchy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
