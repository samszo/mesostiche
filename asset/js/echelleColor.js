class echelleColor {
    constructor(params) {
        var me = this;
        this.idCont = params.idCont;
        this.cont = d3.select("#"+params.idCont);
        this.anime = params.anime ? params.anime : false;
        this.width = params.width ? params.width : this.cont.node().offsetWidth;
        this.height = params.height ? params.height : this.cont.node().offsetHeight;
        this.duree = params.duree ? params.duree : 1;//en seconde
        this.delais = params.delais ? params.delais : 250;//en milliseseconde
        this.boutons = params.boutons ? params.boutons : false;
        this.fctEnd = params.fctEnd ? params.fctEnd : false;
        this.fctPause = params.fctPause ? params.fctPause : false;
        this.fctChange = params.fctChange ? params.fctChange : false;
        this.fctClick = params.fctClick ? params.fctClick : false;
        this.fctClickTrait = params.fctClickTrait ? params.fctClickTrait : false;
        this.colorfond = params.color ? params.color : 'white';
        var svg, global
            , haut=100, large=100, margin=3
            , yTrait = d3.scaleBand().paddingInner(0.2).paddingOuter(0.3).align(0.5)
		          .range([0, haut])
		          .domain([0, 1, 2, 3, 4, 5]);            

        this.init = function () {
            
            svg = this.cont.append("svg")
                .attr("id", me.idCont+'_echelleColor')
                .attr("width",me.width+'px').attr("height", me.height+'px');            

                var linearScale = d3.scaleLinear()
                .domain([0, 1000])
                .range([0, 1000]);
            
            var sequentialScale = d3.scaleSequential()
                .domain([0, 1000]);
            
            var interpolators = [
                'interpolateViridis',
                'interpolateInferno',
                'interpolateMagma',
                'interpolatePlasma',
                'interpolateWarm',
                'interpolateCool',
                'interpolateRainbow',
                'interpolateCubehelixDefault'
            ];
            
            var tooltip = d3.select("body").append("div")
                .attr("class", "tooltip");
            var colorInit, hRec = 30, dataScale;
            
            var colorInt='interpolateWarm', txtData, myData = d3.range(0, 1000, 1), urlData = '<?php echo $this->urlData;?>', refLbl = '<?php echo $this->refLbl;?>', refNb = '<?php echo $this->refNb;?>';
            

            //tirage des six traits
            getTraits();

            //construction de l'exagramme
            global = svg.append("g").attr("id",me.idCont+'svgExaGlobal')
                .style('cursor',me.boutons ? 'pointer' : 'none')
                .on('click',me.fctClickExa);
            //ajoute un rectangle de fond
            global.append('rect')
                .attr("x",0)
                .attr("y",0)
                .attr("width",(large+(margin*2))+'px').attr("height", (haut+(margin*2))+'px')
                .attr("fill",d=> me.colorfond == "alea" ? color(aleaColor()) : me.colorfond)

            let gTraits = global.selectAll('.trait').data(curTraits).enter().append("g")
                .attr("id", (d,i) => me.idCont+'svgExa'+i)
                .attr("class", 'trait');
            gTraits.selectAll('path').data(d=>d.paths).enter().append('path')
                .attr("d",p=>p.d)
                .attr("fill",'none')
                .attr("stroke-width",p=>p.w ? p.w : yTrait.bandwidth())
                .attr("stroke-dasharray","none")
                .attr("stroke-opacity",1)                    
                .attr("stroke-linecap","butt")
                .attr("stroke-linejoin","miter")
                .attr("stroke-miterlimit","4")
                .attr("stroke",d=> d.c == "alea" ? color(aleaColor()) : d.c)
                .attr("transform",d=>d.t ? d.t : "")
                .style('cursor',me.boutons ? 'pointer' : 'none')
                .on('click',me.fctClickTrait);

            if(me.anime){
                console.log('animation');
            }

            //redimensionne le svg
            let bb = global.node().getBBox();
            svg.attr('viewBox',(bb.x)+' '+(bb.y)+' '+' '+(bb.width)+' '+(bb.height));
            
        }

        function getTraits(){
            for (let i = 0; i < 6; i++) {
                let t=traits[aleaTrait()];
                let p = [];
                let tL = large;
                let y = yTrait(i)+(margin*3);
                if(t=='yin'){
                    p.push({'d':"M "+margin+","+y+" "+(tL/3)+","+y,'c':me.colorTrait});
                    p.push({'d':"M "+(tL/3*2)+","+y+" "+tL+","+y,'c':me.colorTrait});
                }
                if(t=='yang'){
                    p.push({'d':"M "+margin+","+y+" "+tL+","+y,'c':me.colorTrait});
                }
                if(t=='vieux-yang'){
                    p.push({'d':"M "+margin+","+y+" "+tL+","+y,'c':me.colorTrait});
                    p.push({'w':1
                        ,'c':me.colorVieuxYang
                        ,'t':"translate("+((tL/2)-6)+" "+(y+(yTrait.bandwidth()/2))+") scale(1.4)"
                        ,'d':"M6.85-4.22C6.85-2.02 6.08-0.99 4.67-0.99C3.26-0.99 2.50-2.02 2.50-4.21C2.50-6.42 3.28-7.44 4.69-7.44C6.08-7.44 6.85-6.42 6.85-4.22ZM0.91-4.21C0.91-1.54 2.27 0.19 4.67 0.19C7.06 0.19 8.43-1.62 8.43-4.22C8.43-6.90 7.09-8.62 4.69-8.62C2.29-8.62 0.91-6.82 0.91-4.21Z"
                    });
                }
                if(t=='vieux-yin'){
                    p.push({'d':"M "+margin+","+y+" "+(tL/3)+","+y,'c':me.colorTrait});
                    p.push({'w':1
                        ,'c':me.colorVieuxYin
                        ,'t':"translate("+((tL/2)-3.8)+" "+(y+yTrait.bandwidth()/2)+") scale(1.4)"
                        ,'d':"M3.82-3.50L5.86 0L7.63 0L4.72-4.51L7.30-8.43L5.63-8.43L3.89-5.41L3.82-5.41L2.10-8.43L0.37-8.43L2.96-4.45L0.03 0L1.70 0L3.76-3.50Z"
                    });
                    p.push({'d':"M "+(tL/3*2)+","+y+" "+tL+","+y,'c':me.colorTrait});
                }
                curTraits.push({'type':t,'paths':p})
            }
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
