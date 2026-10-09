(() => {
  'use strict';
  const gallery = document.getElementById('gallery');
  const filters = [...document.querySelectorAll('.filter')];
  const lightbox = document.getElementById('lightbox');
  const articleDialog = document.getElementById('article-dialog');
  let currentFilter = 'all', currentIndex = 0, opener = null;
  const isFullRow = photo => photo.featured || photo.width * 9 > photo.height * 16;
  function galleryRows(photos){
    const categories=new Map();
    photos.forEach(photo=>{
      if(!categories.has(photo.category))categories.set(photo.category,[]);
      categories.get(photo.category).push(photo);
    });
    const rows=[];
    for(const group of categories.values()){
      const remaining=[...group.filter(p=>p.featured),...group.filter(p=>!p.featured)];
      while(remaining.length){
        const photo=remaining.shift(),row=[photo];
        if(!isFullRow(photo)){
          const portrait=photo.height>photo.width;
          const partner=remaining.findIndex(p=>!isFullRow(p)&&(p.height>p.width)===portrait);
          if(partner>=0)row.push(remaining.splice(partner,1)[0]);
        }
        rows.push(row);
      }
    }
    return rows;
  }
  const filteredPhotos = () => galleryRows(siteContent.photos.filter(p => currentFilter === 'all' || p.category === currentFilter)).flat();
  const make = (tag, className, text) => { const e = document.createElement(tag); if(className)e.className=className; if(text !== undefined)e.textContent=text; return e; };
  const lock = () => document.body.classList.add('modal-open');
  const unlock = () => {document.body.classList.remove('modal-open');if(opener?.isConnected)opener.focus();};
  function renderGallery(){
    gallery.replaceChildren();
    const photos = filteredPhotos();
    galleryRows(photos).forEach((row,rowIndex) => row.forEach((photo,columnIndex) => {
      const figure = make('figure','photo-card');
      if(photo.featured)figure.classList.add('photo-featured');
      if(isFullRow(photo))figure.classList.add('photo-panorama');
      if(photo.height>photo.width)figure.classList.add('photo-portrait');
      figure.style.gridRow=String(rowIndex+1);
      figure.style.gridColumn=isFullRow(photo)?'1 / -1':String(columnIndex+1);
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
      gallery.append(figure);
    }));
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
  filters.forEach(button=>button.addEventListener('click',()=>{currentFilter=button.dataset.filter;filters.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});renderGallery();
    const sectionButton=document.querySelector('#works .section-toggle-control');
    if(sectionButton.getAttribute('aria-expanded')==='false')sectionButton.click();
    const toolbar=document.querySelector('.works-toolbar');
    const content=document.getElementById('works-content');
    const top=window.scrollY+content.getBoundingClientRect().top-76-toolbar.offsetHeight-24;
    window.scrollTo({top:Math.max(0,top),behavior:'smooth'});
  }));
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
  siteContent.credits.forEach(c=>{const li=make('li'),link=make('a','',c.author),license=make('a','',c.license);link.href=c.url;license.href=c.licenseUrl;for(const a of [link,license]){a.target='_blank';a.rel='noopener noreferrer';}li.append(make('span','',`${c.title} · `),link,make('span','',' · '),license,make('span','','；已缩放并转为 WebP，页面按版式裁切显示。'));document.getElementById('credits-list').append(li);});
  document.querySelectorAll('.section-toggle-control').forEach(button=>{
    button.addEventListener('click',()=>{
      const content=document.getElementById(button.getAttribute('aria-controls'));
      const heading=button.closest('.section-toggle');
      const before=heading.getBoundingClientRect().top;
      const expanded=button.getAttribute('aria-expanded')==='true';
      content.hidden=expanded;
      button.setAttribute('aria-expanded',String(!expanded));
      button.setAttribute('aria-label',`${expanded?'展开':'收起'}${button.dataset.sectionLabel}栏目`);
      heading.classList.toggle('is-collapsed',expanded);
      if(expanded){
        const after=heading.getBoundingClientRect().top;
        window.scrollBy({top:after-before,behavior:'instant'});
      }
    });
  });
  document.querySelectorAll('a[href="#works"],a[href="#journal"],a[href="#about"]').forEach(link=>{
    link.addEventListener('click',()=>{
      const section=document.querySelector(link.getAttribute('href'));
      const button=section?.querySelector('.section-toggle-control');
      if(button?.getAttribute('aria-expanded')==='false')button.click();
    });
  });
  renderGallery();
})();
