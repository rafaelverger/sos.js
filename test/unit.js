import { describe, it, beforeEach, afterEach } from 'mocha';

import { expect } from 'chai';
import { jsdom } from 'jsdom';
import sinon from 'sinon';

import fos from '../';

describe('unit', () => {
  describe('placeholder', () => {
    it('add', () => {
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
      const sticker = doc.getElementById('test');

      global.document = doc;
      global.window = doc.defaultView;

      fos.addPlaceholder(sticker);

      const children = doc.querySelector('.root').children;
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
        placeholder: rand,
        parentNode: {
          removeChild: sinon.spy(),
        },
      };
      fos.removePlaceholder(mock);

      expect(mock.parentNode.removeChild).to.be.calledOnce();
      expect(mock.parentNode.removeChild).to.be.calledWithExactly(rand);
      expect(mock.placeholder).to.be.undefined();
    });

    it('remove without placeholder', () => {
      const mock = {
        parentNode: {
          removeChild: sinon.spy(),
        },
      };
      fos.removePlaceholder(mock);
      expect(mock.parentNode.removeChild).to.not.be.called();
    });
  });

  describe('initialize', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('fixOnScroll', () => {
      const doc = jsdom(`
        <div>
          <div class="to-be-fixed" id="test" data-fos-bottomref=".sticker-ref">
            I will be fixed on window's top
          </div>
          <div class="sticker-ref" id="test">I'm a reference</div>
        </div>
      `);
      global.document = doc;
      global.window = doc.defaultView;

      const watchStickerStub = sandbox.stub(fos, 'watchSticker');
      const evtListener = sandbox.stub(global.window, 'addEventListener');

      const sticker = doc.getElementById('test');
      fos.fixOnScroll(sticker);

      expect(sticker.bottomRef).to.be.equal(doc.querySelector('.sticker-ref'));
      expect(evtListener).to.be.calledOnce();
      expect(evtListener).to.be.calledWithExactly('scroll', sticker.stick);

      const rand = Math.random();
      sticker.stick(rand);
      expect(watchStickerStub).to.be.calledOnce();
      expect(watchStickerStub).to.be.calledWithExactly(rand, sticker);
    });

    it('fixOnScroll already parsed element', () => {
      const sticker = { stick: 1 };
      const evtListener = sandbox.stub(global.window, 'addEventListener');
      fos.fixOnScroll(sticker);

      expect(evtListener).to.not.be.called();
    });

    it('discoverAll', () => {
      const doc = jsdom(`
        <div>
          <div id="test1" data-fos data-fos-bottomref=".sticker-ref">
            I will be fixed on window's top
          </div>
          <div class="sticker-ref">Not me!!!</div>
          <div id="test2" data-fos>But I will :D</div>
        </div>
      `);
      global.document = doc;
      global.window = doc.defaultView;

      const fixOnScrollStub = sandbox.stub(fos, 'fixOnScroll');
      fos.discoverAll();

      expect(fixOnScrollStub).to.be.calledTwice();
      expect(fixOnScrollStub).to.be.calledWith(doc.getElementById('test1'));
      expect(fixOnScrollStub).to.be.calledWith(doc.getElementById('test2'));
    });
  });
});
