window.initOnyriaPage = () => {
  window.disposeOnyriaPage?.();
  const scope=window.createOnyriaScope(),listen=scope.listen,later=scope.later;
  window.disposeOnyriaPage=()=>{scope.dispose();document.body.classList.remove('modal-open','is-page-turning');};
  'use strict';
  const gallery = document.getElementById('gallery');
  const filters = [...document.querySelectorAll('.filter')];
  const lightbox = document.getElementById('lightbox');
  const articleDialog = document.getElementById('article-dialog');
  let currentFilter = document.body.dataset.category || 'all', currentIndex = 0, opener = null;
  let viewerPhotos = [], viewerOpener = null;
  const galleryViewport = window.matchMedia('(max-width: 600px)');
  const aspectRatio = photo => photo.width / photo.height || 1.5;
  // Balance row heights globally. Native aspect ratios determine each width;
  // full compositions stay intact in previews; the viewer loads each original.
  function galleryLayout(photos, narrow = false) {
    const limit = narrow ? 2 : 5, target = narrow ? 2.9 : 5.6;
    const scores = Array(photos.length + 1).fill(Infinity), choices = [];
    scores[photos.length] = 0;
    for (let index = photos.length - 1; index >= 0; index--) {
      let ratio = 0;
      for (let size = 1; size <= limit && index + size <= photos.length; size++) {
        ratio += aspectRatio(photos[index + size - 1]);
        if (narrow && size > 1 && (aspectRatio(photos[index]) >= 2.1 || aspectRatio(photos[index + size - 1]) >= 2.1)) break;
        const solitary = size === 1 && ratio < 1 ? 6 : size === 1 && ratio < 1.9 ? 2 : 0;
        const score = (ratio - target) ** 2 + solitary + .35 + scores[index + size];
        if (score < scores[index]) {scores[index] = score;choices[index] = size;}
      }
    }
    const rows = [];
    for (let index = 0; index < photos.length;) {
      const size = choices[index] || 1;
      rows.push(photos.slice(index, index + size).map((photo, offset) => ({photo, index:index + offset, ratio:aspectRatio(photo)})));
      index += size;
    }
    return rows;
  }
  const filteredPhotos = () => siteContent.photos.filter(p => currentFilter === 'all' || p.category === currentFilter);
  const make = (tag, className, text) => { const e = document.createElement(tag); if(className)e.className=className; if(text !== undefined)e.textContent=text; return e; };
  const previewRoot='https://onyria-photography.smokymaple16.chatgpt.site/assets/previews/';
  function setPreview(img,photo,sizes='(max-width: 600px) 46vw, (max-width: 1100px) 27vw, 22vw'){
    const widthFor=size=>Math.max(1,Math.round(photo.width*Math.min(size/photo.width,size/photo.height,1)));
    img.src=previewRoot+photo.id+'-960.jpg';
    img.srcset=`${previewRoot}${photo.id}-480.jpg ${widthFor(480)}w, ${previewRoot}${photo.id}-960.jpg ${widthFor(960)}w`;
    img.sizes=sizes;
  }
  const lock = () => document.body.classList.add('modal-open');
  const unlock = () => {document.body.classList.remove('modal-open');if(opener?.isConnected)opener.focus({preventScroll:true});};
  function renderGallery(){
    if(!gallery)return;
    gallery.replaceChildren();
    const photos = filteredPhotos();
    galleryLayout(photos,galleryViewport.matches).forEach(row => {
      const spread = make('div','gallery-spread');
      spread.setAttribute('role','group');
      row.forEach(({photo,index,ratio}) => {
      const figure = make('figure','photo-card');
      figure.style.setProperty('--photo-ratio',String(ratio));
      if(photo.height>photo.width)figure.classList.add('photo-portrait');
      const button = make('button','photo-image-button');button.type='button';button.setAttribute('aria-label',`放大查看：${photo.title || photo.alt}`);
      const img = make('img');setPreview(img,photo);img.alt=photo.alt;img.loading='lazy';img.decoding='async';
      if(photo.width && photo.height){img.width=photo.width;img.height=photo.height;}
      listen(img,'error',()=>{img.classList.add('image-error');},{once:true});
      button.append(img,make('span','photo-open','全屏观看'));
      listen(button,'click',()=>openLightbox(photos,index,button));
      figure.append(button);
      if(photo.title || photo.description){
        const caption = make('figcaption','photo-caption'), info = make('div');
        if(photo.title)info.append(make('h3','',photo.title));
        if(photo.description)info.append(make('p','',photo.description));
        caption.append(info);figure.append(caption);
      }
      const folio = make('span','photo-folio',String(index+1).padStart(2,'0'));
      folio.setAttribute('aria-hidden','true');figure.append(folio);
      spread.append(figure);
      });
      gallery.append(spread);
    });
    document.getElementById('photo-count').textContent=`${photos.length} 幅影像`;
    if(!photos.length)gallery.append(make('p','empty-message','这个分类暂时还没有作品。'));
  }
  if (galleryViewport.addEventListener) listen(galleryViewport,'change',renderGallery);
  else if (galleryViewport.addListener) {galleryViewport.addListener(renderGallery);scope.cleanup(()=>galleryViewport.removeListener(renderGallery));}
  const strip=document.getElementById('filmstrip-track');
  let stripKey='';
  function syncFilmstrip(photos){
    if(!strip)return;
    const key=photos.map(p=>p.id).join('|');
    if(key!==stripKey){
      stripKey=key;strip.replaceChildren();
      photos.forEach((photo,index)=>{
        const button=make('button','filmstrip-thumb');button.type='button';
        button.setAttribute('aria-label',`查看第 ${index+1} 张：${photo.title||photo.alt}`);
        const img=make('img');img.src=photo.thumbnail||'https://onyria-photography.smokymaple16.chatgpt.site/assets/thumbnails/'+photo.id+'.jpg';img.alt='';img.loading='lazy';img.decoding='async';
        button.append(img,make('span','filmstrip-number',String(index+1).padStart(2,'0')));
        listen(button,'click',()=>{currentIndex=index;updateLightbox();});strip.append(button);
      });
    }
    [...strip.children].forEach((button,index)=>{
      button.classList.toggle('is-selected',index===currentIndex);
      button.setAttribute('aria-current',index===currentIndex?'true':'false');button.tabIndex=index===currentIndex?0:-1;
    });
    const selected=strip.children[currentIndex];
    later(()=>{if(lightbox.open&&selected===strip.children[currentIndex])selected?.scrollIntoView?.({block:'nearest',inline:'center',behavior:'instant'});},0);
  }
  const lightboxImage=document.getElementById('lightbox-image');
  const imageViewport=lightboxImage.parentElement;
  let photoZoomed=false,suppressPhotoClickUntil=0;
  function resetPhotoZoom(){
    photoZoomed=false;
    lightboxImage.style.transform='none';
    lightboxImage.style.transformOrigin='50% 50%';
    lightboxImage.style.cursor='zoom-in';
    lightboxImage.setAttribute('aria-pressed','false');
    lightboxImage.setAttribute('aria-label',`放大照片至2倍：${lightboxImage.alt}`);
    lightboxImage.title='点击以此处为中心放大至2倍';
  }
  function paintedPhotoBounds(){
    const rect=lightboxImage.getBoundingClientRect(),viewport=imageViewport.getBoundingClientRect();
    const width=lightboxImage.naturalWidth,height=lightboxImage.naturalHeight;
    if(!width||!height)return null;
    const scale=Math.min(rect.width/width,rect.height/height);
    const left=rect.left+(rect.width-width*scale)/2,top=rect.top+(rect.height-height*scale)/2;
    return {left:Math.max(left,viewport.left),right:Math.min(left+width*scale,viewport.right),top:Math.max(top,viewport.top),bottom:Math.min(top+height*scale,viewport.bottom)};
  }
  function overPhoto(x,y){
    const bounds=paintedPhotoBounds();
    return bounds&&x>=bounds.left&&x<=bounds.right&&y>=bounds.top&&y<=bounds.bottom;
  }
  function togglePhotoZoom(x,y){
    if(photoZoomed){resetPhotoZoom();return;}
    const rect=imageViewport.getBoundingClientRect();
    photoZoomed=true;
    lightboxImage.style.transformOrigin=`${x-rect.left}px ${y-rect.top}px`;
    lightboxImage.style.transform='scale(2)';
    lightboxImage.style.cursor='zoom-out';
    lightboxImage.setAttribute('aria-pressed','true');
    lightboxImage.setAttribute('aria-label',`恢复照片原尺寸：${lightboxImage.alt}`);
    lightboxImage.title='点击恢复原尺寸';
  }
  listen(imageViewport,'pointermove',event=>{
    lightboxImage.style.cursor=overPhoto(event.clientX,event.clientY)?(photoZoomed?'zoom-out':'zoom-in'):'default';
  });
  listen(lightboxImage,'keydown',event=>{
    if(!['Enter',' '].includes(event.key))return;
    event.preventDefault();
    const rect=imageViewport.getBoundingClientRect();
    togglePhotoZoom(rect.left+rect.width/2,rect.top+rect.height/2);
  });
  listen(window,'resize',resetPhotoZoom);
  function updateLightbox(){
    const photos=viewerPhotos,photo=photos[currentIndex],img=document.getElementById('lightbox-image');
    img.src=photo.src;img.alt=photo.alt;resetPhotoZoom();
    document.getElementById('lightbox-title').textContent=photo.title;
    document.getElementById('lightbox-category').textContent=photo.description;
    document.getElementById('lightbox-position').textContent=`${String(currentIndex+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;
    document.getElementById('photo-prev').disabled=photos.length<2;
    document.getElementById('photo-next').disabled=photos.length<2;
    syncFilmstrip(photos);
  }
  function openLightbox(photos,index,button){
    viewerPhotos=photos;currentIndex=index;viewerOpener=button;
    wheelAmount=0;lastWheel=0;lastStep=-Infinity;
    updateLightbox();lightbox.showModal();lock();
  }
  function step(direction){const n=viewerPhotos.length;if(!n)return;currentIndex=(currentIndex+direction+n)%n;updateLightbox();}
  document.querySelectorAll('.documentary-card').forEach(card=>{
    const poster=card.querySelector('.documentary-poster'),player=card.querySelector('.documentary-player');
    function startFilm(){
      if(player.querySelector('iframe'))return;
      const iframe=document.createElement('iframe');
      const url=new URL(`https://www.youtube.com/embed/${encodeURIComponent(card.dataset.youtubeId)}`);
      url.search=new URLSearchParams({autoplay:'1',playsinline:'1',rel:'0',controls:'1',fs:'1'}).toString();
      iframe.src=url.href;iframe.title=`${card.querySelector('h3').textContent} · YouTube播放器`;
      iframe.allow='autoplay; fullscreen; picture-in-picture; encrypted-media';iframe.allowFullscreen=true;
      iframe.referrerPolicy='strict-origin-when-cross-origin';
      player.replaceChildren(iframe);player.hidden=false;poster.hidden=true;
      iframe.focus({preventScroll:true});
    }
    listen(poster,'click',startFilm);
    listen(card.querySelector('.documentary-fullscreen'),'click',()=>{
      startFilm();
      const media=card.querySelector('.documentary-media');
      const fallback=()=>{card.querySelector('.film-status').textContent='可使用播放器右下角的全屏按钮。';};
      if(!media.requestFullscreen){fallback();return;}
      try{Promise.resolve(media.requestFullscreen()).catch(fallback);}catch{fallback();}
    });
  });
  const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coverPhotos={landscape:'mountains',sunset:'onyria-dsc01023-v2',city:'onyria-city-pano-2',stars:'onyria-stars-dsc07557'};
  const covers=document.getElementById('category-covers');
  const orderedCovers=Object.entries(coverPhotos);
  if(covers)for(const [category,id] of orderedCovers){
    const photo=siteContent.photos.find(p=>p.id===id);
    const count=siteContent.photos.filter(p=>p.category===category).length;
    const button=make('a','category-cover');button.href=category+'.html';button.dataset.category=category;
    button.setAttribute('aria-label',`打开${photo.label}，${count}幅影像`);
    const media=make('div','category-cover-image'),img=make('img');
    setPreview(img,photo,'(max-width: 600px) 42vw, (max-width: 900px) 44vw, 29vw');img.alt=photo.alt;img.width=photo.width;img.height=photo.height;img.loading='lazy';img.decoding='async';media.append(img);
    const caption=make('div','category-cover-caption'),copy=make('div','category-cover-copy');
    copy.append(make('span','category-cover-name',photo.label),make('span','category-cover-count',String(count)));
    const hint=make('span','category-cover-hint');hint.setAttribute('aria-hidden','true');
    hint.innerHTML='<svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M5 19 19 5M6 5h13v13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    caption.append(copy,hint);media.append(caption);
    button.append(media);covers.append(button);
  }
  listen(document.getElementById('lightbox-close'),'click',()=>lightbox.close());
  listen(document.getElementById('photo-prev'),'click',()=>step(-1));
  listen(document.getElementById('photo-next'),'click',()=>step(1));
  listen(lightbox,'keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}if(e.key==='ArrowRight'){e.preventDefault();step(1);}});
  listen(lightbox,'close',()=>{
    resetPhotoZoom();
    if(!articleDialog.open)document.body.classList.remove('modal-open');
    if(viewerOpener?.isConnected)viewerOpener.focus({preventScroll:true});
    viewerOpener=null;
  });
  listen(lightbox,'cancel',event=>{event.preventDefault();lightbox.close();});
  let wheelAmount=0,lastWheel=0,lastStep=-Infinity;
  listen(lightbox,'wheel',event=>{
    if(event.ctrlKey)return;
    event.preventDefault();
    const now=performance.now();
    if(now-lastStep<180)return;
    if(now-lastWheel>160)wheelAmount=0;
    const scale=event.deltaMode===1?16:event.deltaMode===2?window.innerHeight:1;
    wheelAmount+=(Math.abs(event.deltaY)>=Math.abs(event.deltaX)?event.deltaY:event.deltaX)*scale;lastWheel=now;
    if(Math.abs(wheelAmount)>=40){step(wheelAmount>0?1:-1);wheelAmount=0;lastStep=now;}
  },{passive:false});
  listen(lightbox,'click',event=>{
    if(event.target.closest?.('button,a,.lightbox-bar,.lightbox-caption,.lightbox-filmstrip'))return;
    if(performance.now()<suppressPhotoClickUntil)return;
    if(overPhoto(event.clientX,event.clientY)){
      togglePhotoZoom(event.clientX,event.clientY);return;
    }
    lightbox.close();
  });
  let touchX=null,touchY=null;
  listen(lightboxImage,'touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY;},{passive:true});
  listen(lightboxImage,'touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)){suppressPhotoClickUntil=performance.now()+350;step(dx<0?1:-1);}touchX=null;},{passive:true});
  const journalTitleParts=article=>{
    const prefix=make('span','journal-prefix'),dot=make('span','journal-separator','·');
    dot.setAttribute('aria-hidden','true');
    prefix.append(make('span','journal-kind',article.kind||'徒步纪实'),dot);
    return [prefix,make('span','journal-title-text',article.title)];
  };
  const journalContent=document.getElementById('journal-content');
  if(journalContent){
    const list=make('div','journal-list');
    siteContent.articles.forEach((article,index)=>{
      const button=make('button','journal-entry');button.type='button';button.dataset.article=String(index);
      button.setAttribute('aria-label',`阅读${article.kind||'徒步纪实'}：${article.title}`);
      const copy=make('span','journal-copy'),heading=make('span','journal-title'),arrow=make('span','journal-arrow');
      heading.append(...journalTitleParts(article));copy.append(heading);
      arrow.setAttribute('aria-hidden','true');
      arrow.innerHTML='<svg viewBox="0 0 52 52" fill="none" aria-hidden="true" focusable="false"><path class="journal-arrow-line" d="m18 34 16-16M18 18h16v16" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      button.append(make('span','journal-index',String(index+1).padStart(2,'0')),copy,arrow);
      list.append(button);
    });
    journalContent.replaceChildren(list);
  }
  // Keep the reader in the document layer so page annotation tools can select its text.
  const articleBackdrop=make('div','article-backdrop');
  articleBackdrop.hidden=true;articleBackdrop.setAttribute('aria-hidden','true');
  document.body.append(articleBackdrop);
  scope.cleanup(()=>{articleBackdrop.remove();if(lightbox.open)lightbox.close();if(articleDialog.open)articleDialog.close();});
  document.querySelectorAll('[data-article]').forEach(button=>listen(button,'click',()=>{
    const article=siteContent.articles[Number(button.dataset.article)];opener=button;
    document.getElementById('article-title').replaceChildren(...journalTitleParts(article));
    document.getElementById('article-tag').textContent=article.tag;
    let articlePhotoNumber=0;
    const articlePhotos=[];
    document.getElementById('article-body').replaceChildren(...article.paragraphs.flatMap((text,index)=>{
      const paragraph=make('p','',text);paragraph.id=`${article.id}-paragraph-${index+1}`;
      const photos=(article.images||[]).filter(photo=>photo.afterParagraph===index+1).map(photo=>{
        const number=++articlePhotoNumber;
        const figure=make('figure','article-photo'+(photo.height>photo.width?' article-photo-portrait':''));
        figure.id=`${article.id}-photo-${number}`;
        const img=make('img');img.src=photo.src;img.alt=photo.alt||photo.caption||`P${number}`;
        img.width=photo.width;img.height=photo.height;img.loading='lazy';img.decoding='async';
        const caption=make('figcaption','article-photo-caption',`P${number}`+(photo.caption?`：${photo.caption}`:''));
        const photoButton=make('button','article-photo-button');photoButton.type='button';
        photoButton.setAttribute('aria-label',`放大查看：P${number}`);
        const photoIndex=articlePhotos.length;
        articlePhotos.push({...photo,id:`${article.id}-photo-${number}`,title:`P${number}`,description:photo.caption||'',alt:img.alt,thumbnail:photo.src.replace('assets/journal/','https://onyria-photography.smokymaple16.chatgpt.site/https://onyria-photography.smokymaple16.chatgpt.site/assets/thumbnails/journal-')});
        listen(photoButton,'click',()=>openLightbox(articlePhotos,photoIndex,photoButton));
        photoButton.append(img);figure.append(photoButton,caption);return figure;
      });
      return [paragraph,...photos];
    }));
    articleBackdrop.hidden=false;articleDialog.show();articleDialog.scrollTop=0;lock();
    document.getElementById('article-close').focus({preventScroll:true});
  }));
  listen(document.getElementById('article-close'),'click',()=>articleDialog.close());
  listen(articleDialog,'close',()=>{articleBackdrop.hidden=true;unlock();});
  listen(articleBackdrop,'click',()=>articleDialog.close());
  listen(document,'keydown',event=>{
    if(event.key==='Escape'&&!event.defaultPrevented&&!lightbox.open&&articleDialog.open){event.preventDefault();articleDialog.close();}
  });
  const header=document.getElementById('header');
  const onScroll=()=>header.classList.toggle('scrolled',window.scrollY>60);
  listen(window,'scroll',onScroll,{passive:true});onScroll();
  // The real content rises over the stationary cover, then hands back to normal scrolling.
  const home=document.getElementById('home'),works=document.getElementById('works');
  const pageContent=document.getElementById('page-content');
  if(home && works && pageContent){
  const dimmer=make('div','page-turn-dimmer');
  dimmer.setAttribute('aria-hidden','true');home.append(dimmer);
  let turningPage=false,wheelQuietUntil=0,settleTimer=0,touchOrigin=null;
  // offsetTop is unaffected by the temporary animation transform.
  const worksTop=()=>pageContent.offsetTop;
  const atHome=()=>window.scrollY<worksTop()-4;
  const atWorksStart=()=>Math.abs(window.scrollY-worksTop())<8;
  const transitionDirection=delta=>delta>0&&atHome()?1:delta<0&&atWorksStart()?-1:0;
  const activeDialog=()=>Boolean(document.querySelector('dialog[open]'));
  async function turnPage(direction){
    if(turningPage||activeDialog())return;
    turningPage=true;clearTimeout(settleTimer);
    const target=direction>0?works:home,animations=[];
    const move=()=>{
      window.scrollTo({top:direction>0?worksTop():0,behavior:'instant'});
      history.replaceState(history.state,'',direction>0?'#works':'#home');
      target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
    };
    try{
      if(reducedMotion()||!pageContent.animate){move();return;}
      // Begin at an exact boundary so trackpads, touch and scrollbar settling agree.
      window.scrollTo({top:direction>0?0:worksTop(),behavior:'instant'});
      const distance=worksTop();
      home.style.transform=`translateY(${window.scrollY}px)`;
      document.body.classList.add('is-page-turning');
      header.classList.add('scrolled');
      const down=direction>0;
      const contentAnimation=scope.animate(pageContent,[
        {transform:'translateY(0)',filter:down?'brightness(.9)':'brightness(1)'},
        {transform:`translateY(${down?-distance:distance}px)`,filter:down?'brightness(1)':'brightness(.9)'}
      ],{duration:620,easing:'cubic-bezier(.22,.75,.25,1)',fill:'forwards'});
      const shadeAnimation=scope.animate(dimmer,[{opacity:down ? 0 : .2},{opacity:down ? .2 : 0}],
        {duration:620,easing:'ease-in-out',fill:'forwards'});
      animations.push(contentAnimation,shadeAnimation);
      await contentAnimation.finished;
    }catch{
      // A cancelled animation must still end on a usable page.
    }finally{
      // These synchronous operations happen together before the next paint.
      animations.forEach(animation=>animation.cancel());
      if(scope.disposed)return;
      home.style.transform='';document.body.classList.remove('is-page-turning');
      move();onScroll();
      turningPage=false;wheelQuietUntil=performance.now()+180;
    }
  }
  listen(window,'wheel',event=>{
    if(activeDialog()||event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    if(turningPage||performance.now()<wheelQuietUntil){event.preventDefault();return;}
    if(Math.abs(event.deltaY)<2)return;
    const direction=transitionDirection(event.deltaY);
    if(direction){event.preventDefault();void turnPage(direction);}
  },{passive:false});
  listen(window,'keydown',event=>{
    if(activeDialog()||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.target.closest?.('input,textarea,select,button,a,[contenteditable="true"]'))return;
    const down=['ArrowDown','PageDown',' '].includes(event.key)&&!event.shiftKey;
    const up=['ArrowUp','PageUp'].includes(event.key)||(event.key===' '&&event.shiftKey);
    const direction=down?transitionDirection(1):up?transitionDirection(-1):0;
    if(turningPage&&(down||up)){event.preventDefault();return;}
    if(direction){event.preventDefault();void turnPage(direction);}
  });
  listen(window,'touchstart',event=>{
    if(event.touches.length!==1||activeDialog()){touchOrigin=null;return;}
    touchOrigin={x:event.touches[0].clientX,y:event.touches[0].clientY};
  },{passive:true});
  listen(window,'touchmove',event=>{
    if(!touchOrigin||event.touches.length!==1||activeDialog())return;
    const dx=touchOrigin.x-event.touches[0].clientX,dy=touchOrigin.y-event.touches[0].clientY;
    if(Math.abs(dy)<24||Math.abs(dx)>Math.abs(dy))return;
    const direction=transitionDirection(dy);
    if(turningPage||direction){event.preventDefault();if(!turningPage)void turnPage(direction);}
  },{passive:false});
  listen(window,'touchend',()=>{touchOrigin=null;},{passive:true});
  listen(window,'touchcancel',()=>{touchOrigin=null;},{passive:true});
  listen(window,'scroll',()=>{
    clearTimeout(settleTimer);
    if(turningPage||activeDialog())return;
    settleTimer=later(()=>{
      const top=worksTop(),y=window.scrollY;
      if(!turningPage&&!activeDialog()&&y>4&&y<top-4)void turnPage(y>=top/2?1:-1);
    },180);
  },{passive:true});
  document.querySelectorAll('a[href="#works"],a[href="#home"]').forEach(link=>{
    listen(link,'click',async event=>{
      if(event.defaultPrevented||activeDialog()||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const toHome=link.getAttribute('href')==='#home';
      if((toHome&&window.scrollY>4)||(!toHome&&atHome())){
        event.preventDefault();

        void turnPage(toHome?-1:1);
      }
    });
  });
  }
  document.getElementById('year').textContent=new Date().getFullYear();
  siteContent.credits.forEach(c=>{const li=make('li'),link=make('a','',c.author),license=make('a','',c.license);link.href=c.url;license.href=c.licenseUrl;for(const a of [link,license]){a.target='_blank';a.rel='noopener noreferrer';}li.append(make('span','',`${c.title} · `),link,make('span','',' · '),license,make('span','','；已缩放并转为 WebP，页面按版式裁切显示。'));document.getElementById('credits-list').append(li);});
  renderGallery();
};
window.initOnyriaPage();
