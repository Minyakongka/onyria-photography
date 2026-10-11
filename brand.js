(() => {
  'use strict';
  const mountainSVG = `<svg class="onyria-mountain" viewBox="0 0 132 76" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M2 68 19 51 27 53 43 30 49 38 70 4 91 37 99 29 111 49 117 47 130 69 112 64 104 65 88 55 79 61 65 51 51 63 37 56 23 65Z M70 13 58 39 64 34 68 41 72 31 83 43Z M43 38 34 53 42 47 48 54 46 43Z M99 37 92 47 99 45 107 55Z"/><path fill="currentColor" d="M68 44 72 36 80 53 75 49 78 60 70 53 65 58Z M29 68 44 60 49 65 61 56 72 65 82 62 101 71 77 69 65 66 55 69 44 65Z"/></svg>`;
  class OnyriaMountain extends HTMLElement {
    connectedCallback() {if (!this.querySelector('svg')) this.innerHTML = mountainSVG;}
  }
  if (!customElements.get('onyria-mountain')) customElements.define('onyria-mountain', OnyriaMountain);
  class OnyriaLogo extends HTMLElement {
    connectedCallback() {
      if (this.querySelector('.onyria-wordmark')) return;
      this.innerHTML = `${this.hasAttribute('wordmark-only') ? '' : mountainSVG}<span class="onyria-wordmark">ONYRI<span class="onyria-letter-a"><span class="onyria-a-source">A</span><svg viewBox="0 0 712 714" aria-hidden="true" focusable="false"><path transform="translate(0 714) scale(1 -1)" d="M359 714 655 6H570L339 619ZM144 73Q137 53 142 39Q147 25 158.5 17.5Q170 10 182 10H191V0H-10V10H-1Q22 10 46.5 24.5Q71 39 87 73ZM359 714 368 644 117 3H57L313 611Q313 611 318.5 623.5Q324 636 331.5 654Q339 672 344.5 689Q350 706 350 714ZM545 73H627Q642 39 667 24.5Q692 10 715 10H723V0H498V10H507Q526 10 541 26.5Q556 43 545 73Z" fill="currentColor"/></svg></span></span><span class="onyria-divider"></span><span class="onyria-subtitle">摄影集</span>`;
    }
  }
  if (!customElements.get('onyria-logo')) customElements.define('onyria-logo', OnyriaLogo);
})();
