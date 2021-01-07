class echelleColor {
    constructor(params) {
        var me = this;
        this.idCont = params.idCont;
        this.cont = d3.select("#"+params.idCont);
        this.width = params.width ? params.width : this.cont.node().offsetWidth;
        this.height = params.height ? params.height : this.cont.node().offsetHeight;
        this.fctClick = params.fctClick ? params.fctClick : false;
        this.fctClickTrait = params.fctClickTrait ? params.fctClickTrait : false;
        var haut=20, large='100%', margin=3
            , listeColor = ['interpolateSinebow','interpolateViridis',
            'interpolateInferno',
            'interpolateMagma',
            'interpolatePlasma',
            'interpolateWarm',
            'interpolateCool',
            'interpolateRainbow',
            'interpolateCubehelixDefault',
            'interpolateYlOrRd',
            'interpolateYlOrBr',
            'interpolateYlGn',
            'interpolateYlGnBu',
            'interpolateRdPu',
            'interpolatePuRd',
            'interpolatePuBu',
            'interpolatePuBuGn',
            'interpolateOrRd',
            'interpolateGnBu',
            'interpolateBuPu',
            'interpolateBuGn',
            'interpolateReds',
            'interpolatePurples',
            'interpolateOranges',
            'interpolateGreys',
            'interpolateGreens',
            'interpolateBlues',
            'interpolateSpectral',
            'interpolateRdYlGn',
            'interpolateRdYlBu',
            'interpolateRdGy',
            'interpolateRdBu',
            'interpolatePuOr',
            'interpolatePiYG',
            'interpolatePRGn',
            'interpolateBrBG',
            ], arrColor=[], selectColor;

        this.init = function () {
            console.log('init echelleColor.js')
            listeColor.sort();
            listeColor.forEach((c,i)=>{
                arrColor.push({'label':c.replace('interpolate',''),'fct':d3[c],'id':me.idCont+'_echelleColor'+i});
            });
            selectColor = arrColor[0];            
        }
        this.getMenuList = function(){
            let menu =  me.cont.append('div')
                .attr('class',"dropdown")        
                .attr('id',me.idCont+'_menuEchelleColor')
                .style('width','100%');        
            menu.append('button')
                .attr('class',"btn btn-secondary dropdown-toggle")        
                .attr('id',me.idCont+'_menuBtnEchelleColor')
                .attr('type','button')
                .attr('data-toggle','dropdown')
                .attr('aria-haspopup','true')
                .attr('aria-expanded','false')
                .html(selectColor.label)
                .call(function(){me.ramp(me.idCont+'_menuBtnEchelleColor',selectColor.fct)});

            let menuListe= menu.append('div')
                .attr('class',"dropdown-menu")        
                .attr('id',me.idCont+'_menuListeEchelleColor')
                .attr('aria-labelledby',me.idCont+'_menuBtnEchelleColor');
    
            let menuItems =  menuListe.selectAll('div').data(arrColor).enter().append('div')
                .attr('class',"dropdown-item")        
                .attr('id',d=>d.id)        
                .on('click',(e,d)=>{
                    d3.select('#'+me.idCont+'_menuBtnEchelleColor').html(d.label);
                    me.ramp(me.idCont+'_menuBtnEchelleColor',d.fct);
                    selectColor = d;                    
                    if(me.fctClick)me.fctClick(e,d);
                });
            menuItems.append('label')
                .style('float','left')
                .style('margin-right','3px')
                .html(d=>d.label);
            menuItems.each((p,j)=>{
                me.ramp(p.id,p.fct);
            });
        }

        this.ramp = function(idCont, color, n = 512, h=haut){
            let canvas =  d3.select("#"+idCont).append('canvas').node();
                const context = canvas.getContext("2d");
                canvas.style.width = "60%";
                canvas.style.height = h+"px";
                canvas.style.float = "right";
                canvas.style.imageRendering = "pixelated";
                for (let i = 0; i < n; ++i) {
                    context.fillStyle = color(i / (n - 1));
                    context.fillRect(i, 0, 1, h*3);
                }
            return canvas;
        }
        this.getSelectFct = function(){
            return selectColor ? selectColor.fct : false; 
        }
  
        me.init();

    }
}
