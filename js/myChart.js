function myChart() {

    const width = 200;
    const height = 200;

    const radius = Math.min(width, height)/10;

    const man_color ='#3498db';
    const woman_color ='#e74c3c';
    const unkonw_color ='#95a5a6';
    const fz = '0.2em';

    d3.csv('data/hanoi_280219.csv').then((hanoi)=>{

        hanoi = hanoi.sort((x,y)=>{
           return d3.descending(x.gender, y.gender);
        });
        console.dir(hanoi)
;
        const gender_count = d3.nest()
            .key(d=>{return d.gender})
            .rollup((l)=>{
                return l.length;
            })
            .entries(hanoi);

        console.dir(gender_count);

        const svg = d3.select('body')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', 'translate('+width/2+","+height/2+")");

        const color = d3.scaleOrdinal()
            .domain(hanoi)
            .range([unkonw_color, man_color, woman_color]);

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

        g.selectAll('pie_arc')
            .data(pie(gender_count))
            .enter()
            .append('path')
            .attr('d', arc_gender)
            .attr('fill', (d)=>{return color(d.data.key)})
            .style('opacity', 0.7);

        g.selectAll('pie_arc')
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

        g.append('g')
            .selectAll('bar_user')
            .data(hanoi)
            .enter()
            .append('path')
            .attr('class', 'bar')
            .attr('fill', (d)=>{
                if (d.gender==='homme')
                    return man_color;
                else if(d.gender==='femme')
                    return woman_color;
                else
                    return unkonw_color;
            })
            .attr('d', d3.arc()
                .innerRadius(radius)
                .outerRadius((d)=>{ return y(d['clicks']); })
                .startAngle((d)=>{ return x(d.ID); })
                .endAngle((d)=>{ return x(d.ID) + x.bandwidth(); })
                .padAngle(0.01)
                .padRadius(radius)
            );
        g.append('g')
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
    })
}