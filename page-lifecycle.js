(() => {
  'use strict';
  window.createOnyriaScope = () => {
    const controller = new AbortController(), timers = new Set(), animations = new Set(), cleanups = [];
    return {
      get disposed(){return controller.signal.aborted;},
      listen(target,type,listener,options = {}){
        if (!target) return;
        target.addEventListener(type,listener,{...(typeof options === 'boolean' ? {capture:options} : options),signal:controller.signal});
      },
      later(fn,delay){const id=setTimeout(()=>{timers.delete(id);if(!controller.signal.aborted)fn();},delay);timers.add(id);return id;},
      animate(target,frames,options){const animation=target.animate(frames,options);animations.add(animation);animation.finished.then(()=>animations.delete(animation),()=>animations.delete(animation));return animation;},
      cleanup(fn){cleanups.push(fn);},
      dispose(){controller.abort();timers.forEach(clearTimeout);animations.forEach(a=>a.cancel());cleanups.forEach(fn=>fn());}
    };
  };
})();
