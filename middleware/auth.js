import consola from 'consola'

export default function({ store, error, redirect }) {
  if (store.state.authUser && store.state.authUser.user) {
    consola.log('authenticated', store.state.authUser)
  } else {
    consola.log('unauthenticated', store.state.authUser)
    return redirect('/login')
  }
}
