import React, { useEffect, useState, useRef, useCallback } from 'react'

/*
  Config
*/
const STORAGE_KEY = 'stories_v1'
const MAX_W = 1080
const MAX_H = 1920
const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000
const STORY_DISPLAY_MS = 3000

/* Helpers: storage */
function loadStories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}
function saveStories(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
}
function pruneExpired(arr = null) {
  const now = Date.now()
  const src = arr || loadStories()
  const kept = src.filter(s => now - s.createdAt < STORY_LIFETIME_MS)
  saveStories(kept)
  return kept
}

/* Helpers: read file -> resized base64 */
function fileToResizedDataURL(file, maxW = MAX_W, maxH = MAX_H) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = () => reject(new Error('file read error'))
    fr.onload = () => {
      const img = new Image()
      img.onload = () => {
        let w = img.width, h = img.height
        const ratio = Math.min(maxW / w, maxH / h, 1)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const dataURL = canvas.toDataURL('image/jpeg', 0.92)
        resolve(dataURL)
      }
      img.onerror = () => reject(new Error('image load error'))
      img.src = fr.result
    }
    fr.readAsDataURL(file)
  })
}

/* Hook: useIntervalRef for animation timers */
function useRafTimeout() {
  const idRef = useRef(null)
  const set = (fn, ms) => {
    clear()
    const start = performance.now()
    function loop(now) {
      if (now - start >= ms) return fn()
      idRef.current = requestAnimationFrame(loop)
    }
    idRef.current = requestAnimationFrame(loop)
  }
  const clear = () => {
    if (idRef.current) cancelAnimationFrame(idRef.current)
    idRef.current = null
  }
  useEffect(() => clear, [])
  return { set, clear }
}

export default function App() {
  const [stories, setStories] = useState(() => pruneExpired())
  const [viewerOpen, setViewerOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const fileRef = useRef(null)
  const progressRef = useRef(null)
  const touchStartRef = useRef(null)
  const rafTimeout = useRafTimeout()
  const autoAdvanceRef = useRef(null)

  useEffect(() => {
    // prune on mount and every 30s
    const t = setInterval(() => setStories(pruneExpired()), 30_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    // persist when stories change
    saveStories(stories)
  }, [stories])

  const addStoryFromFile = async (file) => {
    try {
      const data = await fileToResizedDataURL(file)
      const s = { id: Date.now() + Math.random().toString(36).slice(2,9), data, createdAt: Date.now() }
      setStories(prev => {
        const next = [...prev, s]
        saveStories(next)
        return next
      })
    } catch (err) {
      alert('Could not add image: ' + err.message)
    }
  }

  const openViewer = (startIdx) => {
    const arr = pruneExpired()
    setStories(arr)
    setIndex(startIdx)
    setViewerOpen(true)
  }

  const closeViewer = () => {
    setViewerOpen(false)
    rafTimeout.clear()
    if (autoAdvanceRef.current) { clearTimeout(autoAdvanceRef.current); autoAdvanceRef.current = null }
  }

  const showIndex = useCallback((i) => {
    const n = stories.length
    if (i < 0) i = 0
    if (i >= n) { closeViewer(); return }
    setIndex(i)
    // reset progress
    if (progressRef.current) {
      const fills = progressRef.current.querySelectorAll('.fill')
      fills.forEach((f, idx) => f.style.width = idx < i ? '100%' : '0%')
    }
    // animate current fill
    const start = performance.now()
    rafTimeout.clear()
    function frame(now) {
      const elapsed = now - start
      const pct = Math.min(1, elapsed / STORY_DISPLAY_MS)
      const fills = progressRef.current && progressRef.current.querySelectorAll('.fill')
      if (fills && fills[i]) fills[i].style.width = (pct*100) + '%'
      if (pct < 1) rafTimeout.set(() => frame(performance.now()), 16) // keep ticking
    }
    rafTimeout.set(() => {
      if (stories.length === 0) return
      // advance
      showIndex(i + 1)
    }, STORY_DISPLAY_MS)
    // start visual loop via rAF
    requestAnimationFrame(frame)
  }, [stories, rafTimeout])

  // start watcher for index when viewer opens
  useEffect(() => {
    if (viewerOpen) showIndex(index)
    // cleanup when unmount/viewer close
    return () => { rafTimeout.clear(); if (autoAdvanceRef.current) { clearTimeout(autoAdvanceRef.current); autoAdvanceRef.current = null } }
  }, [viewerOpen]) // eslint-disable-line

  // touch handling for swipe
  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e) => {
    if (!touchStartRef.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    const SWIPE_MIN = 40
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_MIN) {
      if (dx < 0) showIndex(index + 1)
      else showIndex(index - 1)
    }
    touchStartRef.current = null
  }

  return (
    <div className="app">
      <h3>Stories</h3>
      <div className="stories-row">
        <label className="add-btn" onClick={() => fileRef.current.click()}>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => {
            const f = e.target.files && e.target.files[0]
            if (f) addStoryFromFile(f)
            e.target.value = ''
          }} />
          <span>＋</span>
        </label>
        {stories.slice().reverse().map((s, i) => {
          const idx = stories.length - 1 - i
          return (
            <div key={s.id} className="thumb" onClick={() => openViewer(idx)}>
              <img src={s.data} alt="story thumbnail" />
            </div>
          )
        })}
      </div>

      {viewerOpen && stories[index] && (
        <div className="viewer" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="progress-row" ref={progressRef}>
            {stories.map((_, i) => (
              <div className="segment" key={i}><div className="fill" /></div>
            ))}
          </div>

          <img className="viewer-img" src={stories[index].data} alt="story" />

          <div className="controls">
            <div className="left-zone" onClick={() => showIndex(index - 1)} />
            <div className="right-zone" onClick={() => showIndex(index + 1)} />
          </div>

          <button className="close-btn" onClick={closeViewer}>Close</button>
        </div>
      )}
    </div>
  )
}
