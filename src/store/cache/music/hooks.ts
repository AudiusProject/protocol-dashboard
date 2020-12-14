import Audius from 'services/Audius'
import { useSelector, useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import { Action } from 'redux'
import AppState from 'store/types'
import { DiscoveryProvider, Playlist, Track } from 'types'
import { useDiscoveryProviders } from '../discoveryProvider/hooks'
import { useEffect, useState } from 'react'
import {
  MusicError,
  setTopAlbums,
  setTopPlaylists,
  setTopTracks
} from './slice'
import { fetchWithTimeout } from '../../../utils/fetch'

const AUDIUS_URL = process.env.REACT_APP_AUDIUS_URL

// -------------------------------- Selectors  ---------------------------------

export const getTopTracks = (state: AppState) => state.cache.music.topTracks
export const getTopPlaylists = (state: AppState) =>
  state.cache.music.topPlaylists
export const getTopAlbums = (state: AppState) => state.cache.music.topAlbums

// -------------------------------- Thunk Actions  ---------------------------------

export function fetchTopTracks(
  node: DiscoveryProvider | any
): ThunkAction<void, AppState, Audius, Action<string>> {
  return async (dispatch, getState, aud) => {
    try {
      const url = `${node.endpoint}/v1/tracks/trending?limit=4`
      const res = await fetchWithTimeout(url)
      const tracks: Track[] = res.data.slice(0, 4).map((d: any) => ({
        title: d.title,
        handle: d.user.handle,
        artwork: d.artwork['480x480'],
        url: `${AUDIUS_URL}/tracks/${d.id}`,
        userUrl: `${AUDIUS_URL}/users/${d.user.id}`
      }))
      dispatch(setTopTracks({ tracks }))
    } catch (e) {
      dispatch(setTopTracks({ tracks: MusicError.ERROR }))
      console.error(e)
    }
  }
}

export function fetchTopPlaylists(
  node: DiscoveryProvider | any
): ThunkAction<void, AppState, Audius, Action<string>> {
  return async (dispatch, getState, aud) => {
    try {
      const url = `${node.endpoint}/v1/playlists/top?type=playlist&limit=5`
      const res = await fetchWithTimeout(url)
      const playlists: Playlist[] = res.data.map((d: any) => ({
        title: d.playlist_name,
        handle: d.user.handle,
        artwork: d.artwork['480x480'],
        plays: d.total_play_count,
        url: `${AUDIUS_URL}/playlists/${d.id}`
      }))
      dispatch(setTopPlaylists({ playlists }))
    } catch (e) {
      console.error(e)
      dispatch(setTopPlaylists({ playlists: MusicError.ERROR }))
    }
  }
}

export function fetchTopAlbums(
  node: DiscoveryProvider | any
): ThunkAction<void, AppState, Audius, Action<string>> {
  return async (dispatch, getState, aud) => {
    try {
      const url = `${node.endpoint}/v1/playlists/top?type=album&limit=5`
      const res = await fetchWithTimeout(url)
      const albums: Playlist[] = res.data.map((d: any) => ({
        title: d.playlist_name,
        handle: d.user.handle,
        artwork: d.artwork['480x480'],
        plays: d.total_play_count,
        url: `${AUDIUS_URL}/playlists/${d.id}`
      }))
      dispatch(setTopAlbums({ albums }))
    } catch (e) {
      console.error(e)
      dispatch(setTopAlbums({ albums: MusicError.ERROR }))
    }
  }
}

// -------------------------------- Hooks  --------------------------------

export const useTopTracks = () => {
  const [doOnce, setDoOnce] = useState(false)
  const topTracks = useSelector(getTopTracks)
  const { nodes } = useDiscoveryProviders({})
  const dispatch = useDispatch()

  useEffect(() => {
    if (!doOnce && nodes[0] && !topTracks) {
      setDoOnce(true)
      dispatch(fetchTopTracks(nodes[0]))
    }
  }, [doOnce, topTracks, dispatch, nodes])

  useEffect(() => {
    if (topTracks) {
      setDoOnce(false)
    }
  }, [topTracks, setDoOnce])

  return { topTracks }
}

export const useTopPlaylists = () => {
  const [doOnce, setDoOnce] = useState(false)
  const topPlaylists = useSelector(getTopPlaylists)
  const { nodes } = useDiscoveryProviders({})
  const dispatch = useDispatch()

  useEffect(() => {
    if (!doOnce && nodes[0] && !topPlaylists) {
      setDoOnce(true)
      dispatch(fetchTopPlaylists(nodes[0]))
    }
  }, [topPlaylists, dispatch, nodes, doOnce])

  useEffect(() => {
    if (topPlaylists) {
      setDoOnce(false)
    }
  }, [topPlaylists, setDoOnce])

  return { topPlaylists }
}

export const useTopAlbums = () => {
  const [doOnce, setDoOnce] = useState(false)
  const topAlbums = useSelector(getTopAlbums)
  const { nodes } = useDiscoveryProviders({})
  const dispatch = useDispatch()

  useEffect(() => {
    if (!doOnce && nodes[0] && !topAlbums) {
      setDoOnce(true)
      dispatch(fetchTopAlbums(nodes[0]))
    }
  }, [topAlbums, dispatch, nodes, doOnce])

  useEffect(() => {
    if (topAlbums) {
      setDoOnce(false)
    }
  }, [topAlbums, setDoOnce])

  return { topAlbums }
}
