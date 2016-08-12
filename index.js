function addPlaceholder(sticker) {
  const positionRules = ['width', 'height', 'margin'];
  const stickerStyle = window.getComputedStyle(sticker);
  const placeholder = document.createElement('div');
  for (const rule in stickerStyle) {
    if (positionRules.includes(rule)) {
      placeholder.style[rule] = stickerStyle[rule];
    }
  }
  sticker.parentNode.insertBefore(placeholder, sticker);
  sticker.placeholder = placeholder;
}
function removePlaceholder(sticker) {
  if ( sticker.placeholder ) {
    sticker.parentNode.removeChild(sticker.placeholder);
    sticker.placeholder = undefined;
  }
}

function watchSticker(evt, sticker) {
  const { offsetHeight, bottomRef } = sticker;
  const top = (sticker.placeholder || sticker).getBoundingClientRect().top;
  const isAfterSticker = top <= 0;
  const isAfterRef = bottomRef && bottomRef.getBoundingClientRect().bottom < offsetHeight;

  if (!sticker.placeholder && isAfterSticker && !isAfterRef) {
    addPlaceholder(sticker);
    sticker.classList.add('sticky');
  }
  else if (sticker.placeholder && (!isAfterSticker || isAfterRef)) {
    removePlaceholder(sticker)
    sticker.classList.remove('sticky');
  }
};

function fixOnScroll(sticker) {
  if ( sticker.stick ) {
    return;
  }
  sticker.stick = (e) => watchSticker(e, sticker);
  sticker.bottomRef = document.querySelector(sticker.getAttribute('data-fos-bottomref'));
  window.addEventListener('scroll', sticker.stick);
}

function discoverAll() {
  const elements = [].slice.call(document.querySelectorAll('[data-fos]'), 0);
  elements.forEach(fixOnScroll)
}
