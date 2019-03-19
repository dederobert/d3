function myChart() {

    const width = 1000;
    const height = 1000;

    const radius = Math.min(width, height)/10;

    const man_color ='#3498db';
    const man_color_hover ='#2b6299';
    const woman_color ='#e74c3c';
    const woman_color_hover ='#a6352b';
    const unkonw_color ='#95a5a6';
    const unkonw_color_hover ='#5c6566';
    const fz = '0.2em';

    var selID = -1;

    d3.csv('data/hanoi_280219.csv').then((hanoi)=>{

        hanoi = hanoi.sort((x,y)=>{
           return d3.descending(x.gender, y.gender);
        });

        const gender_count = d3.nest()
            .key(d=>{return d.gender})
            .rollup((l)=>{
                return l.length;
            })
            .entries(hanoi);

        const svg = d3.select('body')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g');

        const color = d3.scaleOrdinal()
            .domain(hanoi)
            .range([unkonw_color, man_color, woman_color]);
        const color_hover = d3.scaleOrdinal()
            .domain(hanoi)
            .range([woman_color_hover, man_color_hover, unkonw_color_hover]);

        const pie = d3.pie()
            .value((d)=> {return d.value});

        const arc_gender = d3.arc()
            .innerRadius(radius/2)
            .outerRadius(radius);


        const x = d3.scaleBand()
            .range([0, 2*Math.PI])
            .align(0)
            .domain(hanoi.map((d)=>{ return d.ID; }));

        const y = d3.scaleRadial()
            .range([radius+5, 2*(radius+5)])
            .domain([15,50]);

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
            .range([0, width])
            .padding(1)
            .domain(dimensions);

        function path(d) {
            return d3.line()(dimensions.map((p)=>{
                return [x_bar(p), y_bar[p](d[p])];
            }));
        }

        const pie_chart = g.append('g')
            .attr('transform', 'translate('+radius*2+","+radius*2+")");

        const colorByGender = function(d) {
            if (d.gender==='homme')
                return man_color;
            else if(d.gender==='femme')
                return woman_color;
            else
                return unkonw_color;
        };
        const colorByGenderHover = function(d) {
            if (d.gender==='homme')
                return man_color_hover;
            else if(d.gender==='femme')
                return woman_color_hover;
            else
                return unkonw_color_hover;
        };

        pie_chart.append('g').attr('class','pie_arc')
            .selectAll('pie_arc')
            .data(pie(gender_count))
            .enter()
            .append('path')
            .attr('d', arc_gender)
            .attr('fill', (d)=>{return color(d.data.key)})
            .style('opacity', 0.7);

        pie_chart.append('g').attr('class','pie_text')
            .selectAll('pie_arc')
            .data(pie(gender_count))
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

        pie_chart.append('g').attr('class','bar_user')
            .selectAll('bar_user')
            .data(hanoi)
            .enter()
            .append('path')
            .attr('class', 'bar')
            .attr('fill', colorByGender)
            .attr('d', d3.arc()
                .innerRadius(radius)
                .outerRadius((d)=>{ return y(d['clicks']); })
                .startAngle((d)=>{ return x(d.ID); })
                .endAngle((d)=>{ return x(d.ID) + x.bandwidth(); })
                .padAngle(0.01)
                .padRadius(radius)
            )
            .on('click', function (d){
                d3.select('.clicked')
                    .attr('class', 'bar')
                    .attr('fill', colorByGender)
                ;
                d3.select(this)
                    .attr('class', 'bar clicked')
                    .attr('fill', colorByGender)
                ;

                d3.select('#line-'+selID)
                    .attr('stroke-width', '1px')
                    .style('stroke', colorByGender)
                ;
                selID = d.ID;
                d3.select('#line-'+selID)
                    .attr('stroke-width', '8px')
                    .style('stroke', colorByGenderHover)
                ;
            })
            .on('mouseover', function (d){
              d3.select(this).attr('fill', colorByGenderHover);
            })
            .on('mouseout', function (d){
                d3.select(this).attr('fill', colorByGender);
            })
        ;


        pie_chart.append('g').attr('class','bar_user_text')
            .selectAll('.bar')
            .data(hanoi)
            .enter()
            .append('g')
            .attr('text-anchor', (d)=>{
                return (x(d.ID) + x.bandwidth()/2 + Math.PI) % (2*Math.PI) < Math.PI ? 'end': 'start';
            })
            .attr('transform', (d)=>{
                return 'rotate('+ ((x(d.ID) + x.bandwidth() / 2) * 180 / Math.PI - 90)+')'+'translate('+(y(d['clicks'])+1)+",0)";
            })
            .append('text')
            .text((d)=>{return d.clicks})
            .attr('transform', (d)=>{
                return (x(d.ID) + x.bandwidth() / 2 + Math.PI) % (2*Math.PI) < Math.PI ? 'rotate(180)' : 'rotate(0)';
            })
            .style('font-size', fz)
            .attr('alignment-baseline', 'middle');

        const line_chart = g.append('g')
            .attr('transform', 'translate(-50,'+radius*4.5+")");

        line_chart.append('g').attr('class','line')
            .selectAll('line')
            .data(hanoi)
            .enter()
            .append('path')
            .attr('id', (d)=>{
                return 'line-'+d.ID;
            })
            .attr('d', path)
            .style('fill', 'none')
            .style('stroke', colorByGender)
            .style('opacity', 0.5);

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
            .style('text-anchor', 'middle')
            .attr('y', -9)
            .attr('transform', 'translate(25, -25) rotate(315)')
            .text((d)=>{
                return d;
            })
            .style('font_size', fz)
            .style('fill', 'black');
    })
}