// Eased wheel/trackpad scrolling (Lenis). Touch keeps native momentum, and
// visitors who prefer reduced motion get plain native scrolling.
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export const lenis = matchMedia('(prefers-reduced-motion: reduce)').matches
  ? null
  : new Lenis({
      autoRaf: true,
      lerp: 0.1,
      allowNestedScroll: true,
      // Sections land flush with the top; their padding clears the island.
      anchors: true,
      stopInertiaOnNavigate: true,
    });
