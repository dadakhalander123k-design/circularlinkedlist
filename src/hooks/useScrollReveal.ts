import { useEffect } from 'react';

/**
 * useScrollReveal Hook
 * Observes elements with `.reveal-on-scroll`, `.reveal-fade-left`,
 * `.reveal-fade-right`, `.reveal-scale-up`, or `[data-reveal]` attributes.
 * Transitions elements smoothly from opacity 0 / translateY(15px) to opacity 1 / translateY(0).
 * Includes safe fallbacks so content is never left hidden.
 */
export function useScrollReveal(dependencies: any[] = []) {
  useEffect(() => {
    const selector =
      '.reveal-on-scroll, .reveal-fade-left, .reveal-fade-right, .reveal-scale-up, [data-reveal]';

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If reduced motion is preferred, immediately reveal all elements without transitions
    if (prefersReducedMotion) {
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    // Fallback if IntersectionObserver is not supported
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            observer.unobserve(target);
            target.classList.add('is-revealed');
          }
        });
      },
      {
        threshold: 0.02,
        rootMargin: '0px 0px 30px 0px',
      }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        if (!el.classList.contains('is-revealed')) {
          observer.observe(el);
        }
      });
    };

    // Initial check
    observeElements();

    // Secondary pass after brief tick to catch elements rendered in subsequent paint cycles
    const tickTimeout = setTimeout(() => {
      observeElements();
    }, 50);

    // MutationObserver to observe dynamically mounted elements on chapter or tab switch
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Safety fallback: ensure no element remains permanently invisible under any circumstance
    const safetyFallback = setTimeout(() => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.classList.contains('is-revealed')) {
          el.classList.add('is-revealed');
        }
      });
    }, 2000);

    return () => {
      clearTimeout(tickTimeout);
      clearTimeout(safetyFallback);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, dependencies);
}
