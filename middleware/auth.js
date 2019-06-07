import consola from 'consola'

export default function({ store, error, redirect }) {
  if (!store.state.authUser) {
    consola.log('authenticated')
    return redirect('/login')
  } else {
    consola.log('unauthenticated')
  }
}
