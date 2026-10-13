(() => {
  'use strict';
  if(window.onyriaNavigationInstalled)return;
  window.onyriaNavigationInstalled=true;
  const base=new URL(location.pathname.endsWith('/')?'./':'.',location.href);
  const routes=new Set(['home','landscape','sunset','city','stars']);
  const pages=new Map();
  let revision=0,currentRoute=routeFor(new URL(location.href)),currentURL=location.href;
  const status=document.createElement('div');status.className='site-navigation-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');document.body.append(status);
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  history.replaceState({...history.state,onyriaScroll:[scrollX,scrollY]},'',location.href);
  function routeFor(url){
    if(url.origin!==location.origin||!url.pathname.startsWith(base.pathname))return null;
    const tail=url.pathname.slice(base.pathname.length).replace(/\.html$/,'').replace(/\/$/,'');
    const route=tail===''||tail==='index'?'home':tail;
    return routes.has(route)?route:null;
  }
  function pageFor(route){
    if(pages.has(route))return pages.get(route);
    const url=new URL((route==='home'?'index':route)+'.html',base);
    const promise=fetch(url.href,{credentials:'same-origin'}).then(response=>{
      if(!response.ok)throw new Error('Page unavailable');return response.text();
    });
    pages.set(route,promise);promise.catch(()=>{if(pages.get(route)===promise)pages.delete(route);});return promise;
  }
  window.preloadOnyriaCollection=route=>{if(routes.has(route))void pageFor(route).catch(()=>{});};
  const pageSelectors=['.skip','#header','main','footer','#lightbox','#article-dialog'];
  function replacePage(parsed){
    // Audio and its controls are deliberately outside these page fragments.
    // Replace neither node: currentTime, buffering, volume and playback persist.
    const fragments=pageSelectors.map(selector=>({old:document.querySelector(selector),next:parsed.querySelector(selector)}));
    if(fragments.some(item=>!item.old||!item.next))throw new Error('Incomplete page');
    window.disposeOnyriaHero?.();window.disposeOnyriaPage?.();
    for(const item of fragments)item.old.replaceWith(document.importNode(item.next,true));
    document.body.className=parsed.body.className;
    for(const key of Object.keys(document.body.dataset))delete document.body.dataset[key];
    Object.assign(document.body.dataset,parsed.body.dataset);
    document.title=parsed.title;
    window.initOnyriaPage();window.initOnyriaHero?.();
  }
  function positionPage(url,restore){
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(restore){window.scrollTo({left:restore[0],top:restore[1],behavior:'instant'});return;}
      const target=url.hash&&document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if(target)target.scrollIntoView({behavior:'instant',block:'start'});
      else window.scrollTo({left:0,top:0,behavior:'instant'});
      const main=document.querySelector('main');main.setAttribute('tabindex','-1');main.focus({preventScroll:true});
    }));
  }
  async function navigate(url,{pop=false,restore=null,source=null}={}){
    const route=routeFor(url);if(!route)return;
    const ticket=++revision;
    if(route===currentRoute){currentURL=url.href;status.textContent='';document.body.classList.remove('is-navigating');positionPage(url,restore);return;}
    status.textContent='';document.body.classList.add('is-navigating');
    try{
      const html=await pageFor(route);if(ticket!==revision)return;
      const parsed=new DOMParser().parseFromString(html,'text/html');
      // Validate before touching the current page or the history stack.
      if(pageSelectors.some(selector=>!parsed.querySelector(selector)))throw new Error('Incomplete page');
      if(!pop)history.replaceState({...history.state,onyriaScroll:[scrollX,scrollY]},'',location.href);
      replacePage(parsed);
      if(!pop)history.pushState({onyriaScroll:null},'',url.href);
      currentRoute=route;currentURL=url.href;positionPage(url,restore);
    }catch{
      if(ticket!==revision)return;
      if(pop)history.replaceState({...history.state},'',currentURL);
      status.textContent='页面暂时无法加载，请再点击一次重试。';
    }finally{if(ticket===revision)document.body.classList.remove('is-navigating');}
  }
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest?.('a[href]');
    if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
    const url=new URL(link.href,location.href),route=routeFor(url);
    if(!route)return;
    if(route===currentRoute&&url.pathname===location.pathname)return;
    event.preventDefault();void navigate(url,{source:link});
  });
  window.addEventListener('popstate',event=>void navigate(new URL(location.href),{pop:true,restore:event.state?.onyriaScroll||null}));
  window.addEventListener('hashchange',()=>{if(routeFor(new URL(location.href))===currentRoute)currentURL=location.href;});
})();
