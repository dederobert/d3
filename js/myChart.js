const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

const radius = Math.min(width, height)/10;


function parseName(d) {
    switch(d) {
        case 'rate_interest': return 'Intéret';
        case 'rate_stimu': return 'Stimulation';
        case 'rate_visu': return 'Visuel';
        case 'rate_complexity': return 'Complexité';
        case 'rate_reactivity': return 'Réactivité';
        case 'rate_focus': return 'Focus';
        case 'rate_raisonnable': return 'Temps raisonnable';
        case 'rate_time_statis': return 'Satisfaction temps';
        case 'rate_wait': return 'Attente';
        default: return 'inconnue';
    }
}

function drawBoxPlot(g, hanoi, field) {


    let rate = hanoi
        .filter((d)=> {
            return d[field] !== '-1';
        })
        .map(d=>{ return Number(d[field]); })
        .sort(d3.ascending)
    ;
    const height_box = height / 5;
    const width_box = width / 5;

    let q1 = d3.quantile(rate, .25);
    let q2 = d3.quantile(rate, .5);
    let q3 = d3.quantile(rate, .75);
    let interQuantile = q3 - q1;
    let min = Math.max(d3.min(rate), q1 - 1.5*interQuantile);
    let max = Math.min(d3.max(rate), q1 + 1.5*interQuantile);


    const y_box = d3.scaleLinear()
        .domain([-1,7])
        .range([width_box, 0]);
    const center_box = height / 5 ;

    d3.select('.title')
        .text(parseName(field))
        .attr('transform', 'translate('+3*width/4+','+(center_box-height_box/2 - 5)+')');

    d3.select('.axis')
        .call(d3.axisBottom(y_box))
        .attr('transform', 'translate('+3*width/4+','+(center_box+height_box/2 + 5)+')');

    d3.select('.box_plot_line')
        .transition()
        .duration(1000)
        .attr('y1', center_box)
        .attr('y2', center_box)
        .attr('x1', y_box(min) + 3*width/4)
        .attr('x2', y_box(max)+ 3*width/4)
        .attr('stroke', 'black');

    d3.select('.box_plot_rect')
        .transition()
        .duration(1000)
        .attr('y', (center_box - height_box/2))
        .attr('x', y_box(q3) + 3*width/4)
        .attr('width', (y_box(q1)-y_box(q3)))
        .attr('height', height_box)
        .attr('stroke', 'black')
        .style('fill', '#69b3a2');

    let line2 = d3.selectAll('.box_plot_line2');

    console.dir(line2)

    line2.data([min, q2, max])
        .enter()
        .append('line')
        .merge(line2)
        .transition()
        .duration(1000)
        .attr('class','box_plot_line2')
        .attr('y1', center_box - height_box /2)
        .attr('y2', center_box + height_box /2)
        .attr('x1', d=>{ return y_box(d)+ 3*width/4})
        .attr('x2', d=>{ return y_box(d)+ 3*width/4})
        .attr('stroke', 'black');

        line2.exit()
            .remove();
}

