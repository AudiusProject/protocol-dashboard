import Audius from 'services/Audius'
import { useSelector, useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import { Action } from 'redux'
import AppState from 'store/types'
import { Playlist, Track } from 'types'
import { useEffect, useState } from 'react'
import imageBlank from 'assets/img/imageBlank2x.png'
import {
  MusicError,
  setTopAlbums,
  setTopPlaylists,
  setTopTracks
} from './slice'
import { fetchWithLibs } from '../../../utils/fetch'

const AUDIUS_URL = process.env.REACT_APP_AUDIUS_URL

// -------------------------------- Selectors  ---------------------------------

export const getTopTracks = (state: AppState) => state.cache.music.topTracks
export const getTopPlaylists = (state: AppState) =>
  state.cache.music.topPlaylists
export const getTopAlbums = (state: AppState) => state.cache.music.topAlbums

// -------------------------------- Thunk Actions  ---------------------------------

export function fetchTopTracks(): ThunkAction<
  void,
  AppState,
  Audius,
  Action<string>
> {
  return async (dispatch, _, aud) => {
    try {
      await aud.awaitSetup()
      const data = await fetchWithLibs({
        endpoint: '/v1/tracks/trending',
        queryParams: { limit: 4 }
      })
      const tracks: Track[] = data.slice(0, 4).map((d: any) => ({
        title: d.title,
        handle: d.user.handle,
        artwork: d.artwork?.['480x480'] ?? imageBlank,
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

export function fetchTopPlaylists(): ThunkAction<
  void,
  AppState,
  Audius,
  Action<string>
> {
  return async (dispatch, _, aud) => {
    try {
      await aud.awaitSetup()
      const limit = 5
      const data = await fetchWithLibs({
        endpoint: '/v1/full/playlists/trending'
      })
      const playlists: Playlist[] = data.slice(0, limit).map((d: any) => ({
        title: d.playlist_name,
        handle: d.user.handle,
        artwork: d.artwork?.['480x480'] ?? imageBlank,
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

export function fetchTopAlbums(): ThunkAction<
  void,
  AppState,
  Audius,
  Action<string>
> {
  return async (dispatch, _, aud) => {
    try {
      await aud.awaitSetup()
      const data = await fetchWithLibs({
        endpoint: '/v1/full/playlists/top',
        queryParams: { type: 'album', limit: 5 }
      })
      const albums: Playlist[] = data.map((d: any) => ({
        title: d.playlist_name,
        handle: d.user.handle,
        artwork: d.artwork?.['480x480'] ?? imageBlank,
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
  const dispatch = useDispatch()

  useEffect(() => {
    if (!doOnce && !topTracks) {
      setDoOnce(true)
      dispatch(fetchTopTracks())
    }
  }, [doOnce, topTracks, dispatch])

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
  const dispatch = useDispatch()

  useEffect(() => {
    if (!doOnce && !topPlaylists) {
      setDoOnce(true)
      dispatch(fetchTopPlaylists())
    }
  }, [topPlaylists, dispatch, doOnce])

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
  const dispatch = useDispatch()

  useEffect(() => {
    if (!doOnce && !topAlbums) {
      setDoOnce(true)
      dispatch(fetchTopAlbums())
    }
  }, [topAlbums, dispatch, doOnce])

  useEffect(() => {
    if (topAlbums) {
      setDoOnce(false)
    }
  }, [topAlbums, setDoOnce])

  return { topAlbums }
}
