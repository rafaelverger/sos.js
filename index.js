/* global window document */
const FOS = {
  addPlaceholder(sticker) {
    const positionRules = ['width', 'height', 'margin'];
    const stickerStyle = window.getComputedStyle(sticker);
    const placeholder = document.createElement('div');

    for (let i = stickerStyle.length - 1; i >= 0; i--) {
      const rule = stickerStyle[i];
      if (positionRules.includes(rule)) {
        placeholder.style[rule] = stickerStyle.getPropertyValue(rule);
      }
    }

    sticker.parentNode.insertBefore(placeholder, sticker);
    sticker.placeholder = placeholder; // eslint-disable-line no-param-reassign
  },

  removePlaceholder(sticker) {
    if (sticker.placeholder) {
      sticker.parentNode.removeChild(sticker.placeholder);
      sticker.placeholder = undefined; // eslint-disable-line no-param-reassign
    }
  },

  watchSticker(evt, sticker) {
    const { offsetHeight, bottomRef } = sticker;
    const top = (sticker.placeholder || sticker).getBoundingClientRect().top;
    const isAfterSticker = top <= 0;
    const isAfterRef = bottomRef && bottomRef.getBoundingClientRect().bottom < offsetHeight;
    const isInsideArea = isAfterSticker && !isAfterRef;

    if (!sticker.placeholder && isInsideArea) {
      this.addPlaceholder(sticker);
      sticker.classList.add('sticky');
    } else if (sticker.placeholder && !isInsideArea) {
      this.removePlaceholder(sticker);
      sticker.classList.remove('sticky');
    }
  },

  fixOnScroll(sticker) {
    if (sticker.stick) {
      return;
    }
    /* eslint-disable no-param-reassign */
    sticker.stick = (e) => this.watchSticker(e, sticker);
    sticker.bottomRef = document.querySelector(sticker.getAttribute('data-fos-bottomref'));
    /* eslint-enable no-param-reassign */
    window.addEventListener('scroll', sticker.stick);
  },

  discoverAll() {
    const fixOnScroll = ::this.fixOnScroll;
    const elements = [].slice.call(document.querySelectorAll('[data-fos]'), 0);
    elements.forEach(fixOnScroll);
  },
};

export default FOS;
