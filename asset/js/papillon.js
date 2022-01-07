let rdmEasingNames = d3.randomInt(0, 36), rdmX, rdmY
    , nbNuee = urlParams.has('nbNuee') ?  urlParams.get('nbNuee') : 0
    , cumulPapi = false
    , nbPapi = urlParams.has('nbPapi') ?  urlParams.get('nbPapi') : 1
    , papis = [], fctPapiAjoutEnd;

function clouPapi(e, d){
    let p = d3.select(e.currentTarget);
    if(p.attr('class')!='clouPapi'){
        arrAnim['#'+p.attr('id')].pause();        
        p.attr('class','clouPapi');
        //pour le dessin du pin merci à http://www.onlinewebfonts.com/icon
        p.append('g')
            .attr('transform','translate(300,300) scale(0.01)')//rotate(-45)
            .append("path")
                .attr("d","M6102.5,5015.5c-93.6-256.7-179.9-678.9-206.3-1012.4l-21.6-266.3l-1377-1374.6L3122.9,990.1l-167.9,24c-357.4,52.8-1029.2-4.8-1508.9-127.2l-115.2-28.8l930.8-930.8l933.2-933.2L1808.3-2392.5L421.7-3779.1l-163.1-508.6c-91.2-280.7-163.1-508.6-158.3-508.6c2.4,0,232.7,76.8,506.2,170.3l501.4,167.9L2492-3073.8l1386.6,1384.2l933.2-933.2L5745-3556l38.4,122.3c19.2,69.6,60,261.5,88.8,429.4c43.2,266.3,50.4,371.8,40.8,779.7l-12,470.2L7270.8-386.9L8640.5,980.5l215.9,16.8c119.9,9.6,302.3,31.2,407.8,50.4c227.9,43.2,635.7,153.5,635.7,175.1c0,7.2-851.6,873.2-1892.8,1921.6C6711.8,4449.4,6109.6,5039.5,6102.5,5015.5z")
                .attr("fill","white");
        //ajoute le drag & drop
        p.call(
                d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
            );

        /*
        p.append('rect').attr('x',0).attr('y',0)
            .attr("width",'100px').attr("height",'100px')
            .attr('fill','white');
        */

        function dragstarted(e) {
            e.sourceEvent.stopPropagation();
        }
        
        function dragged(e) {
            p.attr('x', e.x).attr('y', e.y);
        }
        
        function dragended(e) {
            console.log('dragended');
        }              


    } 
}

function ajoutNueePapillon(){
    let svg = d3.select("#mesos");
    let contPapi = d3.select("#nueePapillon");
    if(!cumulPapi || nbPapi==0)contPapi.selectAll(".ChaoticumPapillonae").remove();
    let posi = svg.node().getBBox();
    rdmX=d3.randomUniform(posi.x, (posi.width-posi.x));
    rdmY=d3.randomUniform(posi.y, (posi.height-posi.y));
    for (var i = 0; i < nbPapi; i++) ajoutPapillon('ChaoticumPapillonae'+'_'+nbNuee+'_'+i, contPapi); 
    nbNuee++;
}

function ajoutPapillon(id, svg, posi={x:-1000, y:-1000, bottom:0}, anime=true){
    let url = "https://samszo.univ-paris8.fr/ChaoticumPapillonae/CreaPapiDynaAnim.php?anim=0&larg=64&haut=64&id="+id;
    //url = "http://localhost/samszo/ChaoticumPapillonae/CreaPapiDynaAnim.php?anim=0&larg=64&haut=64&id="+id;
    d3.xml(url)
        .then(data => {
            svg.node().append(data.documentElement);
            //positionne le papillion
            papis.push(
                d3.select("#"+id)
                .attr('x',posi.x).attr('y',posi.y)//le papillon s'affiche au premier déplacement
                .attr('class','ChaoticumPapillonae')
                .style('cursor','pointer')
                .on('click',clouPapi)
            );
            //anime le papillon
            if(anime)animePapi("#"+id);
            if(posi.bottom){
                //positionne le papillon précisément
                let bb = svg.node().getBBox();
                d3.select("#"+id).attr('y',(posi.bottom-bb.height-bb.y));                
            } 
            if(fctPapiAjoutEnd)fctPapiAjoutEnd();   

    });
}

function animePapi(trgt){
    
    arrAnim[trgt] = anime.timeline({
        loop:true,
    });
    arrAnim[trgt]
        .add({
            targets: trgt,
            x: getKeyFrame(rdmX),
            y: getKeyFrame(rdmY),
            });
}

function getKeyFrame(fct){
    var keyframes = [];
    for (var i = 0; i < 30; i++) keyframes.push({ 
        value: fct(), duration: anime.random(2000, 4000), delay: anime.random(500, 2000), easing: easingNames[rdmEasingNames()] 
    });
    return keyframes;
}
let easingNames = [
    'easeInQuad',
    'easeInCubic',
    'easeInQuart',
    'easeInQuint',
    'easeInSine',
    'easeInExpo',
    'easeInCirc',
    'easeInBack',
    'easeOutQuad',
    'easeOutCubic',
    'easeOutQuart',
    'easeOutQuint',
    'easeOutSine',
    'easeOutExpo',
    'easeOutCirc',
    'easeOutBack',
    'easeInBounce',
    'easeInOutQuad',
    'easeInOutCubic',
    'easeInOutQuart',
    'easeInOutQuint',
    'easeInOutSine',
    'easeInOutExpo',
    'easeInOutCirc',
    'easeInOutBack',
    'easeInOutBounce',
    'easeOutBounce',
    'easeOutInQuad',
    'easeOutInCubic',
    'easeOutInQuart',
    'easeOutInQuint',
    'easeOutInSine',
    'easeOutInExpo',
    'easeOutInCirc',
    'easeOutInBack',
    'easeOutInBounce',
];
