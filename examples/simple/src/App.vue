<template>
  <div id="app">
    <h1>{{ $store.state.count }}</h1>
    <button @click="$store.commit('decrement');">-</button>
    <button @click="$store.commit('increment');">+</button>
    <button @click="$store.commit('increment2');">+2</button>
    <hr>
    <p>
      Open this example in
      <a
        href="https://codesandbox.io/s/github/xanf/vuex-shared-mutations/tree/master/examples/simple"
        target="_blank"
      >multiple</a>
      tabs and play with
      <b>+</b>,
      <b>-</b>, and
      <b>+2</b> buttons.
    </p>
    <p>
      <b>+</b> and
      <b>-</b> actions are shared using
      <a
        href="https://www.npmjs.com/package/vuex-shared-mutations"
        target="_blank"
      >vuex-shared-mutations</a>, so the value will be in sync while you're using these buttons
    </p>
    <p>
      <b>+2</b> action, however, is not shared, so you can put your tabs
      out-of-sync. This is intentional, we're sharing
      <b>actions</b>, not entire
      system state
    </p>
    <hr>
    <p>
      <a href="https://github.com/xanf/vuex-shared-mutations/tree/master/test">Demo source</a>
    </p>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>
