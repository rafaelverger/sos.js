/* global window document */
const SOS = {
  scrollTimeout: 100,
  watchStickerTimeout: undefined,
  assistedPositionRules: [
    'display',
    'width', 'height',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  ],

  genEventDetail: (sticky) => ({ detail: { sticky }, bubbles: true }),

  addPlaceholder(sticker) {
    const stickerStyle = window.getComputedStyle(sticker);
    const placeholder = document.createElement('div');

    for (let i = stickerStyle.length - 1; i >= 0; i--) {
      const rule = stickerStyle[i];
      if (SOS.assistedPositionRules.indexOf(rule) > -1) {
        placeholder.style[rule] = stickerStyle.getPropertyValue(rule);
      }
    }

    /* eslint-disable no-param-reassign */
    sticker.parentNode.insertBefore(placeholder, sticker);
    sticker.placeholder = placeholder;
    sticker.className += ' sticky';
    /* eslint-enable no-param-reassign */

    const evt = new window.CustomEvent('stickyToggle', SOS.genEventDetail(true));
    sticker.dispatchEvent(evt);
  },

  removePlaceholder(sticker) {
    /* eslint-disable no-param-reassign */
    if (sticker.placeholder) {
      sticker.parentNode.removeChild(sticker.placeholder);
      sticker.placeholder = undefined;
    }
    sticker.className = sticker.className.replace(/(\b)sticky(\b)/g, '$1$2').trim();
    /* eslint-enable no-param-reassign */

    const evt = new window.CustomEvent('stickyToggle', SOS.genEventDetail(false));
    sticker.dispatchEvent(evt);
  },

  watchSticker(evt, sticker) {
    sticker.watchStickerTimeout = undefined;
    const { offsetHeight, bottomRef } = sticker;
    const top = (sticker.placeholder || sticker).getBoundingClientRect().top;
    const isAfterSticker = top <= 0;
    const isAfterRef = bottomRef && bottomRef.getBoundingClientRect().bottom < offsetHeight;
    const isInsideArea = isAfterSticker && !isAfterRef;

    if (!sticker.placeholder && isInsideArea) {
      this.addPlaceholder(sticker);
    } else if (sticker.placeholder && !isInsideArea) {
      this.removePlaceholder(sticker);
    }
  },

  stickOnScroll(sticker) {
    if (sticker.stick) {
      return;
    }
    /* eslint-disable no-param-reassign */
    sticker.stick = (e) => {
      if (!this.watchStickerTimeout) {
        sticker.watchStickerTimeout = window.setTimeout(() => {
          this.watchSticker(e, sticker);
        }, this.scrollTimeout);
      }
    };
    sticker.bottomRef = document.querySelector(sticker.getAttribute('data-fos-bottomref'));
    /* eslint-enable no-param-reassign */
    window.addEventListener('scroll', sticker.stick);
  },

  discoverAll() {
    const stickOnScroll = ::this.stickOnScroll;
    const elements = [].slice.call(document.querySelectorAll('[data-fos]'), 0);
    elements.forEach(stickOnScroll);
  },
};

export default SOS;
