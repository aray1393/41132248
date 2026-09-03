(() => {
  const STORAGE_KEY = 'nfc-nail-v14';
  const IDS = ['A','B','C','D'];

  const albums = {
    A: {
      title:'Running Up That Hill', artist:'Kate Bush', videoId:'wp43OdtAAkM',
      theme:'running', light:'#e6ccff', label:'RUNNING',
      artwork:'https://cdn.prod.website-files.com/6558b6eea341c3c31949d3f6/6558b6eea341c3c3194a007a_Scan10023_stitchkbc.jpg'
    },
    B: {
      title:'this is what winter feels like', artist:'JVKE', videoId:'beSO_-Xn3vs',
      theme:'winter', light:'#d9f1ff', label:'WINTER',
      artwork:'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/4d/eb/ea/4debeafa-bf39-6673-29b5-23145c024de8/197190797046.jpg/3000x3000bb.jpg'
    },
    C: {
      title:'봄날', artist:'BTS', videoId:'xEeFrLSkMm8',
      theme:'spring', light:'#ffe59a', label:'봄날',
      artwork:'https://wallpaperbat.com/img/143045770-pin.png'
    },
    D: {
      title:'表裏一体', artist:'ゆず', videoId:'eKoD2CRr_KA',
      theme:'hyori', light:'#ffffff', label:'表裏一体',
      artwork:'https://yuzu-official.com/uploads/76adc489-c61c-47d6-bd56-766824697711/contents/discography/9169_SNCC-89930.jpg'
    }
  };

  const DEV = { A:'dev-a', B:'dev-b', C:'dev-c', D:'dev-d' };
  const $ = (s) => document.querySelector(s);

  let state = loadState();
  let current = null;

  function loadState(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  function saveState(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function youtubeThumb(id){
    return `https://i.ytimg.com/vi/${albums[id].videoId}/hqdefault.jpg`;
  }

  function countCollected(){
    return IDS.filter(id => !!state[id]).length;
  }

  function toast(text){
    const t = $('#toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => t.classList.remove('show'), 1600);
  }

  function spawnFX(){
    const snowWrap = $('#winterSnow');
    const petalWrap = $('#springPetals');

    snowWrap.innerHTML = Array.from({length: 36}, (_, i) => {
      const left = (i * 19 + (i % 5) * 3) % 100;
      const duration = 5 + (i % 7);
      const delay = -(i % 9);
      const opacity = 0.35 + (i % 5) * 0.1;
      return `<i class="snow" style="left:${left}%;animation-duration:${duration}s;animation-delay:${delay}s;opacity:${opacity}"></i>`;
    }).join('');

    petalWrap.innerHTML = Array.from({length: 22}, (_, i) => {
      const left = (i * 21 + (i % 4) * 7) % 100;
      const duration = 7 + (i % 8);
      const delay = -(i % 11);
      const opacity = 0.36 + (i % 4) * 0.12;
      return `<i class="petal" style="left:${left}%;animation-duration:${duration}s;animation-delay:${delay}s;opacity:${opacity}"></i>`;
    }).join('');
  }

  function renderCollection(){
    $('#collection').innerHTML = IDS.map(id => {
      const info = albums[id];
      const has = !!state[id];
      const currentClass = current === id ? 'current' : '';
      const collectedClass = has ? 'collected' : '';
      return `
        <button class="collect-btn ${currentClass} ${collectedClass}" data-id="${id}" ${has ? '' : 'disabled'}>
          <span class="collect-orb-wrap">
            <span class="collect-orb" style="--light:${info.light}"></span>
          </span>
          <span class="collect-label notranslate" translate="no">${info.label}</span>
        </button>
      `;
    }).join('');

    document.querySelectorAll('.collect-btn:not(:disabled)').forEach(btn => {
      btn.onclick = () => selectAlbum(btn.dataset.id, false);
    });

    $('#metaRight').textContent = `${countCollected()} / 4`;
  }

  function loadCover(id){
    const img = $('#coverImage');
    const placeholder = $('#coverPlaceholder');
    const card = $('#coverCard');

    img.style.display = 'none';
    placeholder.style.display = 'grid';
    img.onload = () => {
      img.style.display = 'block';
      placeholder.style.display = 'none';
      card.classList.add('loaded', 'flash');
      setTimeout(() => card.classList.remove('flash'), 900);
    };
    let fallbackTried = false;
    img.onerror = () => {
      if (!fallbackTried) {
        fallbackTried = true;
        img.src = youtubeThumb(id);
        return;
      }
      img.style.display = 'none';
      placeholder.style.display = 'grid';
      card.classList.remove('loaded');
      toast('Cover load failed');
    };
    img.src = albums[id].artwork;
  }

  function selectAlbum(id, fresh){
    if (!state[id]) return;

    current = id;
    const info = albums[id];

    document.documentElement.dataset.theme = info.theme;
    $('#metaLeft').textContent = `PIECE ${id}`;
    $('#eyebrow').textContent = `${info.label}`;
    $('#albumTitle').setAttribute('translate','no');
    $('#albumTitle').classList.add('notranslate');
    $('#albumTitle').textContent = info.title;
    $('#albumArtist').setAttribute('translate','no');
    $('#albumArtist').classList.add('notranslate');
    $('#albumArtist').textContent = info.artist;
    $('#playerState').textContent = 'READY';

    loadCover(id);
    renderCollection();
    updateTransport();

    $('#copyCurrent').disabled = false;
    $('#copyCurrent').dataset.url = `https://youtu.be/${info.videoId}`;

    if (fresh) toast(`${id} collected`);
  }

  function scanPiece(id){
    const existed = !!state[id];
    state[id] = DEV[id];
    saveState();
    renderCollection();
    selectAlbum(id, !existed);
    if (existed) toast(`${id} already collected`);
  }

  function resetAll(){
    localStorage.removeItem(STORAGE_KEY);
    state = {};
    current = null;
    renderCollection();

    document.documentElement.removeAttribute('data-theme');
    $('#metaLeft').textContent = 'MUSIC SCENE';
    $('#eyebrow').textContent = 'WAITING';
    $('#albumTitle').textContent = 'Locked Scene';
    $('#albumArtist').textContent = 'Scan any nail to unlock a theme';
    $('#playerState').textContent = 'LOCKED';

    $('#coverImage').removeAttribute('src');
    $('#coverImage').style.display = 'none';
    $('#coverPlaceholder').style.display = 'grid';
    $('#coverCard').classList.remove('loaded');

    $('#copyCurrent').disabled = true;
    delete $('#copyCurrent').dataset.url;
    updateTransport();
    toast('Collection reset');
  }

  function getUnlockedIds(){
    return IDS.filter(id => !!state[id]);
  }

  function updateTransport(){
    const unlocked = getUnlockedIds();
    const prevBtn = $('#prevTrack');
    const playBtn = $('#playLink');
    const nextBtn = $('#nextTrack');
    const usable = !!current && unlocked.includes(current);

    prevBtn.disabled = !usable || unlocked.length < 2;
    nextBtn.disabled = !usable || unlocked.length < 2;
    playBtn.disabled = !usable;

    if (usable){
      playBtn.dataset.url = `https://youtu.be/${albums[current].videoId}`;
    } else {
      delete playBtn.dataset.url;
    }
  }

  function stepAlbum(dir){
    const unlocked = getUnlockedIds();
    if (!current || unlocked.length < 2) return;
    const index = unlocked.indexOf(current);
    if (index < 0) return;
    const nextIndex = (index + dir + unlocked.length) % unlocked.length;
    selectAlbum(unlocked[nextIndex], false);
  }

  function openCurrentTrack(){
    if (!current) return;
    const url = `https://youtu.be/${albums[current].videoId}`;
    window.open(url, '_blank', 'noopener');
  }

  document.querySelectorAll('[data-scan]').forEach(btn => {
    btn.onclick = () => scanPiece(btn.dataset.scan);
  });

  $('#randomScan').onclick = () => {
    const id = IDS[Math.floor(Math.random() * IDS.length)];
    scanPiece(id);
  };

  $('#prevTrack').onclick = () => stepAlbum(-1);
  $('#playLink').onclick = () => openCurrentTrack();
  $('#nextTrack').onclick = () => stepAlbum(1);

  $('#resetProgress').onclick = resetAll;

  $('#copyCurrent').onclick = async () => {
    const url = $('#copyCurrent').dataset.url || '';
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied');
    } catch {
      toast('Copy failed');
    }
  };

  const sheet = $('#devSheet');
  const setSheet = (open) => {
    sheet.classList.toggle('open', open);
    sheet.setAttribute('aria-hidden', String(!open));
  };
  $('#openDev').onclick = () => setSheet(true);
  $('#closeDev').onclick = () => setSheet(false);
  $('#closeDevScrim').onclick = () => setSheet(false);

  spawnFX();
  renderCollection();
  updateTransport();

  const first = IDS.find(id => !!state[id]);
  if (first) selectAlbum(first, false);
})();
