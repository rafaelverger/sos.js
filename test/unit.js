import { describe, it, beforeEach, afterEach } from 'mocha';

import { expect } from 'chai';
import { jsdom } from 'jsdom';
import sinon from 'sinon';

import FOS from '../';

describe('unit', () => {
  describe('placeholder', () => {
    beforeEach(() => {
      const doc = jsdom(`
        <style class="text/css">
          .to-be-fixed {
            margin: 10px 5px;
            height: 50px;
            width: 100px;
          }
        </style>
        <div class="root">
          <div class="to-be-fixed" id="test">I will be fixed on window's top</div>
        </div>
      `);
      global.mockDOM(doc);
    });

    afterEach(global.releaseDOM);

    it('add', () => {
      const sticker = global.document.getElementById('test');
      FOS.addPlaceholder(sticker);

      const children = global.document.querySelector('.root').children;
      expect(children).to.have.length(2);

      expect(children[1]).to.be.equal(sticker);
      expect(children[1].placeholder).to.be.equal(children[0]);

      expect(children[0].style.margin).to.be.equal('10px 5px');
      expect(children[0].style.height).to.be.equal('50px');
      expect(children[0].style.width).to.be.equal('100px');
    });

    it('remove', () => {
      const rand = Math.random();
      const mock = {
        className: 'sticky something',
        placeholder: rand,
        dispatchEvent: sinon.spy(),
        parentNode: {
          removeChild: sinon.spy(),
        },
      };
      FOS.removePlaceholder(mock);

      expect(mock.className).to.be.equal('something');
      expect(mock.placeholder).to.be.undefined();
      expect(mock.dispatchEvent).to.be.calledOnce();
      expect(mock.dispatchEvent).to.be.calledWithExactly(
        new global.window.CustomEvent('stickyToggle', FOS.genEventDetail(false))
      );
      expect(mock.parentNode.removeChild).to.be.calledOnce();
      expect(mock.parentNode.removeChild).to.be.calledWithExactly(rand);
    });

    it('remove without placeholder', () => {
      const mock = {
        className: 'sticky something',
        dispatchEvent: sinon.spy(),
        parentNode: {
          removeChild: sinon.spy(),
        },
      };
      FOS.removePlaceholder(mock);
      expect(mock.parentNode.removeChild).to.not.be.called();
    });
  });

  describe('initialize', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.useFakeTimers();

      const doc = jsdom(`
        <div>
          <div id="test1" data-fos data-fos-bottomref=".sticker-ref">
            I will be fixed on window's top
          </div>
          <div class="sticker-ref">Not me!!!</div>
          <div id="test2" data-fos>But I will :D</div>
        </div>
      `);
      global.mockDOM(doc);
    });

    afterEach(() => {
      sandbox.restore();
      global.releaseDOM();
    });

    it('fixOnScroll', () => {
      const watchStickerStub = sandbox.stub(FOS, 'watchSticker');
      const evtListener = sandbox.stub(global.window, 'addEventListener');

      const sticker = global.document.getElementById('test1');
      const stickerRef = global.document.querySelector('.sticker-ref');
      FOS.fixOnScroll(sticker);

      expect(sticker.bottomRef).to.be.equal(stickerRef);
      expect(evtListener).to.be.calledOnce();
      expect(evtListener).to.be.calledWithExactly('scroll', sticker.stick);

      const rand = Math.random();
      sticker.stick(rand);
      sandbox.clock.tick(FOS.scrollTimeout);
      expect(watchStickerStub).to.be.calledOnce();
      expect(watchStickerStub).to.be.calledWithExactly(rand, sticker);
    });

    it('fixOnScroll already parsed element', () => {
      const sticker = { stick: 1 };
      const evtListener = sandbox.stub(global.window, 'addEventListener');
      FOS.fixOnScroll(sticker);

      expect(evtListener).to.not.be.called();
    });

    it('discoverAll', () => {
      const fixOnScrollStub = sandbox.stub(FOS, 'fixOnScroll');
      FOS.discoverAll();

      expect(fixOnScrollStub).to.be.calledTwice();
      expect(fixOnScrollStub).to.be.calledWith(global.document.getElementById('test1'));
      expect(fixOnScrollStub).to.be.calledWith(global.document.getElementById('test2'));
    });
  });
});
