(() => {
  'use strict';
  const gallery = document.getElementById('gallery');
  const filters = [...document.querySelectorAll('.filter')];
  const lightbox = document.getElementById('lightbox');
  const articleDialog = document.getElementById('article-dialog');
  let currentFilter = 'all', currentIndex = 0, opener = null;
  // 按空间、光线和构图编排；新增作品仍会自动加入所在分类。
  const sequences = {
    landscape: [
      ['wide','mountain-blue'],
      ['quiet','mountain-mist'],
      ['pair','mountains','onyria-dsc08677'],
      ['portraits','mountain-vertical','onyria-dsc08714'],
      ['wide','onyria-pano-0006'],
      ['pair','onyria-dji0094','onyria-dsc06994'],
      ['pair','onyria-dsc06970','onyria-dsc06981'],
      ['quiet','onyria-flower-foreground'],
      ['wide','onyria-dsc07007'],
      ['pair','onyria-dsc00139','onyria-dsc05804'],
      ['portraits','onyria-dsc08714-variant','onyria-mountain-dsc08809'],
      ['wide','onyria-dsc00334'],
      ['quiet','onyria-dsc09176'],
      ['wide','onyria-pano-0001']
    ],
    sunset: [
      ['wide','onyria-dsc01023'],
      ['pair','onyria-dji0159','onyria-pano-sunrise'],
      ['quiet','onyria-dsc06943'],
      ['pair','onyria-dsc03637','onyria-sunset-dsc03632'],
      ['wide','onyria-dsc06774'],
      ['quiet','onyria-dsc06030'],
      ['pair','onyria-dsc00575-gallery','onyria-dsc06016']
    ],
    city: [
      ['wide','onyria-city-pano-2'],
      ['quiet','onyria-city-dsc00050'],
      ['wide','onyria-city-pano-enhanced']
    ],
    stars: [
      ['wide','onyria-stars-milky-way'],
      ['quiet','onyria-stars-mountain-milky-way'],
      ['wide','onyria-stars-dsc00421'],
      ['pair','onyria-stars-dsc00076','onyria-stars-dsc00816'],
      ['quiet','onyria-stars-dsc07557']
    ]
  };
  function galleryRows(photos){
    const categories=new Map();
    photos.forEach(photo=>{
      if(!categories.has(photo.category))categories.set(photo.category,[]);
      categories.get(photo.category).push(photo);
    });
    const rows=[];
    for(const [category,group] of categories){
      const remaining=new Map(group.map(photo=>[photo.id,photo]));
      let first=true;
      for(const [layout,...ids] of sequences[category] || []){
        const selected=ids.filter(id=>remaining.has(id)).map(id=>remaining.get(id));
        if(!selected.length)continue;
        selected.forEach(photo=>remaining.delete(photo.id));
        rows.push({photos:selected,layout,category,opening:first});first=false;
      }
      for(const photo of remaining.values()){
        rows.push({photos:[photo],layout:photo.width/photo.height>1.75?'wide':'quiet',category,opening:first});first=false;
      }
    }
    return rows;
  }
  const filteredRows = () => galleryRows(siteContent.photos.filter(p => currentFilter === 'all' || p.category === currentFilter));
  const filteredPhotos = () => filteredRows().flatMap(row=>row.photos);
  const make = (tag, className, text) => { const e = document.createElement(tag); if(className)e.className=className; if(text !== undefined)e.textContent=text; return e; };
  const lock = () => document.body.classList.add('modal-open');
  const unlock = () => {document.body.classList.remove('modal-open');if(opener?.isConnected)opener.focus();};
  function renderGallery(){
    gallery.replaceChildren();
    const rows=filteredRows(),photos=rows.flatMap(row=>row.photos);
    rows.forEach(row => {
      const spread=make('div',`gallery-row gallery-row-${row.layout}`);
      if(row.opening){
        spread.classList.add('gallery-chapter-start');
        if(currentFilter==='all'){
          const heading=make('h3','gallery-chapter',row.photos[0].label);
          heading.id=`chapter-${row.category}`;spread.setAttribute('aria-labelledby',heading.id);spread.append(heading);
        }
      }
      row.photos.forEach(photo => {
      const figure = make('figure','photo-card');
      if(photo.height>photo.width)figure.classList.add('photo-portrait');
      const button = make('button','photo-image-button');button.type='button';button.setAttribute('aria-label',`放大查看：${photo.title || photo.alt}`);
      const img = make('img');img.src=photo.src;img.alt=photo.alt;img.loading='lazy';img.decoding='async';
      if(photo.width && photo.height){img.width=photo.width;img.height=photo.height;}
      img.addEventListener('error',()=>{img.classList.add('image-error');},{once:true});
      button.append(img,make('span','photo-open','全屏观看'));
      button.addEventListener('click',()=>{opener=button;currentIndex=photos.indexOf(photo);updateLightbox();lightbox.showModal();lock();});
      figure.append(button);
      if(photo.title || photo.description){
        const caption = make('figcaption','photo-caption'), info = make('div');
        if(photo.title)info.append(make('h3','',photo.title));
        if(photo.description)info.append(make('p','',photo.description));
        caption.append(info);figure.append(caption);
      }
      spread.append(figure);
      });
      gallery.append(spread);
    });
    document.getElementById('photo-count').textContent=`${photos.length} 幅影像`;
    if(!photos.length)gallery.append(make('p','empty-message','这个分类暂时还没有作品。'));
  }
  function updateLightbox(){
    const photos=filteredPhotos(),photo=photos[currentIndex],img=document.getElementById('lightbox-image');
    img.src=photo.src;img.alt=photo.alt;
    document.getElementById('lightbox-title').textContent=photo.title;
    document.getElementById('lightbox-category').textContent=photo.description;
    document.getElementById('lightbox-position').textContent=`${String(currentIndex+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;
    document.getElementById('photo-prev').disabled=photos.length<2;
    document.getElementById('photo-next').disabled=photos.length<2;
  }
  function step(direction){const n=filteredPhotos().length;currentIndex=(currentIndex+direction+n)%n;updateLightbox();}
  function resetFilmPlayers(){
    document.querySelectorAll('.documentary-card').forEach(card=>{
      const player=card.querySelector('.documentary-player');
      player.replaceChildren();player.hidden=true;
      card.querySelector('.documentary-poster').hidden=false;
    });
  }
  document.querySelectorAll('.documentary-card').forEach(card=>{
    const poster=card.querySelector('.documentary-poster'),player=card.querySelector('.documentary-player');
    poster.addEventListener('click',()=>{
      const iframe=document.createElement('iframe');
      const url=new URL(`https://www.youtube.com/embed/${encodeURIComponent(card.dataset.youtubeId)}`);
      url.search=new URLSearchParams({autoplay:'1',playsinline:'1',rel:'0',controls:'1',fs:'1'}).toString();
      iframe.src=url.href;iframe.title=`${card.querySelector('h3').textContent} · YouTube播放器`;
      iframe.allow='autoplay; fullscreen; picture-in-picture; encrypted-media';iframe.allowFullscreen=true;
      iframe.referrerPolicy='strict-origin-when-cross-origin';
      player.replaceChildren(iframe);player.hidden=false;poster.hidden=true;
      iframe.focus({preventScroll:true});
    });
  });
  const panelAnimations=new WeakMap();
  const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  async function animatePanel(panel,show){
    const previous=panelAnimations.get(panel);
    const from=panel.hidden?0:panel.getBoundingClientRect().height;
    const opacity=panel.hidden?0:Number(getComputedStyle(panel).opacity);
    if(previous){previous.cancel();panelAnimations.delete(panel);}
    panel.hidden=false;
    panel.style.height='';panel.style.opacity='';
    const to=show?panel.getBoundingClientRect().height:0;
    panel.inert=!show;
    if(reducedMotion()||!panel.animate){panel.hidden=!show;panel.classList.remove('is-animating');return;}
    panel.classList.add('is-animating');
    const animation=panel.animate([{height:`${from}px`,opacity},{height:`${to}px`,opacity:show?1:0}],{duration:440,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    panelAnimations.set(panel,animation);
    try{await animation.finished;}catch{return;}
    if(panelAnimations.get(panel)!==animation)return;
    panel.hidden=!show;
    animation.cancel();panelAnimations.delete(panel);
    panel.classList.remove('is-animating');
  }
  async function setSectionExpanded(button,expanded,showGallery=false){
    const section=button.closest('section'),heading=button.closest('.section-toggle');
    button.setAttribute('aria-expanded',String(expanded));
    button.setAttribute('aria-label',`${expanded?'收起':'展开'}${button.dataset.sectionLabel}栏目`);
    heading.classList.toggle('is-collapsed',!expanded);
    const panel=document.getElementById(button.getAttribute('aria-controls'));
    const transitions=[];
    if(section.id==='works'){
      const overview=document.getElementById('works-overview');
      if(!showGallery)selectionVersion++;
      heading.classList.toggle('has-gallery',expanded&&showGallery);
      if((!expanded&&panel.contains(document.activeElement))||overview.contains(document.activeElement))button.focus({preventScroll:true});
      transitions.push(animatePanel(panel,expanded&&showGallery),animatePanel(overview,expanded&&!showGallery));
    }else{
      if(section.id==='documentaries'&&!expanded)resetFilmPlayers();
      transitions.push(animatePanel(panel,expanded));
    }
    await Promise.all(transitions);
    if(!expanded&&button.getAttribute('aria-expanded')==='false'&&heading.getBoundingClientRect().top<76){
      window.scrollTo({top:Math.max(0,window.scrollY+section.getBoundingClientRect().top-90),behavior:reducedMotion()?'instant':'smooth'});
    }
  }
  let selectionVersion=0;
  async function selectCategory(filter){
    const version=++selectionVersion;
    currentFilter=filter;
    filters.forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    const sectionButton=document.querySelector('#works .section-toggle-control');
    const wasCollapsed=sectionButton.getAttribute('aria-expanded')==='false';
    renderGallery();
    await setSectionExpanded(sectionButton,true,true);
    if(version!==selectionVersion)return;
    const toolbar=document.querySelector('.works-toolbar'),content=document.getElementById('works-content');
    const top=window.scrollY+content.getBoundingClientRect().top-document.getElementById('header').offsetHeight-toolbar.offsetHeight-24;
    window.scrollTo({top:Math.max(0,top),behavior:reducedMotion()?'instant':'smooth'});
    if(wasCollapsed)sectionButton.focus({preventScroll:true});
  }
  filters.forEach(button=>button.addEventListener('click',()=>selectCategory(button.dataset.filter)));
  const coverPhotos={landscape:'mountains',sunset:'onyria-dsc01023',city:'onyria-city-pano-2',stars:'onyria-stars-milky-way'};
  const covers=document.getElementById('category-covers');
  const orderedCovers=Object.entries(coverPhotos);
  for(const [category,id] of orderedCovers){
    const photo=siteContent.photos.find(p=>p.id===id);
    const count=siteContent.photos.filter(p=>p.category===category).length;
    const button=make('button','category-cover');button.type='button';button.dataset.category=category;
    button.setAttribute('aria-label',`打开${photo.label}，${count}幅影像`);
    const media=make('div','category-cover-image'),img=make('img');
    img.src=photo.src;img.alt=photo.alt;img.width=photo.width;img.height=photo.height;img.loading='lazy';img.decoding='async';media.append(img);
    const caption=make('div','category-cover-caption');caption.append(make('span','category-cover-name',photo.label),make('span','category-cover-count',`${count} 幅`));
    button.append(media,caption);button.addEventListener('click',()=>selectCategory(category));covers.append(button);
  }
  document.getElementById('lightbox-close').addEventListener('click',()=>lightbox.close());
  document.getElementById('photo-prev').addEventListener('click',()=>step(-1));
  document.getElementById('photo-next').addEventListener('click',()=>step(1));
  lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}if(e.key==='ArrowRight'){e.preventDefault();step(1);}});
  lightbox.addEventListener('close',unlock);
  let touchX=null,touchY=null;
  const lightboxImage=document.getElementById('lightbox-image');
  lightboxImage.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY;},{passive:true});
  lightboxImage.addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy))step(dx<0?1:-1);touchX=null;},{passive:true});
  document.querySelectorAll('[data-article]').forEach(button=>button.addEventListener('click',()=>{
    const article=siteContent.articles[Number(button.dataset.article)];opener=button;
    document.getElementById('article-title').textContent=article.title;
    document.getElementById('article-tag').textContent=article.tag;
    document.getElementById('article-body').replaceChildren(...article.paragraphs.map(text=>make('p','',text)));
    articleDialog.showModal();articleDialog.scrollTop=0;lock();
  }));
  document.getElementById('article-close').addEventListener('click',()=>articleDialog.close());
  articleDialog.addEventListener('close',unlock);
  articleDialog.addEventListener('click',e=>{if(e.target===articleDialog){const r=articleDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)articleDialog.close();}});
  const header=document.getElementById('header');
  const onScroll=()=>header.classList.toggle('scrolled',window.scrollY>60);
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  document.getElementById('year').textContent=new Date().getFullYear();
  if(!siteContent.articles.length){
    document.getElementById('journal').hidden=true;
    document.querySelectorAll('a[href="#journal"]').forEach(link=>link.hidden=true);
  }
  siteContent.credits.forEach(c=>{const li=make('li'),link=make('a','',c.author),license=make('a','',c.license);link.href=c.url;license.href=c.licenseUrl;for(const a of [link,license]){a.target='_blank';a.rel='noopener noreferrer';}li.append(make('span','',`${c.title} · `),link,make('span','',' · '),license,make('span','','；已缩放并转为 WebP，页面按版式裁切显示。'));document.getElementById('credits-list').append(li);});
  document.querySelectorAll('.section-toggle-control').forEach(button=>{
    button.addEventListener('click',()=>setSectionExpanded(button,button.getAttribute('aria-expanded')!=='true'));
  });
  document.querySelectorAll('a[href="#works"],a[href="#documentaries"],a[href="#journal"],a[href="#about"]').forEach(link=>{
    link.addEventListener('click',async e=>{
      const section=document.querySelector(link.getAttribute('href'));
      const button=section?.querySelector('.section-toggle-control');
      if(button?.getAttribute('aria-expanded')==='false'){
        e.preventDefault();await setSectionExpanded(button,true);
        section.scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'start'});
      }
    });
  });
  renderGallery();
})();
