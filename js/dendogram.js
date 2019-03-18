function dendogram() {

    const scat_size = 60;

    d3.csv('data/cereals.csv').then((cer)=> {

        data = cer.map((c)=>{
          return {
              calories: c.calories*(scat_size/160),
              protein: c.protein*(scat_size/6),
              fat: c.fat*(scat_size/5),
              sodium: c.sodium*(scat_size/320)


          }
        });

        const svg = d3.select('svg');

        svg.append('rect')
            .attr("width",60)
            .attr("height",60)
            .style('stroke', 'black')
            .style('stroke-width', '0.2')
            .style("fill","rgba(0,0,0,0)");

        svg.selectAll("cal_prot")
            .data(data)
            .enter()
            .append('circle')
            .attr("cx", (d)=>{
                return d.calories;
            })
            .attr("cy", (d)=>{
                return 60-d.protein
            })
            .attr('r', (d)=> {
                return 1;
            });

        svg.append('rect')
            .attr('transform', 'translate(70,0)')
            .attr("width",60)
            .attr("height",60)
            .style('stroke', 'black')
            .style('stroke-width', '0.2')
            .style("fill","rgba(0,0,0,0)");

        svg.selectAll("fat_prot")
            .data(data)
            .enter()
            .append('circle')
            .attr('transform', 'translate(70,0)')
            .attr("cx", (d)=>{
                return 60-d.fat;
            })
            .attr("cy", (d)=>{
                return d.protein
            })
            .attr('r', (d)=> {
                return 1;
            })


        svg.append('rect')
            .attr('transform', 'translate(140,0)')
            .attr("width",60)
            .attr("height",60)
            .style('stroke', 'black')
            .style('stroke-width', '0.2')
            .style("fill","rgba(0,0,0,0)");

        svg.selectAll("sod_prot")
            .data(data)
            .enter()
            .append('circle')
            .attr('transform', 'translate(140,0)')
            .attr("cx", (d)=>{
                return 60-(d.sodium/5);
            })
            .attr("cy", (d)=>{
                return d.protein
            })
            .attr('r', (d)=> {
                return 1;
            });

        svg.append('rect')
            .attr('transform', 'translate(210,0)')
            .attr("width",60)
            .attr("height",60)
            .style('stroke', 'black')
            .style('stroke-width', '0.2')
            .style("fill","rgba(0,0,0,0)");

        svg.selectAll("prot_prot")
            .data(data)
            .enter()
            .append('circle')
            .attr('transform', 'translate(210,0)')
            .attr("cx", (d)=>{
                return 60-d.protein;
            })
            .attr("cy", (d)=>{
                return d.protein;
            })
            .attr('r', (d)=> {
                return 1;
            })



    });
}