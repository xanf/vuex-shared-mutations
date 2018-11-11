import Vue from 'vue';
import Vuex from 'vuex';
import test from 'ava';
import browserEnv from 'browser-env';
import sinon from 'sinon';
import createSharingPlugin from '../dist/vuex-shared-mutations';

Vue.use(Vuex);

const noop = () => true;

function dispatchFakeStorageEvent(key, data) {
  const fakeEvent = new window.Event('storage');
  fakeEvent.key = key;
  fakeEvent.newValue = JSON.stringify(data);
  window.dispatchEvent(fakeEvent);
}

test.beforeEach(t => {
  browserEnv(['window']);
  const storage = {};
  window.localStorage = {
    setItem: (key, value) => {
      storage[key] = value;
    },
    getItem: key => storage[key],
    removeItem: noop,
  };
  [
    console.error,
    window.localStorage.setItem,
    window.localStorage.getItem,
  ].forEach(m => {
    if (m.restore) m.restore();
  });
  // eslint-disable-next-line no-param-reassign
  t.context.fakeStore = new Vuex.Store({
    mutations: { action1: noop, action2: noop, action3: noop },
  });
});

test('should report an error if window not present (SSR environment)', t => {
  delete global.window;
  const errorSpy = sinon.spy(console, 'error');
  const plugin = createSharingPlugin({});
  plugin(t.context.fakeStore);
  t.true(errorSpy.calledOnce);
});

test('should report an error if localStorage is not available', t => {
  window.localStorage = null;
  const errorSpy = sinon.spy(console, 'error');
  const plugin = createSharingPlugin({ predicate: noop });
  plugin(t.context.fakeStore);
  t.true(errorSpy.calledOnce);
});

test('should fail early if localStorage.setItem is not available', t => {
  sinon.stub(window.localStorage, 'setItem').throws();
  const errorSpy = sinon.spy(console, 'error');
  const plugin = createSharingPlugin({ predicate: noop });
  plugin(t.context.fakeStore);
  t.true(errorSpy.calledOnce);
});

test('should report an error if predicate is missing', t => {
  const errorSpy = sinon.spy(console, 'error');
  const plugin = createSharingPlugin({});
  plugin(t.context.fakeStore);
  t.true(errorSpy.calledOnce);
});

test('should accept array of strings as predicate', t => {
  const errorSpy = sinon.spy(console, 'error');
  const plugin = createSharingPlugin({ predicate: ['m1', 'm2', 'm3'] });
  plugin(t.context.fakeStore);
  sinon.assert.notCalled(errorSpy);
  t.pass();
});

test('should accept function as predicate', t => {
  const errorSpy = sinon.spy(console, 'error');
  const plugin = createSharingPlugin({ predicate: () => true });
  plugin(t.context.fakeStore);
  sinon.assert.notCalled(errorSpy);
  t.pass();
});

test('should subscribe to store', t => {
  const plugin = createSharingPlugin({ predicate: () => true });
  sinon.spy(t.context.fakeStore, 'subscribe');
  plugin(t.context.fakeStore);
  t.true(t.context.fakeStore.subscribe.called);
});

test('should invoke our predicate function on mutation', t => {
  const predicateSpy = sinon.spy();
  const plugin = createSharingPlugin({ predicate: predicateSpy });
  plugin(t.context.fakeStore);
  const fakeMutation = { some: 'extra data' };
  t.context.fakeStore.commit('action3', fakeMutation);
  t.deepEqual(predicateSpy.lastCall.args[0], {
    type: 'action3',
    payload: fakeMutation,
  });
});

test('should share mutation if it is specified in our list', t => {
  const setItemSpy = sinon.spy(window.localStorage, 'setItem');
  const plugin = createSharingPlugin({
    predicate: ['action1', 'action2', 'action3'],
  });
  plugin(t.context.fakeStore);
  t.context.fakeStore.commit('action1');
  t.true(setItemSpy.called);
});

test('logs error if setItem is not working (for example quota limit)', t => {
  const errorSpy = sinon.spy(console, 'error');
  const setItemStub = sinon.stub(window.localStorage, 'setItem');
  const plugin = createSharingPlugin({ predicate: noop });
  plugin(t.context.fakeStore);
  setItemStub.throws();
  t.context.fakeStore.commit('action1');
  t.true(errorSpy.calledTwice);
});

test('can specify sharingKey in config', t => {
  const setItemSpy = sinon.spy(window.localStorage, 'setItem');
  const sharingKey = 'some-subscribe-key';
  const plugin = createSharingPlugin({ sharingKey, predicate: noop });
  plugin(t.context.fakeStore);
  t.context.fakeStore.commit('action2', { some: 'extra data' });
  t.is(setItemSpy.lastCall.args[0], sharingKey);
});

test('invokes commit on storage event', t => {
  const sharingKey = 'some-subscribe-key';
  const storageKey = 'some-storage-key';

  const plugin = createSharingPlugin({
    sharingKey,
    storageKey,
    predicate: noop,
  });
  sinon.spy(t.context.fakeStore, 'commit');
  plugin(t.context.fakeStore);

  const fakeStorageData = { type: 'action2', payload: { some: 'extra data' } };
  window.localStorage.setItem(storageKey, JSON.stringify(fakeStorageData));
  dispatchFakeStorageEvent(sharingKey, 'notification');

  t.true(t.context.fakeStore.commit.called);
  t.is(t.context.fakeStore.commit.lastCall.args[0], fakeStorageData.type);
  t.deepEqual(
    t.context.fakeStore.commit.lastCall.args[1],
    fakeStorageData.payload,
  );
});

test('does not invokes setItem when replaying storage event', t => {
  const sharingKey = 'some-subscribe-key';
  const storageKey = 'some-storage-key';

  const setItemSpy = sinon.spy(window.localStorage, 'setItem');
  const plugin = createSharingPlugin({
    sharingKey,
    storageKey,
    predicate: noop,
  });

  plugin(t.context.fakeStore);
  const fakeStorageData = { type: 'action2', payload: { some: 'extra data' } };
  window.localStorage.setItem(storageKey, JSON.stringify(fakeStorageData));
  setItemSpy.reset();
  dispatchFakeStorageEvent(sharingKey, 'notification');

  t.false(setItemSpy.called);
});

test('does not invokes store.dispatch on other localStorage keys', t => {
  const sharingKey = 'some-subscribe-key';
  const storageKey = 'some-storage-key';
  const setDispatchSpy = sinon.spy(t.context.fakeStore, 'dispatch');

  const plugin = createSharingPlugin({
    sharingKey,
    storageKey,
    predicate: noop,
  });
  plugin(t.context.fakeStore);

  const fakeStorageData = { type: 'action2', payload: { some: 'extra data' } };
  window.localStorage.setItem(storageKey, JSON.stringify(fakeStorageData));
  dispatchFakeStorageEvent('some-other-key', 'notification');

  t.false(setDispatchSpy.called);
});

test('logs error if have corrupted data in localStorage', t => {
  const errorSpy = sinon.spy(console, 'error');
  const sharingKey = 'some-subscribe-key';
  const storageKey = 'some-storage-key';

  const plugin = createSharingPlugin({
    predicate: noop,
    sharingKey,
    storageKey,
  });
  plugin(t.context.fakeStore);

  window.localStorage.setItem(storageKey, 'corrupted-data');
  dispatchFakeStorageEvent(sharingKey, 'notification');

  t.true(errorSpy.called);
});
