class mesostiche {
    constructor(params) {
        var me = this;
        this.idCont = params.idCont;
        this.cont = d3.select("#"+params.idCont);
        this.regle = params.regle ? params.regle : "Lucky Semiosis";
        this.textes = params.textes ? params.textes : ["Lucky Semiosis","joue aux dès","avec des chances"];
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
        var svg, global, color, bar, bbox, animation, tl, rangeTime, fontSize=20
            ,btnPause, btnPlay, btnReload, bPause = false, chars, regle, txtG, txtD, arrG=[], arrD=[]
            , margin=6;            

        this.init = function () {
            
            rangeTime = d3.scaleLinear().domain([0,100]).range([0,me.duree]);
            color = d3.scaleSequential().domain([1,100])
                .interpolator(d3.interpolateTurbo);//d3.interpolateWarm
        
            svg = this.cont.append("svg")
                .attr("id", me.idCont+'svgMstch')
                .attr("width",me.width).attr("height", me.height)
                .style("margin",margin+"px");            
            bbox = me.cont.node().getBoundingClientRect();
            global = svg.append("g").attr("id",me.idCont+'svgMstchGlobal');

            //construction de la règle
            chars = me.regle.split('');
            regle = global.selectAll('.regle').data(chars).enter().append("text")
                .attr("id", me.idCont+'svgMstchRegle')
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
            chars.forEach((t,i)=>{
                y=i;
                if(i>=me.textes.length)y=(i % me.textes.length);
                let f = getIndicesOf(t,me.textes[y],false);
                //prend en compte le caractère le plus au centre
                if(f.length){
                    let idx = Math.trunc(f.length/2);
                    arrG.push(me.textes[y].substring(0,f[idx]));
                    arrD.push(me.textes[y].substring(f[idx]+1));
                }else{
                    arrG.push("");
                    arrD.push("");
                    arrD[i-1]+=" "+me.textes[y];
                }
            })
            //ajoute les textes à gauche
            txtG = global.selectAll('.txtG').data(arrG).enter().append("text")
                .attr("id", me.idCont+'svgMstchTxtG')
                .attr("class", 'txtG')
                .attr("x",(me.width/2)-margin)
                .attr("y",(d,i)=>(fontSize*(i+1))+margin)
                .attr("text-anchor", "end")
                .attr("font-family", me.fontFamily)
                .attr("font-size", (fontSize*0.8)+"px")
                .attr("fill", me.txtColor)
                .text(d=>d);
            //ajoute les textes à droite
            txtD = global.selectAll('.txtD').data(arrD).enter().append("text")
                .attr("id", me.idCont+'svgMstchTxtD')
                .attr("class", 'txtD')
                .attr("x",(me.width/2)+margin)
                .attr("y",(d,i)=>(fontSize*(i+1))+margin)
                .attr("text-anchor", "start")
                .attr("font-family", me.fontFamily)
                .attr("font-size", (fontSize*0.8)+"px")
                .attr("fill", me.txtColor)
                .text(d=>d);


            /*construction de l'animation    
            tl = anime.timeline({
                duration: me.duree*1000,
                easing: 'easeInOutSine',
                update: function(anim) {
                    let progress = Math.round(tl.progress);
                    txt.text(Math.round(me.duree-rangeTime(progress)) + ' s');
                    bar.attr('fill',color(progress))
                },
                begin: function(anim) {
                    txt.text(me.duree+' s');
                    //txt.attr('x','0');
                    //bar.attr('x','0');
                },
                complete: function(anim) {
                    if(me.fctEnd)me.fctEnd();
                }
            });
            tl.add({
                targets: ['#'+me.idCont+'svgPBglobal'],
                translateX: bbox.width,
                })

            //construction des boutons
            if(me.boutons){
                let btns = global.append("g")
                    .attr("id", me.idCont+'svgPBbtns');
                btnPause = btns.append("g")
                    .style('cursor','pointer')                
                    .on('click',function(){me.pause()});                
                btnPause.append("rect")
                    .attr("id", me.idCont+'svgPBrect')
                    .attr("x", 3)
                    .attr("y", 2)
                    .attr("rx", 1)
                    .attr("ry", 1)
                    .attr("height", 16)
                    .attr("width", 6)
                    .attr("fill", 'black');            
                btnPause.append("rect")
                    .attr("id", me.idCont+'svgPBrect')
                    .attr("x", 11)
                    .attr("y", 2)
                    .attr("rx", 1)
                    .attr("ry", 1)
                    .attr("height", 16)
                    .attr("width", 6)
                    .attr("fill", 'black');
                btnPlay = btns.append('path')
                    .attr('fill-rule',"evenodd")
                    .style('cursor','pointer')                
                    .attr('d',"M16.75 10.83L4.55 19A1 1 0 0 1 3 18.13V1.87A1 1 0 0 1 4.55 1l12.2 8.13a1 1 0 0 1 0 1.7z")
                    .on('click',function(){bPause=false;me.start()});                
                btnReload = btns.append("g")
                    .style('cursor','pointer')                
                    .attr('transform','translate('+(me.width-20)+')')                
                    .on('click',function(){me.pause()});  
                //ajoute un rectangle pour faciliter le click              
                btnReload.append("rect")
                    .attr("height", 20)
                    .attr("width", 20)
                    .attr("fill-opacity", 0);
                btnReload.append('path')
                    .style('cursor','pointer')
                    .attr('d',"M15.65 4.35A8 8 0 1 0 17.4 13h-2.22a6 6 0 1 1-1-7.22L11 9h7V2z")
                    .on('click',function(){if(me.fctEnd)me.fctEnd();});                
            }          
                            */

              
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

        me.init();

    }
}
