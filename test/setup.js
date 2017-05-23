import chai from 'chai';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';

chai.use(dirtyChai);
chai.use(sinonChai);

global.mockDOM = (doc) => {
  global.document = doc;
  global.window = doc.defaultView;
  global.dom_win_keys = [];
  Object.keys(global.window).forEach((property) => {
    if (typeof global[property] === 'undefined') {
      global.dom_win_keys.push(property);
      global[property] = global.window[property];
    }
  });
};

global.releaseDOM = () => {
  global.dom_win_keys.forEach((property) => { delete global[property]; });
  delete global.dom_win_keys;
  delete global.document;
  delete global.window;
};
