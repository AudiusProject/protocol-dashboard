import {
  combineReducers,
  createStore as createReduxStore,
  applyMiddleware
} from 'redux'
import { connectRouter } from 'connected-react-router'
import { composeWithDevTools } from 'redux-devtools-extension'
import { routerMiddleware } from 'connected-react-router'
import { History } from 'history'
import Audius from 'services/Audius'
import thunk from 'redux-thunk'
import discoveryProvider from 'store/cache/discoveryProvider/slice'
import contentNode from 'store/cache/contentNode/slice'
import protocol from 'store/cache/protocol/slice'
import user from 'store/cache/user/slice'
import proposals from 'store/cache/proposals/slice'
import votes from 'store/cache/votes/slice'
import timeline from 'store/cache/timeline/slice'
import claims from 'store/cache/claims/slice'
import analytics from 'store/cache/analytics/slice'
import music from 'store/cache/music/slice'
import account from 'store/account/slice'
import pageHistory from 'store/pageHistory/slice'

declare global {
  interface Window {
    aud: any
  }
}

const aud = new Audius()
window.aud = aud
aud.setup()

const getReducer = (history: History) => {
  return combineReducers({
    router: connectRouter(history),
    pageHistory,
    account,
    cache: combineReducers({
      discoveryProvider,
      contentNode,
      protocol,
      user,
      proposals,
      votes,
      timeline,
      claims,
      analytics,
      music
    })
  })
}

const getMiddlewares = (history: History) =>
  applyMiddleware(routerMiddleware(history), thunk.withExtraArgument(aud))

export const createStore = (history: History) => {
  const composeEnhancers = composeWithDevTools({ trace: true, traceLimit: 25 })
  const storeReducer = getReducer(history)
  const middlewares = getMiddlewares(history)
  let store = createReduxStore(storeReducer, composeEnhancers(middlewares))
  return store
}

export default createStore
