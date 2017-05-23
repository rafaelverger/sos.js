import { describe, it, beforeEach, afterEach } from 'mocha';

import { expect } from 'chai';
import { jsdom } from 'jsdom';
import sinon from 'sinon';

import SOS from '../';

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
      SOS.addPlaceholder(sticker);

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
      SOS.removePlaceholder(mock);

      expect(mock.className).to.be.equal('something');
      expect(mock.placeholder).to.be.undefined();
      expect(mock.dispatchEvent).to.be.calledOnce();
      expect(mock.dispatchEvent).to.be.calledWithExactly(
        new global.window.CustomEvent('stickyToggle', SOS.genEventDetail(false))
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
      SOS.removePlaceholder(mock);
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

    it('stickOnScroll', () => {
      const watchStickerStub = sandbox.stub(SOS, 'watchSticker');
      const evtListener = sandbox.stub(global.window, 'addEventListener');

      const sticker = global.document.getElementById('test1');
      const stickerRef = global.document.querySelector('.sticker-ref');
      SOS.stickOnScroll(sticker);

      expect(sticker.bottomRef).to.be.equal(stickerRef);
      expect(evtListener).to.be.calledOnce();
      expect(evtListener).to.be.calledWithExactly('scroll', sticker.stick);

      const rand = Math.random();
      sticker.stick(rand);
      sandbox.clock.tick(SOS.scrollTimeout);
      expect(watchStickerStub).to.be.calledOnce();
      expect(watchStickerStub).to.be.calledWithExactly(rand, sticker);
    });

    it('stickOnScroll already parsed element', () => {
      const sticker = { stick: 1 };
      const evtListener = sandbox.stub(global.window, 'addEventListener');
      SOS.stickOnScroll(sticker);

      expect(evtListener).to.not.be.called();
    });

    it('discoverAll', () => {
      const stickOnScrollStub = sandbox.stub(SOS, 'stickOnScroll');
      SOS.discoverAll();

      expect(stickOnScrollStub).to.be.calledTwice();
      expect(stickOnScrollStub).to.be.calledWith(global.document.getElementById('test1'));
      expect(stickOnScrollStub).to.be.calledWith(global.document.getElementById('test2'));
    });
  });
});
