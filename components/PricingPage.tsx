import React from 'react';
import { SubscriptionStatus } from '../types';

interface PricingPageProps {
  onSelectPlan: (plan: SubscriptionStatus) => void;
  currentPlan: SubscriptionStatus;
  onBack: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan, currentPlan, onBack }) => {
  const plans = [
    {
      id: SubscriptionStatus.FREE,
      name: "Starter",
      price: "$0",
      description: "For solo inventors exploring ideas.",
      features: ["Standard AI Chat", "3 Synapse Projects", "Community Support", "Basic Reverse Engineering"],
      buttonText: currentPlan === SubscriptionStatus.FREE ? "Current Plan" : "Downgrade",
      highlight: false,
    },
    {
      id: SubscriptionStatus.PRO_ACTIVE,
      name: "Professional",
      price: "$99",
      period: "/mo",
      trial: "Start 7-Day Free Trial",
      description: "Complete IP protection for consultants.",
      features: [
        "Unlimited Synapses",
        "Automated Patent Drafting",
        "Dynamic Copyright Injection",
        "10 Innovation Certificates/mo",
        "Priority AI Reasoning (Pro Models)"
      ],
      buttonText: currentPlan === SubscriptionStatus.PRO_ACTIVE || currentPlan === SubscriptionStatus.PRO_TRIAL ? "Current Plan" : "Go Pro",
      highlight: true,
    },
    {
      id: SubscriptionStatus.ENTERPRISE,
      name: "Enterprise",
      price: "Custom",
      description: "Scale your firm’s R&D output.",
      features: [
        "White-label Certificates",
        "Multi-user Legal Review",
        "Sovereign Data Encryption",
        "Dedicated Support PhD Agent",
        "On-Premise RAG Deployment"
      ],
      buttonText: "Contact Sales",
      highlight: false,
    }
  ];

  return (
    <div className="py-12 bg-gray-50 dark:bg-brand-dark min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-brand-cyan transition-colors mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          Back to Workspace
        </button>

        <h2 className="text-4xl font-black text-gray-900 dark:text-brand-light sm:text-5xl tracking-tighter">
          Secure Your Innovations
        </h2>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose the SynapseForge tier that fits your Intellectual Property velocity. All Pro plans start with a 1-week free trial.
        </p>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-5xl lg:mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`flex flex-col border rounded-2xl shadow-xl divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ${plan.highlight ? 'ring-4 ring-brand-cyan scale-105 z-10' : 'hover:scale-[1.02]'}`}
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-widest">{plan.name}</h3>
                    {plan.highlight && <span className="bg-brand-cyan text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Best Value</span>}
                </div>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                  {plan.period && <span className="text-lg font-medium text-gray-500 dark:text-gray-400">{plan.period}</span>}
                </p>
                {plan.trial && <p className="text-brand-cyan font-bold text-sm mt-2">{plan.trial}</p>}
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{plan.description}</p>
                
                <button 
                  onClick={() => plan.id && onSelectPlan(plan.id === SubscriptionStatus.PRO_ACTIVE ? SubscriptionStatus.PRO_TRIAL : plan.id)}
                  disabled={plan.buttonText === "Current Plan" || plan.id === SubscriptionStatus.ENTERPRISE}
                  className={`mt-8 block w-full py-4 px-6 border-2 rounded-xl text-md font-black uppercase tracking-widest text-center transition-all active:scale-95 ${plan.highlight ? 'bg-brand-cyan border-brand-cyan text-white hover:bg-cyan-500 shadow-lg shadow-cyan-900/40' : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-cyan hover:text-brand-cyan'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {plan.buttonText}
                </button>
              </div>
              <div className="pt-8 pb-10 px-8 text-left bg-gray-50 dark:bg-gray-900/30 rounded-b-2xl">
                <h4 className="text-xs font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-6">What's included</h4>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-10">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">PLaaS IP Sovereignty Policy</h4>
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                <div>
                    <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">User Ownership</p>
                    <p>You retain all rights, title, and interest in and to any innovations, code, designs, or technical documentation generated through SynapseForge AI.</p>
                </div>
                <div>
                    <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Legal Attribution</p>
                    <p>Automated legal headers (Copyright/Trademark) are applied based on the "Legal Identity" provided in your Account Settings.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
