class mesostiche {
    constructor(params) {
        var me = this;
        this.idCont = params.idCont;
        this.cont = d3.select("#"+params.idCont);
        this.anime = params.anime ? params.anime : false;
        this.regle = params.regle ? params.regle : "ARCANES";
        this.textes = params.textes ? params.textes : [
            ["a la mer", "il y a des pêcheurs", "qui chassent du bon poisson", "et des coquillages magnifiques", "bons pour la santé", "et sublimes pour le goût", "vive les pêcheurs"]
            //,["arts", "recherche", "communications", "artifices", "numériques", "espaces", "sociaux"]
            //,["magies", "artifices", "beautés chaotiques", "espoir magnifiques", "envies", "alchimie scientifique", "médiations sociales"]
        ];
        this.fontFileName = params.fontFileName ? params.fontFileName : 'asset/fonts/FiraSansMedium.woff';        
        this.fontFamily = params.fontFamily ? params.fontFamily : "sans-serif";
        this.regleColor = params.regleColor ? params.regleColor : "red";
        this.txtColor = params.txtColor ? params.txtColor : "black";
        this.width = params.width ? params.width : 300;
        this.height = params.height ? params.height : 300;
        this.duree = params.duree ? params.duree : 1;//en seconde
        this.boutons = params.boutons ? params.boutons : true;
        this.fctEnd = params.fctEnd ? params.fctEnd : false;
        this.fctPause = params.fctPause ? params.fctPause : false;
        this.fctChange = params.fctChange ? params.fctChange : false;
        this.f;
        var svg, global, color, bbox, tl, rangeTime, rapportFont=0.8, fontSize=20, fontSizeRedim=fontSize*rapportFont
            , btnPause, btnPlay, btnReload, bPause = false, chars
            , regle, arrTextes=[], curdim
            , margin=6;            

        this.init = function () {
            
            rangeTime = d3.scaleLinear().domain([0,100]).range([0,me.duree]);
            color = d3.scaleSequential().domain([1,100])
                .interpolator(d3.interpolateTurbo);//d3.interpolateWarm
        
            svg = this.cont.append("svg")
                .attr("id", me.idCont+'svgMstch')
                .attr("width",me.width+'px').attr("height", me.height+'px')
                .style("margin",margin+"px");            
            bbox = me.cont.node().getBoundingClientRect();
            global = svg.append("g").attr("id",me.idCont+'svgMstchGlobal');

            //construction de la règle
            chars = me.regle.split('');
            regle = global.append('g')
                .attr("id",me.idCont+'svgMstchRegle');
            regle.selectAll('.regle').data(chars).enter().append("text")
                .attr("id", (d,i) => me.idCont+'svgMstchRegle'+i)
                .attr("class", 'regle')
                .attr("x",me.width/2)
                .attr("y",(d,i)=>(fontSize*(i+1))+margin)
                .attr("text-anchor", "middle")
                .attr("font-family", me.fontFamily)
                .attr("font-size", fontSize+"px")
                .attr("fill", me.regleColor)
                .text(d=>d);

            //construction des textes à gauche et droite
            let y=0            
            me.textes.forEach((txts,j)=>{
                arrTextes[j]=[];
                chars.forEach((t,i)=>{
                    y=i;                    
                    if(i>=txts.length)y=(i % txts.length);
                    let f = getIndicesOf(t,txts[y],false);
                    //prend en compte le caractère le plus au centre
                    if(f.length){
                        let idx = Math.trunc(f.length/2);
                        arrTextes[j].push({'text':txts[y].substring(0,f[idx]),'ordre':i,'type':'gauche'});
                        arrTextes[j].push({'text':txts[y].substring(f[idx]+1),'ordre':i,'type':'droite'});
                    }else{
                        arrTextes[j][i-1]['txt']+=" "+txts[y];
                        arrTextes[j].push({'text':"",'ordre':i,'type':'gauche'});
                        arrTextes[j].push({'text':"",'ordre':i,'type':'droite'});
                    }    
                })
            })

            let bb;
            if(me.anime){
                //construction des paths et des positions
                arrTextes.forEach(txts=>{
                    txts.forEach((txt)=>{
                        bb = d3.select('#'+me.idCont+'svgMstchRegle'+txt.ordre).node().getBBox();
                        txt.paths = getTxtPath(txt.text);
                        txt.rbb = bb;
                    })
                })
                //ajoute les path de la première dimension
                curdim = 0;
                drawSvgTxtPath();
                //lancement des animations
                alterneTexte();
            }else{
                //ajoute les textes à gauche
                let idDim = 1;
                svgText = global.selectAll('.svgMstchTxt').data(arrTextes[idDim]).enter().append("text")
                    .attr("id",(d,i)=>me.idCont+'svgMstchTxt'+i)
                    .attr("class", 'MstchTxt')
                    .attr("x",d=> d.type=='gauche' ? (me.width/2)-margin : (me.width/2)+margin)
                    .attr("y",d=> (fontSize*(d.ordre+1))+margin)
                    .attr("text-anchor", d=>d.type=='gauche' ? "end" : "start")
                    .attr("font-family", me.fontFamily)
                    .attr("font-size", fontSizeRedim+"px")
                    .attr("fill", me.txtColor)
                    .text(d=>d.text);                
            }

            //redimensionne le svg
            bb = global.node().getBBox();
            svg.attr('viewBox',bb.x+' '+bb.y+' '+' '+bb.width+' '+bb.height);
              
        }

        function drawSvgTxtPath(){

            global.select('#gTextes').remove();
            let gTextes = global.append('g').attr('id','gTextes');
            let gTxt = gTextes.selectAll('g').data(arrTextes[curdim]).enter().append('g')
                .attr('id',(d,i)=>'gTxt'+i);
            let gCaracts = gTxt.selectAll('path').data(d=>d.paths).enter().append('path')
                .attr('class','line-drawing')
                .attr('fill',"none")
                .attr('fill-rule',"evenodd")
                .attr('stroke',"black")
                .attr('stroke-width',"1")
                .attr('d',d=>d.d)
                .attr('transform',d=>{
                    let t = 'translate('+(d.gX)+','+(0)+')';
                    return t;
                });
            //positionne les textes
            gTxt.attr('transform',(d,i)=>{
                let bb = d3.select('#gTxt'+i).node().getBBox()
                , moveY = d.rbb.y+(d.rbb.height*rapportFont)//sur la ligne de la lettre règle
                , moveX = d.type=='gauche' ? -bb.x-bb.width+d.rbb.x : -bb.x+d.rbb.x+d.rbb.width
                , t = 'translate('+moveX+','+moveY+')';
               return t;
            })
        }
    
        function getTxtPath(txt){
    
            let glyphs = me.f.stringToGlyphs(txt)
                , paths = []
                , gX=0;
            glyphs.forEach(g => {
                let fp = g.getPath(0,0,fontSizeRedim)
                , bb = fp.getBoundingBox();
                if(g.name=="space"){
                    paths.push({'d':"M 0,0 H "+me.margin, 'gX':gX ,'bb':bb});
                    gX+=margin;          
                }else{
                    paths.push({'d':fp.toPathData(), 'gX':gX ,'bb':bb});
                    gX+=bb.x1+bb.x2;          
                }
            });
            return paths;
        }

        function alterneTexte(){
    
            let animation = anime.timeline({
                targets: '.line-drawing',
                delay: function(el, i) { return i * 250 },
                duration: me.duree*1000/arrTextes.length,//durée par texte
                easing: 'easeInOutSine',
                }).add({
                    strokeDashoffset: [anime.setDashoffset, 0],
                }).add({
                    strokeDashoffset: [0, anime.setDashoffset],
            });
    
            animation.finished.then(function(){
                curdim = curdim<arrTextes.length-1 ? curdim+1 : 0;
                drawSvgTxtPath(curdim);
                alterneTexte();
            });    
        }

        //merci à https://stackoverflow.com/questions/3410464/how-to-find-indices-of-all-occurrences-of-one-string-in-another-in-javascript/3410557#3410557
        function getIndicesOf(searchStr, str, caseSensitive) {
            var searchStrLen = searchStr.length;
            if (searchStrLen == 0) {
                return [];
            }
            var startIndex = 0, index, indices = [];
            if (!caseSensitive) {
                str = str.toLowerCase();
                searchStr = searchStr.toLowerCase();
            }
            while ((index = str.indexOf(searchStr, startIndex)) > -1) {
                indices.push(index);
                startIndex = index + searchStrLen;
            }
            return indices;
        }

        this.pause = function(){
            tl.pause();
            bPause = true
            btnPause.attr('visibility','hidden');
            btnReload.attr('visibility','visible');
            btnPlay.attr('visibility','visible');

        }

        this.start = function(){
            if(!bPause){
                tl.play();
                if(me.boutons){
                    btnPause.attr('visibility','visible');
                    btnReload.attr('visibility','hidden');
                    btnPlay.attr('visibility','hidden');           
                }
    
            }
        }

        this.restart = function(){
            tl.restart();
        }
  
        this.hide = function(){
          svg.attr('visibility',"hidden");
        }
        this.show = function(){
          svg.attr('visibility',"visible");
        }

        if(me.anime){
            //charge la police 
            opentype.load(me.fontFileName, function(err, font) {
                if (err) {
                    console.error(err.toString());
                    return;
                }
                me.f = font
                me.init();
            });        
        }else me.init();

    }
}
