import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { MegaMenuKey, MEGA_MENUS } from '../../lib/navigationData';

interface MegaMenuProps {
  activeKey: MegaMenuKey | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function MegaMenu({
  activeKey,
  onClose,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) {
  const config = activeKey ? MEGA_MENUS[activeKey] : null;

  return (
    <AnimatePresence>
      {config && (
        <>
          {/* Subtle backdrop dim below header */}
          <motion.div
            key="mega-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-x-0 top-[88px] lg:top-[96px] bottom-0 bg-black/25 backdrop-blur-[1px] z-30"
          />

          {/* Pure White Editorial Floating Mega Menu Panel */}
          <motion.div
            key={`mega-panel-${config.key}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="fixed inset-x-0 top-[88px] lg:top-[96px] z-40 bg-white border-b border-black/10 text-black shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)]"
          >
            <div className="max-w-[1440px] mx-auto px-6 xl:px-10 py-9">
              <div className="grid grid-cols-12 gap-8 items-start">
                {/* Category Columns */}
                <div className="col-span-9 grid grid-cols-4 gap-x-8 gap-y-6">
                  {config.columns.map((column) => (
                    <div key={column.heading} className="space-y-3.5">
                      <h3 className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black pb-2 border-b border-black/10">
                        {column.heading}
                      </h3>
                      <ul
                        className={
                          column.links.length > 9
                            ? 'grid grid-cols-2 gap-x-4 gap-y-2'
                            : 'space-y-2'
                        }
                      >
                        {column.links.map((link) => (
                          <li key={`${column.heading}-${link.label}`}>
                            <button
                              type="button"
                              onClick={() => {
                                onNavigate(link.href);
                                onClose();
                              }}
                              className="text-left text-[12.5px] font-light text-black/75 hover:text-black hover:underline underline-offset-4 transition-colors cursor-pointer leading-snug"
                            >
                              {link.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Large Editorial Feature Card on Right */}
                <div className="col-span-3">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(config.editorial.href);
                      onClose();
                    }}
                    className="group block w-full text-left cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F5F5]">
                      <img
                        src={config.editorial.imageUrl}
                        alt={config.editorial.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-1.5">
                        <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/80">
                          {config.editorial.eyebrow}
                        </p>
                        <p className="font-editorial text-2xl leading-tight text-white">
                          {config.editorial.title}
                        </p>
                        <span className="inline-flex items-center gap-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white group-hover:underline underline-offset-4">
                          {config.editorial.ctaLabel}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
