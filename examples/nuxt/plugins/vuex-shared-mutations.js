import shareMutations from 'vuex-shared-mutations'

export default ({ store }) => {
  window.onNuxtReady(nuxt => {
    shareMutations({
      predicate: ['increment', 'decrement']
    })(store)
  })
}
