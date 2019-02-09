export const state = () => ({
  count: 0
})

export const mutations = {
  increment(state) {
    state.count++
  },
  decrement(state) {
    state.count--
  },
  increment2(state) {
    state.count += 2
  }
}
