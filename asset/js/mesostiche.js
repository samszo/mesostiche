class mesostiche {
    constructor(params) {
        var me = this;
        this.idCont = params.idCont;
        this.cont = d3.select("#"+params.idCont);
        this.anime = params.anime ? params.anime : false;
        this.regle = params.regle ? params.regle : "MESOSTICHES";
        this.textes = params.textes ? params.textes : [
            ["Il y a des mots", "à travers", "les lettres", "qui osent", "des significations", "souvent improbables", "mais","au combien","charmantes","et","pitoresques"]
        ];
        this.fontFileName = params.fontFileName ? params.fontFileName : 'asset/fonts/FiraSansMedium.woff';        
        this.fontFamily = params.fontFamily ? params.fontFamily : "sans-serif";
        this.regleColor = params.regleColor ? params.regleColor : "red";
        this.txtColor = params.txtColor ? params.txtColor : "black";
        this.width = params.width ? params.width : this.cont.node().offsetWidth;
        this.height = params.height ? params.height : this.cont.node().offsetHeight;
        this.duree = params.duree ? params.duree : 1;//en seconde
        this.delais = params.delais ? params.delais : 250;//en milliseseconde
        this.boutons = params.boutons ? params.boutons : false;
        this.fctEnd = params.fctEnd ? params.fctEnd : false;
        this.fctPause = params.fctPause ? params.fctPause : false;
        this.fctChange = params.fctChange ? params.fctChange : false;
        this.fctClickRegle = params.fctClickRegle ? params.fctClickRegle : pauseChangeText;
        this.interpolateColor = params.interpolateColor ? params.interpolateColor : d3.interpolateTurbo;
        this.f;
        var svg, global
            , color = d3.scaleSequential().domain([1,100])
                .interpolator(me.interpolateColor)//d3.interpolateWarm
            , aleaColor = d3.randomUniform(0, 100)
            , contbbox, tl
            , rangeTime =d3.scaleLinear().domain([0,100]).range([0,me.duree])
            , rapportFont=0.8, fontSize=20, fontSizeRedim=fontSize*rapportFont
            , btnPause, btnPlay, btnReload, bPause = false, chars=[]
            , regle, arrTextes=[], arrTextesSelect=[], curdim
            , margin=6;            

        this.init = function () {
            
            svg = this.cont.append("svg")
                .attr("id", me.idCont+'svgMstch')
                .attr("width",me.width+'px').attr("height", me.height+'px')
                .style("margin",margin+"px");            
            contbbox = me.cont.node().getBoundingClientRect();
            global = svg.append("g").attr("id",me.idCont+'svgMstchGlobal');

            //construction de la règle
            me.regle.split('').forEach((t,i)=>chars.push({'t':t,'i':i}));
            regle = global.append('g')
                .attr("id",me.idCont+'svgMstchRegle');
            
            //affiche la règle
            regle.selectAll('.regle').data(chars).enter().append("text")
                .attr("id", (d,i) => me.idCont+'svgMstchRegle'+i)
                .attr("class", 'regle')
                .attr("x",(me.width/2))
                .attr("y",(d,i)=>(fontSize*(i+1))+margin)
                .attr("text-anchor", "middle")
                .attr("font-family", me.fontFamily)
                .attr("font-size", fontSize+"px")
                .attr("fill",d=> me.regleColor == "alea" ? color(aleaColor()) : me.regleColor)
                .text(d=>d.t==" " ? '\u00A0' : d.t)
                .style('cursor',me.boutons ? 'pointer' : 'none')
                .on('click',me.fctClickRegle);
            //calcule la place des lettre de la règle
            chars.forEach((c,i)=>c.bb=d3.select('#'+me.idCont+'svgMstchRegle'+i).node().getBBox())
            //création d'une ligne pour gérer la sélection
            if(me.boutons){
                regle.selectAll('.regleSelect').data(chars).enter().append("path")
                    .attr("id", (d,i) => me.idCont+'svgMstchRegleSelect'+i)
                    .attr("class", 'regleSelect')
                    .attr("d",d=>"M "+(d.bb.x)+","+(d.bb.y+d.bb.height-(margin/2))+" "+(d.bb.x+d.bb.width)+","+(d.bb.y+d.bb.height-(margin/2)))
                    .attr("fill",'none')
                    .attr("stroke-width",1)
                    .attr("stroke-dasharray","0.5,0.5")
                    .attr("stroke-opacity",0)                    
                    .attr("stroke-linecap","butt")
                    .attr("stroke-linejoin","miter")
                    .attr("stroke-miterlimit","4")
                    .attr("stroke-dashoffset","0")
                    .attr("stroke",d=> me.regleColor == "alea" ? color(aleaColor()) : me.regleColor);
            }


            //construction des textes à gauche et droite
            let y=0            
            me.textes.forEach((txts,j)=>{
                arrTextes[j]=[];
                chars.forEach((t,i)=>{
                    y=i;                    
                    if(i>=txts.length)y=(i % txts.length);
                    let f = txts[y] ? getIndicesOf(t.t,txts[y],false) : "";
                    //prend en compte le caractère le plus au centre
                    if(f.length){
                        let idx = Math.trunc(f.length/2);
                        arrTextes[j].push({'text':txts[y].substring(0,f[idx]),'ordre':i,'type':'gauche'});
                        arrTextes[j].push({'text':txts[y].substring(f[idx]+1),'ordre':i,'type':'droite'});
                    }else{
                        /*pour forcer l'écriture du texte
                        if(i>0){
                            arrTextes[j][i-1]['text']+=" "+txts[y];
                            arrTextes[j].push({'text':"",'ordre':i,'type':'droite'});
                        }else{
                            arrTextes[j].push({'text':" "+txts[y],'ordre':i,'type':'droite'});
                        }*/
                        arrTextes[j].push({'text':"",'ordre':i,'type':'droite'});
                        arrTextes[j].push({'text':"",'ordre':i,'type':'gauche'});
                    }    
                })
            })

            let bb;
            if(me.anime){
                //construction des paths et des positions
                arrTextes.forEach(txts=>{
                    txts.forEach((txt)=>{
                        //bb = d3.select('#'+me.idCont+'svgMstchRegle'+txt.ordre).node().getBBox();
                        txt.paths = getTxtPath(txt.text);
                        txt.rbb = chars[txt.ordre].bb;
                    })
                })
                //ajoute les path de la première dimension
                curdim = 0;
                drawSvgTxtPath();
                //lancement des animations
                alterneTexte();
                if(me.regleColor == "alea")changeColorRegle();
                if(me.txtColor == "alea")changeColorTxt();
            }else{
                curdim = 0;
                drawTxtStatique(curdim)
            }

              
        }

        function pauseChangeText(e,d){
            if(!me.boutons)return;
            let strophes = arrTextes[curdim].filter(s=>s.ordre==d.i);
            arrTextes[curdim].forEach((s,i)=>{
                if(s.ordre==d.i){
                    if(arrTextesSelect[i]){
                        arrTextesSelect[i]=false;
                        s.paths.forEach(p=>p.class=me.idCont+'line-drawing');
                        d3.select('#'+me.idCont+'svgMstchRegleSelect'+s.ordre).attr("stroke-opacity",0);                    
                    }else{
                        s.paths.forEach(p=>p.class=me.idCont+'pause');
                        d3.select('#'+me.idCont+'svgMstchRegleSelect'+s.ordre).attr("stroke-opacity",1);                    
                        arrTextesSelect[i]=s;        
                    }
                }
            });
        }

        function drawTxtStatique(dim){
            global.selectAll('.svgMstchTxt').data(arrTextes[dim]).enter().append("text")
                .attr("id",(d,i)=>me.idCont+'svgMstchTxt'+i)
                .attr("class", 'MstchTxt')
                .attr("x",d=> d.type=='gauche' ? (me.width/2)-margin : (me.width/2)+margin)
                .attr("y",d=> (fontSize*(d.ordre+1))+margin)
                .attr("text-anchor", d=>d.type=='gauche' ? "end" : "start")
                .attr("font-family", me.fontFamily)
                .attr("font-size", fontSizeRedim+"px")
                .attr("fill",(d)=> me.txtColor == "alea" ? color(aleaColor()) : me.txtColor)
                .text(d=>d.text);                
            //redimensionne le svg
            let bb = global.node().getBBox();
            svg.attr('viewBox',(bb.x-margin)+' '+(bb.y-margin)+' '+' '+(bb.width+margin+(margin*2))+' '+(bb.height+(margin*2)));

        }

        function drawSvgTxtPath(){

            global.select('#gTextes').remove();
            let gTextes = global.append('g').attr('id','gTextes');
            let gTxt = gTextes.selectAll('g').data(arrTextes[curdim]).enter().append('g')
                .attr('id',(d,i)=>me.idCont+'gTxt'+i);
            let gCaracts = gTxt.selectAll('path')
                .data((d,i)=>{
                    return arrTextesSelect[i] ? arrTextesSelect[i].paths : d.paths
                })
                .enter().append('path')
                .attr('class',d=>d.class)
                .attr('fill',"none")
                .attr('fill-rule',"evenodd")
                .attr("stroke",(d)=> {
                    let c = me.txtColor == "alea" ? color(aleaColor()) : me.txtColor;
                    if(d.space)c='none';
                    return c;
                })
                .attr('stroke-width',"1")
                .attr('d',(d,i)=> {
                    return d.d;
                })
                .attr('transform',(d,i)=>{
                    let gX = d.gX;
                    let t = 'translate('+(gX)+','+(0)+')';
                    return t;
                });
            //positionne les textes
            gTxt.attr('transform',(d,i)=>{
                let bb = d3.select('#'+me.idCont+'gTxt'+i).node().getBBox()
                , moveY = d.rbb.y+(d.rbb.height*rapportFont)//sur la ligne de la lettre règle
                , moveX = d.type=='gauche' ? -bb.x-bb.width+d.rbb.x : -bb.x+d.rbb.x+d.rbb.width
                , t = 'translate('+moveX+','+moveY+')';
               return t;
            })
            //redimensionne le svg
            let bb = global.node().getBBox();
            svg.attr('viewBox',(bb.x-margin)+' '+(bb.y-margin)+' '+' '+(bb.width+(margin*3))+' '+(bb.height+(margin*3)));
            if(me.fctEnd)me.fctEnd();
        }
    
        function getTxtPath(txt){
    
            let glyphs = me.f.stringToGlyphs(txt)
                , paths = []
                , gX=0;
            glyphs.forEach(g => {
                let fp = g.getPath(0,0,fontSizeRedim)
                , bb = fp.getBoundingBox();
                if(g.name=="space"){
                    paths.push({'space':true,'d':"M 0,0 H "+margin, 'gX':gX ,'bb':bb, 'class':me.idCont+'space'});
                    gX+=margin;
                }else{
                    paths.push({'space':false,'d':fp.toPathData(), 'gX':gX ,'bb':bb, 'class':me.idCont+'line-drawing'});
                    gX+=bb.x1+bb.x2;          
                }
            });
            return paths;
        }

        function alterneTexte(){
    
            let animation = anime.timeline({
                targets: '.'+me.idCont+'line-drawing',
                delay: function(el, i) { return i * me.delais },
                duration: me.duree*1000,//durée par texte /arrTextes.length
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

        function changeColorRegle(){
    
            let animation = anime({
                targets: '#'+me.idCont+'svgMstchRegle .regle',
                loop: true,
                duration: me.duree*1000,//durée par texte,*arrTextes.length
                easing: 'easeInOutSine',
                fill: {
                    value: function () {
                        let c1 = color(aleaColor());
                        let c2 = color(aleaColor());
                        return [c1, c2];
                    },
                },
                //opacity: [0, 1],
                direction: 'alternate'
            });
        }

        function changeColorTxt(){
    
            let animation = anime({
                targets: '.'+me.idCont+'line-drawing',
                loop: true,
                duration: me.duree*1000,//durée par texte,
                easing: 'easeInOutSine',
                stroke: {
                    value: function () {
                        let c1 = color(aleaColor());
                        let c2 = color(aleaColor());
                        return [c1, c2];
                    },
                },
                //opacity: [0, 1],
                direction: 'alternate'
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
