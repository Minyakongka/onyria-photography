(() => {
  'use strict';
  class OnyriaLogo extends HTMLElement {
    connectedCallback() {
      if (this.querySelector('.onyria-wordmark')) return;
      this.innerHTML = `<svg class="onyria-mountain" viewBox="0 0 80 54" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="m42 4-6 24 8-6 11 22-13-40Z" fill="currentColor" opacity=".28"/><path d="M3 48 19 31 27 38 42 4 59 35 65 28 77 48M42 4l-6 24 8-6 11 22M19 31l9 14M65 28l-7 16" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" stroke-linejoin="miter"/></svg><span class="onyria-wordmark">ONYRI<span class="onyria-letter-a"><span class="onyria-a-source">A</span><svg viewBox="0 0 712 714" aria-hidden="true" focusable="false"><path transform="translate(0 714) scale(1 -1)" d="M359 714 655 6H570L339 619ZM144 73Q137 53 142 39Q147 25 158.5 17.5Q170 10 182 10H191V0H-10V10H-1Q22 10 46.5 24.5Q71 39 87 73ZM359 714 368 644 117 3H57L313 611Q313 611 318.5 623.5Q324 636 331.5 654Q339 672 344.5 689Q350 706 350 714ZM545 73H627Q642 39 667 24.5Q692 10 715 10H723V0H498V10H507Q526 10 541 26.5Q556 43 545 73Z" fill="currentColor"/></svg></span></span><span class="onyria-divider"></span><span class="onyria-subtitle">摄影集</span>`;
    }
  }
  if (!customElements.get('onyria-logo')) customElements.define('onyria-logo', OnyriaLogo);
})();
