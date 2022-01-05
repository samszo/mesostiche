const urlParams = new URLSearchParams(window.location.search)
, idCont = 'mesostiche'
, w = urlParams.has('w') ?  urlParams.get('w') : 100
, h = urlParams.has('h') ?  urlParams.get('h') : 100;
let arrAnim = [],meso;

