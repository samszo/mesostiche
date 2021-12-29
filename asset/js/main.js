const urlParams = new URLSearchParams(window.location.search)
, idCont = 'mesostiche'
, w = urlParams.has('w') ?  urlParams.get('w') : 100
, h = urlParams.has('h') ?  urlParams.get('h') : 100;
let arrAnim = [],meso;

function getAleaTextes(){
    //mélange les textes
    let aleaTexte = [];
    for (let i = 0; i < 99; i++) {
        let aleaStrophe = [];
        for (let j = 0; j < regle.length; j++) {
            //pour ne pas avoir de texte vide
            let s = "";
            let z=0;//pour ne pas boucler infiniement
            while(s==""){
                if(rdmTexte){
                    let idxText = d3.randomInt(0, textes.length)();
                    s = textes[idxText];
                }else{
                    s = textes[i];
                    i++;
                }
                //nettoie le texte
                if(nettoie && s)s=cleanTexte(s);
                if(!regleVide){
                    //vérifie la présence de la règle
                    if(s.toLowerCase().indexOf(regle.substr(j,1).toLowerCase())<=0)s="";
                    z++;
                    if(z>1000)s=" ";
                }
            }
            aleaStrophe.push(s);

        }
        aleaTexte.push(aleaStrophe)
    }
    return aleaTexte;
}