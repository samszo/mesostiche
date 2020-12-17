class mesostiche {
    constructor(params) {
        var me = this;
        this.idCont = params.idCont;
        this.cont = d3.select("#"+params.idCont);
        this.anime = params.anime ? params.anime : false;
        this.regle = params.regle ? params.regle : "ARCANES";
        this.textes = params.textes ? params.textes : [
            ["arts", "recherche", "communications", "artifices", "numériques", "espaces", "sociaux"]
            ,["magies", "artifices", "beautés chaotiques", "espoir magnifiques", "envies", "alchimie scientifique", "médiations sociales"]
        ];
        this.fontFileName = params.fontFileName ? params.fontFileName : 'asset/fonts/FiraSansMedium.woff';        
        this.fontFamily = params.fontFamily ? params.fontFamily : "sans-serif";
        this.regleColor = params.regleColor ? params.regleColor : "red";
        this.txtColor = params.txtColor ? params.txtColor : "black";
        this.width = params.width ? params.width : 300;
        this.height = params.height ? params.height : 300;
        this.duree = params.duree ? params.duree : 10;//en seconde
        this.boutons = params.boutons ? params.boutons : true;
        this.fctEnd = params.fctEnd ? params.fctEnd : false;
        this.fctPause = params.fctPause ? params.fctPause : false;
        this.fctChange = params.fctChange ? params.fctChange : false;
        this.f;
        var svg, global, color, bar, bbox, animations, tl, rangeTime, fontSize=20
            ,btnPause, btnPlay, btnReload, bPause = false, chars
            , regle, arrG=[], arrD=[], txtG, txtD, pathG, pathD
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
                arrG[j]=[];
                arrD[j]=[];
                chars.forEach((t,i)=>{
                    y=i;                    
                    if(i>=txts.length)y=(i % txts.length);
                    let f = getIndicesOf(t,txts[y],false);
                    //prend en compte le caractère le plus au centre
                    if(f.length){
                        let idx = Math.trunc(f.length/2);
                        arrG[j].push(txts[y].substring(0,f[idx]));
                        arrD[j].push(txts[y].substring(f[idx]+1));
                    }else{
                        arrG[j].push("");
                        arrD[j].push("");
                        arrD[j][i-1]+=" "+txts[y];
                    }    
                })
            })

            let bb;
            if(me.anime){
                chars.forEach((c,i)=>{
                     bb = d3.select('#'+me.idCont+'svgMstchRegle'+i).node().getBBox();
                     alterneTexte(arrG,0,i,bb.x,bb.y+bb.height-parseInt(fontSize*0.8),'gauche');
                     alterneTexte(arrD,0,i,bb.x+bb.width,bb.y+bb.height-parseInt(fontSize*0.8),'droite');
                })
            }else{
                //ajoute les textes à gauche
                let idDim = 1;
                txtG = global.selectAll('.txtG').data(arrG[idDim]).enter().append("text")
                    .attr("id", me.idCont+'svgMstchTxtG')
                    .attr("class", 'txtG')
                    .attr("x",(me.width/2)-margin)
                    .attr("y",(d,i)=>(fontSize*(i+1))+margin)
                    .attr("text-anchor", "end")
                    .attr("font-family", me.fontFamily)
                    .attr("font-size", parseInt(fontSize*0.8)+"px")
                    .attr("fill", me.txtColor)
                    .text(d=>d);
                //ajoute les textes à droite
                txtD = global.selectAll('.txtD').data(arrD[idDim]).enter().append("text")
                    .attr("id", me.idCont+'svgMstchTxtD')
                    .attr("class", 'txtD')
                    .attr("x",(me.width/2)+margin)
                    .attr("y",(d,i)=>(fontSize*(i+1))+margin)
                    .attr("text-anchor", "start")
                    .attr("font-family", me.fontFamily)
                    .attr("font-size", parseInt(fontSize*0.8)+"px")
                    .attr("fill", me.txtColor)
                    .text(d=>d);
            }

            //redimensionne le svg
            bb = global.node().getBBox();
            svg.attr('viewBox',bb.x+' '+bb.y+' '+' '+bb.width+' '+bb.height);
              
        }


        function alterneTexte(arrTxt, dim, num, x, y, col){
            global.select('#gTxtPath'+col+dim+num).remove();
            let txt = arrTxt[dim][num];
            //if(txt)
            getSvgTxtPath(txt, x, y, col, dim, num);
    
            let animation = anime.timeline({
                targets: '#gTxtPath'+col+dim+num+' .line-drawing',
                delay: function(el, i) { return i * 250 },
                duration: 6000,
                easing: 'easeInOutSine',
                }).add({
                    strokeDashoffset: [anime.setDashoffset, 0],
                }).add({
                    strokeDashoffset: [0, anime.setDashoffset],
            });
    
            animation.finished.then(function(){
                if(num>=arrTxt[dim].length-1){
                    if(dim>=arrTxt.length-1) dim=0; else dim++;
                    num=0; 
                } else num++;
                alterneTexte(arrTxt, dim, num, x, y, col);
            });    
        }
    
        function getSvgTxtPath(txt, x, y, col, dim, num){
    
            let glyphs = me.f.stringToGlyphs(txt);
            let gCaracts = global.append('g').attr('id','gTxtPath'+col+dim+num);
            let xG = 0, bb, moveX, moveY;
            glyphs.forEach(g => {
                let fp = g.getPath(0,0,parseInt(fontSize*0.8));
                let d = fp.toPathData();
                let p = gCaracts.append('path')
                .attr('class','line-drawing')
                .attr('fill',"none")
                .attr('fill-rule',"evenodd")
                .attr('stroke',"black")
                .attr('stroke-width',"1")
                .attr('transform','translate('+(xG)+','+(0)+')')
                .attr('d',d);
                //bb = g.getBoundingBox();
                //bb = fp.getBoundingBox();
                bb = p.node().getBBox();
                xG+=bb.width+3;            
            });
            bb = gCaracts.node().getBBox();
            moveY = -bb.y+y;
            if(col=='gauche'){
                moveX = -bb.x-bb.width+x;
            }
            if(col=='droite'){
                moveX = -bb.x+x;
            }
            gCaracts.attr('transform','translate('+moveX+','+moveY+')')
    
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
