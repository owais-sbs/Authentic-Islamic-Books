/**
 * Scroll-reveal helpers: content fades up and sharpens from a soft blur as it
 * enters the viewport (once). Honours prefers-reduced-motion (fade only).
 */
import type { ReactNode } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from 'framer-motion';

export const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' } as const;

/** Blur is removed after the animation so it never affects fixed/sticky children. */
function hiddenState(reduced: boolean, distance = 24) {
  return reduced ? { opacity: 0 } : { opacity: 0, y: distance, filter: 'blur(10px)' };
}

const SHOWN = { opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } };

/** Props for a motion element that blur-reveals on scroll. */
export function useRevealProps(delay = 0, distance = 24) {
  const reduced = !!useReducedMotion();
  return {
    initial: hiddenState(reduced, distance),
    whileInView: SHOWN,
    viewport: VIEWPORT,
    transition: { duration: reduced ? 0.25 : 0.7, ease: REVEAL_EASE, delay },
  };
}

type RevealTag = 'div' | 'section' | 'header' | 'footer' | 'article' | 'li' | 'ul' | 'aside';

type RevealProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'whileInView' | 'viewport' | 'transition'> & {
  as?: RevealTag;
  delay?: number;
  distance?: number;
  children?: ReactNode;
};

export function Reveal({ as = 'div', delay = 0, distance = 24, children, ...rest }: RevealProps) {
  const props = useRevealProps(delay, distance);
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp {...props} {...rest}>
      {children}
    </Comp>
  );
}

const containerVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07 } },
};

/** Grid/list wrapper — children wrapped in <StaggerItem> reveal one after another. */
export function Stagger({ as = 'div', children, ...rest }: Omit<RevealProps, 'delay' | 'distance'>) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp variants={containerVariants} initial="hidden" whileInView="shown" viewport={VIEWPORT} {...rest}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ as = 'div', children, ...rest }: Omit<RevealProps, 'delay' | 'distance'>) {
  const reduced = !!useReducedMotion();
  const variants: Variants = {
    hidden: hiddenState(reduced, 20),
    shown: { ...SHOWN, transition: { duration: reduced ? 0.25 : 0.6, ease: REVEAL_EASE } },
  };
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp variants={variants} {...rest}>
      {children}
    </Comp>
  );
}
