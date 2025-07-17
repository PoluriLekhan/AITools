'use client';

import React from "react";
import { Card } from "@/components/ui/card";

const RAZORPAY_KEY = "rzp_test_1DP5mmOlF5G5ag"; // Dummy test key

const handleRazorpay = (amount, plan) => {
  if (typeof window === "undefined") return;
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  script.onload = () => {
    const options = {
      key: RAZORPAY_KEY,
      amount: amount * 100, // in paise
      currency: "INR",
      name: plan + " Plan",
      description: `Purchase the ${plan} Plan`,
      image: "/logo.png",
      handler: function (response) {
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3056D3",
      },
    };
    // eslint-disable-next-line no-undef
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  document.body.appendChild(script);
};

const Pricing = () => {
  return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-br from-white via-blue-50 to-blue-100 pb-12 pt-20 lg:pb-[90px] lg:pt-[120px] animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <div className="w-full mb-12 text-center">
            <span className="mb-2 block text-lg font-semibold text-primary animate-slide-in-right">Pricing Table</span>
            <h2 className="mb-3 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-[40px] animate-fade-in">Our Pricing Plan</h2>
            <p className="text-base text-gray-600 max-w-xl mx-auto animate-fade-in">Choose the plan that suits your needs — whether you're just exploring or building AI-powered experiences at scale.</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8 card_grid">
          <PricingCard
            type="Free Plan"
            price="₹0"
            subscription="lifetime"
            description="Great to explore basic AI tools and features."
            buttonText="Start for Free"
            onClick={() => alert('Enjoy the Free Plan!')}
            features={[
              "Access to Free AI Tools",
              "Basic Support",
              "Community Access",
              "Limited Usage",
            ]}
            active={false}
          />
          <PricingCard
            type="Starter Plan"
            price="₹49"
            subscription="month"
            description="Ideal for personal use and light projects."
            buttonText="Buy Now"
            onClick={() => handleRazorpay(49, 'Starter')}
            features={[
              "All Free Plan Features",
              "Early Access to New Tools",
              "Email Support",
              "Moderate Usage Limit",
              "Tool Recommendations",
            ]}
            active={true}
          />
          <PricingCard
            type="Pro Plan"
            price="₹249"
            subscription="month"
            description="Perfect for professionals and heavy AI users."
            buttonText="Buy Now"
            onClick={() => handleRazorpay(249, 'Pro')}
            features={[
              "All Starter Plan Features",
              "Unlimited Access to All Tools",
              "Priority Support",
              "API Integrations",
              "Unlimited Usage",
              "Early Beta Access",
            ]}
            active={false}
          />
        </div>
      </div>
    </section>
  );
};

const PricingCard = ({ type, price, subscription, description, buttonText, onClick, features, active }) => {
  return (
    <Card className={`relative z-10 mb-10 overflow-hidden rounded-2xl border-2 border-blue-200 bg-white px-8 py-10 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-400 ${active ? 'scale-105 border-primary shadow-2xl' : ''} animate-scale-in`}> 
      <span className="mb-3 block text-lg font-semibold text-blue-600">{type}</span>
      <h2 className="mb-5 text-[42px] font-bold text-gray-900">
        {price}
        <span className="text-base font-medium text-gray-500"> / {subscription}</span>
      </h2>
      <p className="mb-8 border-b border-gray-200 pb-8 text-base text-gray-600">{description}</p>
      <ul className="mb-9 flex flex-col gap-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-700"><span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>{f}</li>
        ))}
      </ul>
      <button
        onClick={onClick}
        className={`w-full rounded-md border border-primary bg-primary p-3 text-center text-base font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 shadow-md ${active ? 'shadow-lg' : ''}`}
      >
        {buttonText}
      </button>
      {/* Decorative SVGs for modern look */}
      <span className="absolute right-0 top-7 z-[-1] opacity-40">
        <svg width={77} height={172} viewBox="0 0 77 172" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx={86} cy={86} r={86} fill="url(#paint0_linear)" />
          <defs>
            <linearGradient id="paint0_linear" x1={86} y1={0} x2={86} y2={172} gradientUnits="userSpaceOnUse">
              <stop stopColor="#3056D3" stopOpacity="0.09" />
              <stop offset={1} stopColor="#C4C4C4" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className="absolute right-4 top-4 z-[-1] opacity-30">
        <svg width={41} height={89} viewBox="0 0 41 89" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="38.91" cy="87.48" r="1.42" fill="#3056D3" />
          <circle cx="38.91" cy="74.99" r="1.42" fill="#3056D3" />
          <circle cx="38.91" cy="62.49" r="1.42" fill="#3056D3" />
          <circle cx="38.91" cy="38.35" r="1.42" fill="#3056D3" />
          <circle cx="38.91" cy="13.63" r="1.42" fill="#3056D3" />
          <circle cx="38.91" cy="50.28" r="1.42" fill="#3056D3" />
          <circle cx="38.91" cy="26.13" r="1.42" fill="#3056D3" />
          <circle cx="38.91" cy="1.42" r="1.42" fill="#3056D3" />
          <circle cx="26.42" cy="87.48" r="1.42" fill="#3056D3" />
          <circle cx="26.42" cy="74.99" r="1.42" fill="#3056D3" />
          <circle cx="26.42" cy="62.49" r="1.42" fill="#3056D3" />
          <circle cx="26.42" cy="38.35" r="1.42" fill="#3056D3" />
          <circle cx="26.42" cy="13.63" r="1.42" fill="#3056D3" />
          <circle cx="26.42" cy="50.28" r="1.42" fill="#3056D3" />
          <circle cx="26.42" cy="26.13" r="1.42" fill="#3056D3" />
        </svg>
      </span>
    </Card>
  );
};

export default Pricing;
