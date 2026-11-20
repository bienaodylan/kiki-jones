import React from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { formatXOF } from '../lib/format';

export function LegalPage({ docType }: { docType: 'shipping' | 'returns' | 'privacy' | 'terms' }) {
  const { storefrontConfig } = useStore();
  const { tr } = useLanguage();

  const stdFee = formatXOF(storefrontConfig.standardShippingXof || 3500);
  const freeThreshold = formatXOF(storefrontConfig.freeShippingThresholdXof || 75000);
  const expFee = formatXOF(storefrontConfig.expressShippingXof || 7500);
  const supportEmail = storefrontConfig.supportEmail || 'care@kikijones.com';

  const content = {
    shipping: {
      eyebrow: tr('Service Client', 'Client Care'),
      title: tr('Politique de livraison & expédition', 'Shipping & Delivery Policy'),
      paragraphs: [
        tr(
          `La livraison standard à Abidjan et en Afrique de l'Ouest est facturée ${stdFee}, et offerte dès ${freeThreshold} d'achat.`,
          `Standard Delivery across Abidjan and West Africa is ${stdFee}, and complimentary on orders above ${freeThreshold}.`
        ),
        tr(
          `La livraison Express par coursier (24 heures) est disponible pour ${expFee}.`,
          `Express Courier dispatch (24 hours) is available for ${expFee}.`
        ),
        tr(
          'Les commandes entrent en préparation immédiatement après vérification du paiement côté serveur.',
          'Orders enter fulfillment processing immediately after server-side payment verification.'
        ),
      ],
    },
    returns: {
      eyebrow: tr('Service Client', 'Client Care'),
      title: tr('Retours & Échanges', 'Returns & Exchanges'),
      paragraphs: [
        tr(
          'Les articles non portés, avec leurs étiquettes d’origine intactes, peuvent être retournés ou échangés sous 14 jours après réception.',
          'Unworn garments with original tags and hygiene seals intact may be returned or exchanged within 14 days of delivery.'
        ),
        tr(
          'Pour des raisons d’hygiène, les pièces de lingerie et bodys doivent conserver leur protection d’origine.',
          'For hygiene protection, swimwear and intimate pieces must retain their original protective liner.'
        ),
        tr(
          `Pour demander un échange ou un retour, contactez ${supportEmail} avec votre référence de commande KIKI JONES.`,
          `To initiate an exchange or return, contact ${supportEmail} with your KIKI JONES order reference.`
        ),
      ],
    },
    privacy: {
      eyebrow: tr('Politique de la Maison', 'House Policy'),
      title: tr('Confidentialité & Protection des données', 'Privacy & Data Protection'),
      paragraphs: [
        tr(
          'KIKI JONES collecte uniquement les données personnelles nécessaires au traitement des commandes, à la réservation du stock et à la livraison.',
          'KIKI JONES collects only the personal information required to process orders, reserve inventory, and deliver shipments.'
        ),
        tr(
          'Les adresses clients et historiques de commandes sont strictement isolés par compte authentifié et ne sont jamais revendus à des tiers.',
          'Customer addresses and order records are isolated by authenticated user identity and are never sold or shared with third-party advertisers.'
        ),
        tr(
          'Les paiements sont traités exclusivement via des prestataires vérifiés (Wave, Orange Money, Mobile Money, Visa, Mastercard).',
          'Payment credentials are processed exclusively by verified payment gateways (Wave, Orange Money, Mobile Money, Visa, Mastercard).'
        ),
      ],
    },
    terms: {
      eyebrow: tr('Politique de la Maison', 'House Policy'),
      title: tr('Conditions générales de vente', 'Terms of Sale'),
      paragraphs: [
        tr(
          'Tous les prix sont affichés et réglés en Francs CFA (FCFA / XOF), taxes incluses.',
          'All prices are displayed and settled in West African CFA Francs (XOF), inclusive of applicable taxes.'
        ),
        tr(
          'L’ajout d’un article au panier ne réserve pas le stock ; l’inventaire est réservé pendant 15 minutes dès validation de la commande.',
          'Adding an item to your bag does not reserve stock; inventory is reserved transactionally for 15 minutes when checkout is submitted.'
        ),
        tr(
          'Les pièces en précommande affichent une date estimée d’expédition directement sur la fiche produit.',
          'Pre-order pieces carry an estimated dispatch date and configurable allocation limit shown on the product page.'
        ),
      ],
    },
  }[docType];

  return (
    <main className="pt-28 pb-24 max-w-3xl mx-auto px-5 md:px-10 min-h-[70vh]">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-black/50">
        {content.eyebrow}
      </p>
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
