/* Primary Labs · Letter Chains — teacher voice storage
 *
 * Safety model:
 *  - Recordings live only in this browser's IndexedDB on this device.
 *  - Nothing is ever uploaded: the page has no server, and its Content-Security-Policy
 *    sets connect-src 'none', so scripts cannot send data anywhere.
 *  - Every recording expires (this tab session, 1 day, or 7 days) and is purged on load,
 *    every minute while open, and whenever the tab becomes visible again.
 *  - We never ask the browser for persistent storage, so it may also clear recordings early.
 *  - If IndexedDB is unavailable (e.g. some private windows), recordings are kept in memory
 *    only and vanish when the page closes.
 *  - Audio is stored as raw bytes (an ArrayBuffer), not a Blob. Safari on iPhone and iPad
 *    can't reliably read Blobs back out of IndexedDB after a reload, and won't store them
 *    at all in Private Browsing.
 */
(function () {
  'use strict';
  var PL = (window.PL = window.PL || {});

  var DB_NAME = 'primary-labs-letter-chains';
  var DB_VERSION = 1;
  var STORE = 'recordings';
  var RETENTION_KEY = 'pl-voice-retention';
  var SESSION_KEY = 'pl-voice-session';
  var MAX_BYTES = 3 * 1024 * 1024; // hard cap per recording

  var DAY = 24 * 60 * 60 * 1000;
  var RETENTION = {
    session: { label: 'Until this tab closes', ms: null },
    day: { label: '1 day', ms: DAY },
    week: { label: '7 days', ms: 7 * DAY }
  };
  var DEFAULT_RETENTION = 'week';

  var memoryFallback = null; // Map when IndexedDB can't be used
  var dbPromise = null;
  var index = new Map(); // id -> { id, createdAt, sessionId, type, size, duration }
  var listeners = [];

  function safeGet(storage, key) {
    try { return window[storage].getItem(key); } catch (e) { return null; }
  }
  function safeSet(storage, key, value) {
    try { window[storage].setItem(key, value); } catch (e) { /* storage blocked */ }
  }

  function randomId() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      var a = new Uint32Array(4);
      crypto.getRandomValues(a);
      return Array.prototype.join.call(a, '-');
    } catch (e) {
      return String(Date.now()) + '-' + Math.random().toString(36).slice(2);
    }
  }

  var sessionId = safeGet('sessionStorage', SESSION_KEY);
  if (!sessionId) {
    sessionId = randomId();
    safeSet('sessionStorage', SESSION_KEY, sessionId);
  }

  function getRetention() {
    var r = safeGet('localStorage', RETENTION_KEY);
    return RETENTION[r] ? r : DEFAULT_RETENTION;
  }

  function readBuffer(blob) {
    if (blob.arrayBuffer) return blob.arrayBuffer();
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(fr.result); };
      fr.onerror = function () { reject(fr.error); };
      fr.readAsArrayBuffer(blob);
    });
  }

  function req(r) {
    return new Promise(function (resolve, reject) {
      r.onsuccess = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
    });
  }

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!('indexedDB' in window) || !window.indexedDB) return reject(new Error('This web browser can’t save recordings.'));
      var r;
      try { r = indexedDB.open(DB_NAME, DB_VERSION); } catch (e) { return reject(e); }
      r.onupgradeneeded = function () {
        var db = r.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      };
      r.onsuccess = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
      r.onblocked = function () { reject(new Error('Recordings can’t be saved right now. Close other tabs with this page open, then try again.')); };
    });
    return dbPromise;
  }

  function withStore(mode, fn) {
    if (memoryFallback) return Promise.resolve(fn(null));
    return openDB().then(function (db) {
      var tx = db.transaction(STORE, mode);
      return fn(tx.objectStore(STORE));
    });
  }

  function dbPut(rec) {
    if (memoryFallback) { memoryFallback.set(rec.id, rec); return Promise.resolve(); }
    return withStore('readwrite', function (s) { return req(s.put(rec)); });
  }
  function dbGet(id) {
    if (memoryFallback) return Promise.resolve(memoryFallback.get(id) || null);
    return withStore('readonly', function (s) { return req(s.get(id)); });
  }
  function dbAll() {
    if (memoryFallback) return Promise.resolve(Array.from(memoryFallback.values()));
    return withStore('readonly', function (s) { return req(s.getAll()); });
  }
  function dbDelete(id) {
    if (memoryFallback) { memoryFallback.delete(id); return Promise.resolve(); }
    return withStore('readwrite', function (s) { return req(s.delete(id)); });
  }
  function dbClear() {
    if (memoryFallback) { memoryFallback.clear(); return Promise.resolve(); }
    return withStore('readwrite', function (s) { return req(s.clear()); });
  }

  function meta(rec) {
    return {
      id: rec.id,
      createdAt: rec.createdAt,
      sessionId: rec.sessionId,
      type: rec.type,
      size: rec.size,
      duration: rec.duration
    };
  }

  function isExpired(m, now) {
    var r = getRetention();
    if (r === 'session') return m.sessionId !== sessionId;
    return now - m.createdAt > RETENTION[r].ms;
  }

  function notify() {
    listeners.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
  }

  function purgeExpired() {
    var now = Date.now();
    var expired = [];
    index.forEach(function (m) { if (isExpired(m, now)) expired.push(m.id); });
    if (!expired.length) return Promise.resolve(0);
    return Promise.all(expired.map(function (id) { index.delete(id); return dbDelete(id).catch(function () {}); }))
      .then(function () { notify(); return expired.length; });
  }

  var Voice = {
    RETENTION: RETENTION,
    persistent: true,

    init: function () {
      return openDB()
        .catch(function () {
          memoryFallback = new Map();
          Voice.persistent = false;
        })
        .then(dbAll)
        .then(function (all) {
          index.clear();
          (all || []).forEach(function (rec) { index.set(rec.id, meta(rec)); });
          return purgeExpired();
        })
        .then(function () {
          setInterval(purgeExpired, 60 * 1000);
          document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') purgeExpired();
          });
        })
        .catch(function (err) { console.warn('Voice store init failed', err); });
    },

    onChange: function (fn) { listeners.push(fn); },

    has: function (id) { return index.has(id); },
    info: function (id) { return index.get(id) || null; },
    count: function () { return index.size; },
    totalBytes: function () {
      var n = 0;
      index.forEach(function (m) { n += m.size || 0; });
      return n;
    },

    getRetention: getRetention,
    setRetention: function (key) {
      if (!RETENTION[key]) return Promise.resolve(0);
      safeSet('localStorage', RETENTION_KEY, key);
      // A shorter setting applies right away: anything now past its time is deleted.
      return purgeExpired().then(function (n) { notify(); return n; });
    },

    /* How many recordings a retention setting would delete right away. */
    countWouldExpire: function (key) {
      if (!RETENTION[key]) return 0;
      var now = Date.now(), n = 0;
      index.forEach(function (m) {
        var gone = key === 'session' ? m.sessionId !== sessionId : now - m.createdAt > RETENTION[key].ms;
        if (gone) n++;
      });
      return n;
    },

    /* When a recording will be deleted, or null for session-only retention. */
    expiresAt: function (id) {
      var m = index.get(id);
      if (!m) return null;
      var r = getRetention();
      if (r === 'session') return null;
      return m.createdAt + RETENTION[r].ms;
    },

    save: function (id, blob, duration) {
      if (!blob || !/^audio\//.test(blob.type || '')) return Promise.reject(new Error('Not an audio recording.'));
      if (blob.size > MAX_BYTES) return Promise.reject(new Error('Recording is too large. Keep it under a few seconds.'));
      return readBuffer(blob).then(function (data) {
        var rec = {
          id: id,
          data: data,
          type: blob.type,
          size: blob.size,
          duration: duration || 0,
          createdAt: Date.now(),
          sessionId: sessionId
        };
        return dbPut(rec).then(function () {
          index.set(id, meta(rec));
          notify();
        });
      });
    },

    getBlob: function (id) {
      if (!index.has(id)) return Promise.resolve(null);
      var m = index.get(id);
      if (isExpired(m, Date.now())) return purgeExpired().then(function () { return null; });
      return dbGet(id).then(function (rec) {
        if (!rec) return null;
        if (rec.data) return new Blob([rec.data], { type: rec.type });
        return rec.blob || null; // saved by an older version of this page
      }).catch(function () { return null; });
    },

    remove: function (id) {
      index.delete(id);
      return dbDelete(id).then(notify);
    },

    removeAll: function () {
      index.clear();
      return dbClear().then(notify);
    },

    purgeExpired: purgeExpired
  };

  PL.Voice = Voice;
})();