function myChart() {



    const man_color ='#3498db';
    const man_color_var1 ='#75b1d9';
    const man_color_var2 ='#3498db';
    const man_color_var3 ='#0073bf';
    const man_color_hover ='#2b6299';

    const woman_color ='#e74c3c';
    const woman_color_var1 ='#e68981';
    const woman_color_var2 ='#e74c3c';
    const woman_color_var3 ='#cc1100';
    const woman_color_hover ='#a6352b';

    const unkonw_color ='#95a5a6';
    const unkonw_color_var1 ='#bfbfbf';
    const unkonw_color_var2 ='#95a5a6';
    const unkonw_color_var3 ='#305e61';
    const unkonw_color_hover ='#5c6566';
    const fz = '1em';
    const legend_box_size = 20;

    let selID = -1;

    d3.csv('data/hanoi_280219.csv').then((hanoi)=>{

        hanoi = hanoi.sort((x,y)=>{
            if (x.gender === y.gender) {
                if (x.game_type === y.game_type)
                    return d3.descending(x.clicks, y.clicks);
                return d3.descending(x.game_type, y.game_type);
            }else
               return d3.descending(x.gender, y.gender);
        });


        const gender_count = d3.nest()
            .key(d=>{return d.gender})
            .rollup((l)=>{
                return l.length;
            })
            .entries(hanoi);

        const game_type_count_man = d3.nest()
            .key(d=>{return d.game_type})
            .rollup((l)=>{
                return l.length;
            })
            .entries(hanoi.filter(d=>{
                return d.gender === 'homme';
            }));

        const game_type_count_woman = d3.nest()
            .key(d=>{return d.game_type})
            .rollup((l)=>{
                return l.length;
            })
            .entries(hanoi.filter(d=>{
                return d.gender === 'femme';
            }));

        const game_type_count_unkonw = d3.nest()
            .key(d=>{return d.game_type})
            .rollup((l)=>{
                return l.length;
            })
            .entries(hanoi.filter(d=>{
                return d.gender === '-1';
            }));

        const svg = d3.select('body')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g');

        const color = d3.scaleOrdinal()
            .domain(hanoi)
            .range([unkonw_color, man_color, woman_color]);

        const colorMan = d3.scaleOrdinal()
            .domain(game_type_count_man)
            .range([man_color_var1, man_color_var3, man_color_var2]);
        const colorWoman = d3.scaleOrdinal()
            .domain(game_type_count_woman)
            .range([woman_color_var1, woman_color_var3, woman_color_var2]);
        const colorUnknow = d3.scaleOrdinal()
            .domain(game_type_count_unkonw)
            .range([unkonw_color_var3, unkonw_color_var2, unkonw_color_var1]);

        const color_hover = d3.scaleOrdinal()
            .domain(hanoi)
            .range([woman_color_hover, man_color_hover, unkonw_color_hover]);


        console.dir(gender_count)

        const pie_gender = d3.pie()
            .value((d)=> {return d.value});

        const arc_gender = d3.arc()
            .innerRadius(radius/2)
            .outerRadius(radius);

        const pie_game_type = d3.pie()
            .value((d)=> {return d.value});

        const arc_game_type = d3.arc()
            .innerRadius(radius)
            .outerRadius(radius*1.5);

        const arc_label_game_type = d3.arc()
            .innerRadius(radius * 3)
            .outerRadius(radius * 3);


        const x = d3.scaleBand()
            .range([0, 2*Math.PI])
            .align(0)
            .domain(hanoi.map((d)=>{ return d.ID; }));

        const y = d3.scaleRadial()
            .range([(radius), 2*radius])
            .domain([10,64]);

        const dimensions = d3.keys(hanoi[0]).filter((d)=>{
            return d !== 'ID' && d !== 'user' && d!== 'game_type'
                && d !== 'clicks' && d !== 'time' && d !== 'age'
                && d!== 'gender' && d!== 'time_long' && d !== 'evaluate_time';
        });

        const y_bar = {};
        for (let i in dimensions) {
            let name = dimensions[i];
            y_bar[name] = d3.scaleLinear()
                .domain(d3.extent(hanoi, (d)=>{
                    return +d[name];
                }))
                .range([height-(5*radius), 0]);
        }

        const x_bar = d3.scalePoint()
            .range([0, width-(4*radius)])
            .padding(1)
            .domain(dimensions);

        function path(d) {
            return d3.line()(dimensions.map((p)=>{
                return [x_bar(p), y_bar[p](d[p])];
            }));
        }

        const pie_chart_gender = g.append('g')
            .attr('transform', 'translate('+radius*3+","+radius*2.8+")");

        const colorByGender = function(d) {
            if (d.gender==='homme') {
                if (d.game_type === '-1') return man_color_var1;
                if (d.game_type === '0') return man_color_var2;
                if (d.game_type === '1') return man_color_var3;
            }else if(d.gender==='femme') {
                if (d.game_type === '-1') return woman_color_var1;
                if (d.game_type === '0') return woman_color_var2;
                if (d.game_type === '1') return woman_color_var3;
            }else {
                if (d.game_type === '-1') return unkonw_color_var1;
                if (d.game_type === '0') return unkonw_color_var2;
                if (d.game_type === '1') return unkonw_color_var3;
            }
        };
        const colorByGenderHover = function(d) {
            if (d.gender==='homme')
                return man_color_hover;
            else if(d.gender==='femme')
                return woman_color_hover;
            else
                return unkonw_color_hover;
        };

        pie_chart_gender.append('g').attr('class','pie_arc')
            .selectAll('pie_arc')
            .data(pie_gender(gender_count))
            .enter()
            .append('path')
            .attr('d', arc_gender)
            .attr('fill', (d)=>{return color(d.data.key)})

            .each(function (d) {
                let pie = pie_game_type
                    .startAngle(d.startAngle)
                    .endAngle(d.endAngle)
                    .sort(null)
                ;
                let pieReady, color;
                if (d.data.key === 'homme') {
                    pieReady = pie(game_type_count_man);
                    color = colorMan;
                }else if(d.data.key === 'femme') {
                    pieReady = pie(game_type_count_woman);
                    color = colorWoman;
                }else{
                    pieReady = pie(game_type_count_unkonw);
                    color = colorUnknow;
                }

                pie_chart_gender.append('g').attr('class', 'pie_gt')
                    .selectAll('pie_arc_gt')
                    .data(pieReady)
                    .enter()
                    .append('path')
                    .attr('d', arc_game_type)
                    .attr('fill', (d) => {
                        return color(d.data.key)
                    })
            })
        ;

        pie_chart_gender.append('g').attr('class','pie_text')
            .selectAll('pie_arc')
            .data(pie_gender(gender_count))
            .enter()
            .append('text')
            .text((d)=>{
                return d.data.key;
            })
            .attr('transform', (d)=>{
                return 'translate('+ arc_gender.centroid(d) +")";
            })
            .style('text-anchor', 'middle')
            .style('font-size', fz);


        pie_chart_gender.append('g').attr('class','bar_user')
            .selectAll('bar_user')
            .data(hanoi)
            .enter()
            .append('path')
            .attr('class', 'bar')
            .attr('fill', colorByGender)
            .attr('d', d3.arc()
                .innerRadius(radius*1.5)
                .outerRadius((d)=>{ return y(d['clicks']) + radius; })
                .startAngle((d)=>{ return x(d.ID); })
                .endAngle((d)=>{ return x(d.ID) + x.bandwidth(); })
                .padAngle(0.01)
                .padRadius(radius)
            )
            .on('click', function (d){
                d3.select('.clicked')
                    .classed('clicked', false)
                    .attr('fill', colorByGender)
                ;
                d3.select(this)
                    .classed('clicked', true)
                    .attr('fill', colorByGenderHover)
                ;

                d3.select('#line-'+selID)
                    .attr('stroke-width', '1px')
                    .style('opacity', 0.5)
                ;
                selID = d.ID;
                d3.select('#line-'+selID)
                    .attr('stroke-width', '8px')
                    .style('opacity', 1)
                ;
            })
            .on('mouseover', function (d){
              d3.select(this).attr('fill', colorByGenderHover);
            })
            .on('mouseout', function (d){
                d3.select(this)
                    .filter(function () {
                        return !this.classList.contains('clicked');
                    })
                    .attr('fill', colorByGender);
            })
        ;


        pie_chart_gender.append('g').attr('class','bar_user_text')
            .selectAll('.bar')
            .data(hanoi)
            .enter()
            .append('g')
            .attr('text-anchor', (d)=>{
                return (x(d.ID) + x.bandwidth()/2 + Math.PI) % (2*Math.PI) < Math.PI ? 'end': 'start';
            })
            .attr('transform', (d)=>{
                return 'rotate('+ ((x(d.ID) + x.bandwidth() / 2) * 180 / Math.PI - 90)+')'+'translate('+(y(d['clicks'])+radius - 15)+",0)";
            })
            .append('text')
            .text((d)=>{return d.clicks})
            .attr('transform', (d)=>{
                return (x(d.ID) + x.bandwidth() / 2 + Math.PI) % (2*Math.PI) < Math.PI ? 'rotate(180)' : 'rotate(0)';
            })
            .style('font-size', fz)
            .attr('alignment-baseline', 'middle');


        const line_chart = g.append('g')
            .attr('transform', 'translate('+radius*4+','+radius*4.5+")");

        line_chart.append('g').attr('class','line')
            .selectAll('line')
            .data(hanoi)
            .enter()
            .append('path')
            .transition()
            .duration(1000)
            .attr('id', (d)=>{
                return 'line-'+d.ID;
            })
            .attr('d', path)
            .style('fill', 'none')
            .style('stroke', colorByGender)
            .style('opacity', 0.5)

        ;

        line_chart.append('g').attr('class', 'line_axis')
            .selectAll('line')
            .data(dimensions)
            .enter()
            .append('g')
            .attr('transform', (d)=>{
                return 'translate('+x_bar(d) +')'
            })
            .each(function(d){
                d3.select(this).call(d3.axisLeft().scale(y_bar[d]));
            })
            .append('text')
            .style('text-anchor', 'start')
            .attr('y', -9)
            .attr('transform', 'rotate(315)')
            .text((d)=>{
                return parseName(d);
            })
            .style('font-size', fz)
            .style('fill', 'black')
            .style('cursor', 'pointer')
            .each(function (d){
                if (d === 'rate_interest')
                    d3.select(this)
                        .style('font-weight', 'bold')
                        .style('font-size', 1.5*fz)
                        .classed('txt-clicked', true);
            })
            .on('click', function(d) {
                d3.select('.txt-clicked')
                    .style('font-weight', 'normal')
                    .style('font-size', fz)
                    .classed('txt-clicked', false);
                d3.select(this)
                    .style('font-weight', 'bold')
                    .style('font-size', 1.5*fz)
                    .classed('txt-clicked', true);

                drawBoxPlot(g, hanoi, d)
        })
        ;


        const box_plot = g.append('g')
            .classed('box_plot', true);

        box_plot.append('text')
            .classed('title', true);

        box_plot.append('g')
            .classed('axis', true);

        box_plot.append('line')
            .classed('box_plot_line', true);

        box_plot.append('rect')
            .classed('box_plot_rect', true);

        box_plot.append('line')
            .classed('box_plot_line2', true);
        box_plot.append('line')
            .classed('box_plot_line2', true);
        box_plot.append('line')
            .classed('box_plot_line2', true);

       drawBoxPlot(g, hanoi, 'rate_interest');


        //LEGEND MAN COLOR

        g.append('rect')
            .attr('width', 0.6*legend_box_size)
            .attr('height', 0.6*legend_box_size)
            .attr('fill', man_color_var1)
            .attr('transform', 'translate('+radius*6+',0)');
        g.append('text')
            .text('Homme: sans loader')
            .attr('transform', 'translate('+(radius*6 + 20)+','+(legend_box_size/2)+')')
            .style('font-size', fz);

        g.append('rect')
            .attr('width', 0.6*legend_box_size)
            .attr('height', 0.6*legend_box_size)
            .attr('fill', man_color_var2)
            .attr('transform', 'translate('+radius*6+', '+legend_box_size+')');
        g.append('text')
            .text('Homme: faible focus')
            .attr('transform', 'translate('+(radius*6 + 20)+','+((legend_box_size/2)+legend_box_size)+')')
            .style('font-size', fz);

        g.append('rect')
            .attr('width', 0.6*legend_box_size)
            .attr('height', 0.6*legend_box_size)
            .attr('fill', man_color_var3)
            .attr('transform', 'translate('+radius*6+', '+legend_box_size*2+')')
        ;
        g.append('text')
            .text('Homme: fort focus')
            .attr('transform', 'translate('+(radius*6 + 20)+','+((legend_box_size/2)+legend_box_size*2)+')')
            .style('font-size', fz);

        //LEGEND WOMAN COLOR

        g.append('rect')
            .attr('width', 0.6*legend_box_size)
            .attr('height', 0.6*legend_box_size)
            .attr('fill', woman_color_var1)
            .attr('transform', 'translate('+radius*6+','+legend_box_size*3+')')
        ;
        g.append('text')
            .text('Femme: sans loader')
            .attr('transform', 'translate('+(radius*6 + 20)+','+((legend_box_size/2)+legend_box_size*3)+')')
            .style('font-size', fz);
        g.append('rect')
            .attr('width', 0.6*legend_box_size)
            .attr('height', 0.6*legend_box_size)
            .attr('fill', woman_color_var2)
            .attr('transform', 'translate('+radius*6+', '+legend_box_size*4+')')
        ;
        g.append('text')
            .text('Femme: faible focus')
            .attr('transform', 'translate('+(radius*6 + 20)+','+((legend_box_size/2)+legend_box_size*4)+')')
            .style('font-size', fz);
        g.append('rect')
            .attr('width', 0.6*legend_box_size)
            .attr('height', 0.6*legend_box_size)
            .attr('fill', woman_color_var3)
            .attr('transform', 'translate('+radius*6+', '+legend_box_size*5+')')
        ;
        g.append('text')
            .text('Femme: fort focus')
            .attr('transform', 'translate('+(radius*6 + 20)+','+((legend_box_size/2)+legend_box_size*5)+')')
            .style('font-size', fz);

        //LEGEND UNKNOW COLOR

        g.append('rect')
            .attr('width', 0.6*legend_box_size)
            .attr('height', 0.6*legend_box_size)
            .attr('fill', unkonw_color_var1)
            .attr('transform', 'translate('+radius*6+','+legend_box_size*6+')')
        ;
        g.append('text')
            .text('Inconnus: sans loader')
            .attr('transform', 'translate('+(radius*6 + 20)+','+((legend_box_size/2)+legend_box_size*6)+')')
            .style('font-size', fz);
        g.append('rect')
            .attr('width', 0.6*legend_box_size)
            .attr('height', 0.6*legend_box_size)
            .attr('fill', unkonw_color_var2)
            .attr('transform', 'translate('+radius*6+', '+legend_box_size*7+')')
        ;
        g.append('text')
            .text('Inconnus: faible focus')
            .attr('transform', 'translate('+(radius*6 + 20)+','+((legend_box_size/2)+legend_box_size*7)+')')
            .style('font-size', fz);
        g.append('rect')
            .attr('width', 0.6*legend_box_size)
            .attr('height', 0.6*legend_box_size)
            .attr('fill', unkonw_color_var3)
            .attr('transform', 'translate('+radius*6+', '+legend_box_size*8+')')
        ;
        g.append('text')
            .text('Inconnus: fort focus')
            .attr('transform', 'translate('+(radius*6 + 20)+','+((legend_box_size/2)+legend_box_size*8)+')')
            .style('font-size', fz);

    })
}