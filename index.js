

const stickers = document.querySelectorAll('[data-sticker]');
const sticker = stickers[0];

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
    const placeholder = sticker.placeholder;
    delete sticker.placeholder;
    console.log(placeholder);
    sticker.parentNode.removeChild(placeholder);
  }
}

function watchSticker(evt, sticker) {
  const stickerPos = sticker.initalPos;
  const stickerRefPos = sticker.initalRefPos;

  const isAfterSticker = window.pageYOffset >= stickerPos.top;
  const isAfterRef = stickerRefPos && window.pageYOffset >= stickerRefPos.bottom;
  console.log(
    window.pageYOffset, stickerPos.top, stickerRefPos.bottom,
    isAfterSticker, isAfterRef, !!sticker.placeholder
  );

  if (!sticker.placeholder && isAfterSticker && !isAfterRef) {
    addPlaceholder(sticker);
    sticker.classList.add('sticky');
  }
  else if (sticker.placeholder && (!isAfterSticker || isAfterRef)) {
    removePlaceholder(sticker)
    sticker.classList.remove('sticky');
  }
};

(sticker => {
  sticker.classList.remove('sticky');
  delete sticker.placeholder;
  const stickerRef = document.querySelector(sticker.getAttribute('data-sticker-refs'));
  sticker.initalPos = sticker.getBoundingClientRect();
  sticker.initalRefPos = stickerRef.getBoundingClientRect();
  sticker.stick = (e) => watchSticker(e, sticker);
})(sticker)
window.removeEventListener('scroll', sticker.stick);
window.addEventListener('scroll', sticker.stick);
