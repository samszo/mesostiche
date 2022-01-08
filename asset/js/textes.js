let textes=[], nettoie=true, rdmTexte = true, regleVide = true
, regle = urlParams.has('regle') ?  urlParams.get('regle') : 'MUTATIONS'
, arrSourceTexte = [
    {'label':'J-P Balpe - Centons de Corneille', 'gen':true,'fct':txtFromGen,'params':{'p':'oeu=31&cpt=157948&gen=727029&nb=6'}}
    ,{'label':'J-P Balpe - Poèmes orientaux', 'gen':true,'fct':txtFromGen,'params':{'p':'oeu=37&cpt=171458&gen=727028&nb=6'}}
    ,{'label':'J-P Balpe - Rengas', 'gen':true,'fct':txtFromGen,'params':{'p':'gen=727052'}}        
    ,{'label':'Cantiquest - Chants Joyeux', 'gen':false,'fct':txtFromCsv,'params':{'url':'data/chants-joyeux.csv'}}
    ,{'label':'Cantiquest - Chants de Victoire', 'gen':false,'fct':txtFromJson,'params':{'url':'data/chants-victoire.json'}}
    ,{'label':'Victor Hugo - Contemplations', 'gen':false,'fct':txtFromOmk,'params':{'url':'https://jardindesconnaissances.univ-paris8.fr/poesie/api/items?limit=100&sort_by=random&page=null&resource_class_id=127'}}    

]
, curSource = urlParams.has('source') ?  arrSourceTexte[urlParams.get('source')] : arrSourceTexte[d3.randomInt(0, arrSourceTexte.length)()];
//charge les textes
curSource.fct(curSource);


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

function txtFromOmk(d){
    if(!d)d=curSource
    d3.json(d.params.url).then(function(data) {
        //création des textes
        data.forEach(item=>textes.push(item['o:title'])); 
        nettoie=false;
        rdmTexte=false;
        regleVide=true;            
        creaMeso();
    });   
}

function txtFromGen(d){
    if(!d)d=curSource
    let url = "https://www.balpe.name/generateur/services/api.php?"+d.params.p;
    d3.text(url).then(function(data) {
        //création des textes 
        textes = parsePhrases(data);
        nettoie=false;
        rdmTexte=false;
        regleVide=true;            
        creaMeso();
    });   
}

function parsePhrases(text) {
    let phrases=[], arrT, txts = text.split(/\r\n|\n|\r/);
    txts.forEach(t=>{
        //vérifie si des phrases sont présentes
        if(t.match( /[^\.!\?]+[\.!\?]+/g ))
            //merci à https://stackoverflow.com/questions/11761563/javascript-regexp-for-splitting-text-into-sentences-and-keeping-the-delimiter
            arrT = t.match( /[^\.!\?]+[\.!\?]+/g )
                .map(function(t, i){return t});
        else
            arrT = [t];
        phrases = phrases.concat(arrT);
    });
    return phrases;
}        


function txtFromCsv(e, d){

    //Pour les textes merci à :
    //https://cantiques.yapper.fr/CJ/index.html    
    d3.csv('data/chants-joyeux.csv').then(function(data) {
        //création des textes 
        data.forEach(s=>{
            let st = s.txt;
            if(st!=""){
                textes.push(st);                    
            }
        });
        nettoie=true;
        rdmTexte=true;
        regleVide=false;            
        creaMeso();
    });
}


function txtFromJson(e, d){

    //Pour les textes merci à :
    //https://github.com/arnoldkouya/Chants-de-victoire-JSON    
    d3.json('data/chants-victoire.json').then(function(data) {
        //création des textes 
        data.chants.forEach(c => {
            c.content.forEach(s=>{                    
                let arrS = s.substr(3).split(/\r\n|\n|\r/);
                arrS.forEach(st=>{
                    if(st!=""){
                        textes.push(st)
                    }                            
                })
            })
        });
        nettoie=true;
        rdmTexte=true;
        regleVide=false;            
        creaMeso();
    });   
}


function cleanTexte(s){
    //nettoie le texte
    s = s.replace('(Bis)','');
    s = s.replace('(bis)','');
    s = s.replace('!(bis)','!');
    s = s.replace('»(bis)','');
    s = s.replace('.(bis)','.');
    s = s.replace('(ter)','');
    s = s.replace('{','');
    s = s.replace('}','');
    s = s.replace('«','');
    s = s.replace('»','');
    s = s.replace(', etc.','');

    //déchristianise le cantique
    s = s.replace("Jésus Christ","l'Amour");
    s = s.replace('Jésus',"l'Amour");
    s = s.replace("Christ","l'Amour");
    s = s.replace('Ta croix','ton arbre');
    s = s.replace('de la croix',"d'un arbre");
    s = s.replace('Sauveur',"ami");
    s = s.replace('Le Seigneur',"le bonheur");
    s = s.replace('Seigneur',"bonheur");
    s = s.replace('Croix',"vie");
    s = s.replace('croix',"vie");
    s = s.replace('de Satan',"du triste");
    s = s.replace('Satan',"le triste");
    s = s.replace("l'agneau","l'enfant");
    s = s.replace("l'Agneau","l'enfant");
    s = s.replace("Agneau","enfant");
    s = s.replace("David","lui");
    s = s.replace("mon Dieu","mon pouvoir");
    s = s.replace("Mon Dieu","mon pouvoir");
    s = s.replace("de Dieu","du pouvoir");
    s = s.replace("Dieu","le pouvoir");
    s = s.replace("Divin","joyeux");
    s = s.replace("divin","joyeux");
    s = s.replace("Maître","ami");
    s = s.replace("l'Évangile","le chant");
    s = s.replace("l'évangile","le chant");
    s = s.replace("sacrifié","aimé");
    s = s.replace("“","");
    s = s.replace("”","");
    s = s.replace("Golgotha","ville");
    
            
    return s        
}
