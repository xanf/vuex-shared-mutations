import Vue from 'vue';
import Vuex from 'vuex';
import test from 'ava';
import browserEnv from 'browser-env';
import sinon from 'sinon';
import createSharingPlugin from '../dist/vuex-shared-mutations';

Vue.use(Vuex);

browserEnv([ 'window' ]);
const noop = () => true;

function dispatchFakeStorageEvent(key, data) {
  const fakeEvent = new window.Event('storage');
  fakeEvent.key = key;
  fakeEvent.newValue = JSON.stringify(data);
  window.dispatchEvent(fakeEvent);
}

test.beforeEach(t => {
  window.localStorage = { setItem: noop, getItem: noop };
  [ console.error, window.localStorage.setItem, window.localStorage.getItem ].forEach(m => {
    if (m.restore) m.restore();
  });
  // eslint-disable-next-line no-param-reassign
  t.context.fakeStore = new Vuex.Store({
    mutations: { action1: noop, action2: noop, action3: noop },
  });
});

test('should report an error if localStorage is not available', t => {
  window.localStorage = null;
  const errorSpy = sinon.spy(console, 'error');
  const plugin = createSharingPlugin({});
  plugin({});
  t.true(errorSpy.calledOnce);
});

test('should report an error if predicate is missing', t => {
  const errorSpy = sinon.spy(console, 'error');
  const plugin = createSharingPlugin({});
  plugin({});
  t.true(errorSpy.calledOnce);
});

test('should accept array of strings as predicate', t => {
  const errorSpy = sinon.spy(console, 'error');
  const plugin = createSharingPlugin({ predicate: [ 'm1', 'm2', 'm3' ] });
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
  t.deepEqual(predicateSpy.lastCall.args[0], { type: 'action3', payload: fakeMutation });
});

test('should share mutation if it is specified in our list', t => {
  const setItemSpy = sinon.spy(window.localStorage, 'setItem');
  const plugin = createSharingPlugin({ predicate: [ 'action1', 'action2', 'action3' ] });
  plugin(t.context.fakeStore);
  t.context.fakeStore.commit('action1');
  t.true(setItemSpy.called);
});

test('logs error if setItem is not working (for example quota limit)', t => {
  const errorSpy = sinon.spy(console, 'error');
  sinon.stub(window.localStorage, 'setItem').throws();
  const plugin = createSharingPlugin({ predicate: noop });
  plugin(t.context.fakeStore);
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

  const plugin = createSharingPlugin({ sharingKey, predicate: noop });
  sinon.spy(t.context.fakeStore, 'commit');
  plugin(t.context.fakeStore);

  const fakeStorageData = { type: 'action2', payload: { some: 'extra data' } };
  dispatchFakeStorageEvent(sharingKey, fakeStorageData);

  t.true(t.context.fakeStore.commit.called);
  t.is(t.context.fakeStore.commit.lastCall.args[0], fakeStorageData.type);
  t.deepEqual(t.context.fakeStore.commit.lastCall.args[1], fakeStorageData.payload);
});

test('does not invokes setItem when replaying storage event', t => {
  const sharingKey = 'some-subscribe-key';
  const setItemSpy = sinon.spy(window.localStorage, 'setItem');

  const plugin = createSharingPlugin({ sharingKey, predicate: noop });
  plugin(t.context.fakeStore);

  const fakeStorageData = { type: 'action2', payload: { some: 'extra data' } };
  dispatchFakeStorageEvent(sharingKey, fakeStorageData);

  t.false(setItemSpy.called);
});

test('logs error if have corrupted data in localStorage', t => {
  const errorSpy = sinon.spy(console, 'error');
  const sharingKey = 'some-subscribe-key';

  const plugin = createSharingPlugin({ predicate: noop, sharingKey });
  plugin(t.context.fakeStore);

  const fakeEvent = new window.Event('storage');
  fakeEvent.key = sharingKey;
  fakeEvent.newValue = 'some-non-json-data';
  window.dispatchEvent(fakeEvent);
  t.true(errorSpy.called);
});
