(() => {
  'use strict';
  class OnyriaLogo extends HTMLElement {
    connectedCallback() {
      if (this.querySelector('.onyria-wordmark')) return;
      this.innerHTML = `<svg class="onyria-mountain" viewBox="0 0 80 54" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 48 19 34 25 38 42 5 58 34 64 29 77 48M42 5 39 23 44 19 51 35M19 34 28 42M64 29 58 40" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="onyria-wordmark">ONYRIA</span><span class="onyria-divider"></span><span class="onyria-subtitle">摄影集</span>`;
    }
  }
  if (!customElements.get('onyria-logo')) customElements.define('onyria-logo', OnyriaLogo);
})();
