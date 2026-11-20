import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatXOF } from '../lib/format';

export function LegalPage({ docType }: { docType: 'shipping' | 'returns' | 'privacy' | 'terms' }) {
  const { storefrontConfig } = useStore();

  const content = {
    shipping: {
      eyebrow: 'Client Care',
      title: 'Shipping & Delivery Policy',
      paragraphs: [
        `Standard Delivery across Abidjan and West Africa is ${formatXOF(
          storefrontConfig.standardShippingXof || 3500
        )}, and complimentary on orders above ${formatXOF(
          storefrontConfig.freeShippingThresholdXof || 75000
        )}.`,
        `Express Courier dispatch (24 hours) is available for ${formatXOF(
          storefrontConfig.expressShippingXof || 7500
        )}.`,
        'Orders enter fulfillment processing immediately after server-side payment verification.',
      ],
    },
    returns: {
      eyebrow: 'Client Care',
      title: 'Returns & Exchanges',
      paragraphs: [
        'Unworn garments with original tags and hygiene seals intact may be returned or exchanged within 14 days of delivery.',
        'For hygiene protection, swimwear and intimate pieces must retain their original protective liner.',
        `To initiate an exchange or return, contact ${
          storefrontConfig.supportEmail || 'care@kikijones.com'
        } with your KIKI JONES order reference.`,
      ],
    },
    privacy: {
      eyebrow: 'House Policy',
      title: 'Privacy & Data Protection',
      paragraphs: [
        'KIKI JONES collects only the personal information required to process orders, reserve inventory, and deliver shipments.',
        'Customer addresses and order records are isolated by authenticated user identity and are never sold or shared with third-party advertisers.',
        'Payment credentials are processed exclusively by verified payment gateways (Wave, Orange Money, Mobile Money, Visa, Mastercard).',
      ],
    },
    terms: {
      eyebrow: 'House Policy',
      title: 'Terms of Sale',
      paragraphs: [
        'All prices are displayed and settled in West African CFA Francs (XOF), inclusive of applicable taxes.',
        'Adding an item to your bag does not reserve stock; inventory is reserved transactionally for 15 minutes when checkout is submitted.',
        'Pre-order pieces carry an estimated dispatch date and configurable allocation limit shown on the product page.',
      ],
    },
  }[docType];

  return (
    <main className="pt-28 pb-24 max-w-3xl mx-auto px-5 md:px-10 min-h-[70vh]">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-black/50">{content.eyebrow}</p>
      <h1 className="font-editorial text-4xl md:text-5xl text-black mt-2 mb-8">
        {content.title}
      </h1>
      <div className="space-y-5 text-sm md:text-base font-light text-black/80 leading-relaxed pt-2">
        {content.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </main>
  );
}
