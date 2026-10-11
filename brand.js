(() => {
  'use strict';
  const mountainSVG = `<svg class="onyria-mountain" viewBox="0 0 142 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M3 72 C17 66 31 49 46 33 C49 30 52 27 55 30 C58 35 58 43 61 50 C68 39 75 22 81 9 C83 5 85 3 87 5 C91 14 90 31 96 45 C99 40 101 35 103 31 C105 28 108 29 110 32 C119 45 127 61 139 71 C125 65 113 49 106 39 C103 43 100 50 97 53 C95 57 94 57 92 54 C85 41 83 25 82 17 C74 33 64 53 56 64 C54 65 53 63 53 61 C54 53 52 41 50 36 C36 52 20 68 3 72 Z M84 15 C83 25 87 39 92 48 C88 36 86 24 84 15 Z M54 38 C54 44 55 49 56 54 C57 48 56 42 54 38 Z M109 38 C117 50 124 59 131 64 C122 54 115 44 109 38 Z"/><path fill="currentColor" d="M5 76 C23 67 36 54 47 40 C36 58 19 72 5 76 Z M57 71 C67 55 74 40 80 25 C78 41 68 60 57 71 Z M97 59 C107 64 119 70 135 74 C119 73 107 67 97 59 Z"/></svg>`;
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
