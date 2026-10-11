(() => {
  'use strict';
  const mountainSVG = `<svg class="onyria-mountain" viewBox="0 0 136 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M30 69 C43 56 57 30 69 7 C70 5 72 3 75 2 C69 18 78 35 94 51 C105 62 116 65 134 68 C116 72 99 66 88 58 C77 50 72 37 68 26 C58 44 51 57 40 65 C37 67 33 68 30 69 Z"/><path fill="currentColor" d="M2 68 C15 60 24 44 37 29 C39 27 40 26 43 25 C40 35 48 45 54 51 C49 53 47 55 44 58 C39 52 37 43 35 39 C26 51 17 62 2 68 Z"/><path fill="currentColor" d="M89 51 C93 43 99 32 104 27 C107 38 116 47 121 53 C125 58 129 61 134 62 C119 61 110 52 104 41 C101 47 97 53 95 56 Z"/><path fill="currentColor" d="M14 75 C32 67 41 63 53 57 C57 55 61 54 65 54 C58 59 54 63 50 65 C62 62 71 62 82 66 C97 72 108 75 125 74 C111 80 95 77 80 73 C62 67 47 70 32 73 C25 75 20 76 14 75 Z"/><path fill="currentColor" d="M69 39 C72 46 78 54 85 59 C77 57 72 53 68 49 C64 52 61 55 57 56 C62 50 66 44 69 39 Z"/></svg>`;
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
