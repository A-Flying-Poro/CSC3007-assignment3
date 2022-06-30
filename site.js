document.addEventListener('DOMContentLoaded', (event) => {
    /*const viewBoxHeight = 600
    const viewBoxWidth = 860
    const marginX = 50
    const marginY = 50
    const height = viewBoxHeight - marginY * 2
    const width = viewBoxWidth - marginX * 2

    const dataSvg = d3.select('#dataChart')
        .append('svg')
        .attr('viewBox', [0, 0, viewBoxWidth, viewBoxHeight])
        .append('g')
        .attr('transform', `translate(${marginX}, ${marginY})`);

    Promise.all([
        d3.json('./data/sgmap.json', (data) => ({
            subzone: data["Subzone"],
            planningArea: data["Planning Area"],
            population: +data["Population"]
        })),
        d3.csv('./data/population2021.csv', (data) => ({
            subzone: data["Subzone"],
            planningArea: data["Planning Area"],
            population: +data["Population"]
        })),
    ]).then(data => {

    });
    d3.csv('./data/population2021.csv', (data) => ({
        subzone: data["Subzone"],
        planningArea: data["Planning Area"],
        population: +data["Population"]
    })).then(data => {
        const crimesPerYear = [];
        const crimesNames = new Set();

        let currentYearCrimes = null;
        for (const value of data) {
            if (currentYearCrimes == null) {
                currentYearCrimes = {
                    year: value.year
                };
            } else if (currentYearCrimes.year !== value.year) {
                crimesPerYear.push(currentYearCrimes);
                currentYearCrimes = {
                    year: value.year
                };
            }
            currentYearCrimes[value.crime] = value.count;
            crimesNames.add(value.crime);
        }
        if (currentYearCrimes != null) {
            crimesPerYear.push(currentYearCrimes);
        }

        const stack = d3.stack()
            .keys(crimesNames.values())
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);
        const stackedData = stack(crimesPerYear);



        // Labels
        // x-axis labels
        const xLabels = crimesPerYear.map(d => d.year);
        const xAxis = d3.scaleBand()
            .domain(xLabels)
            .range([0, width])
            .padding([0.2]);
        dataSvg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xAxis).tickSizeOuter(0));

        // y-axis labels
        const yAxis = d3.scaleLinear()
            .domain([0, 20000])
            .range([height, 0]);
        dataSvg.append('g')
            .call(d3.axisLeft(yAxis));

        const colours = d3.schemeCategory10;
        const colourScale = d3.scaleOrdinal()
            .domain(crimesNames)
            .range(colours);



        // Tooltips
        const tooltip = d3.select('#dataChart')
            .append('div')
            .style('opacity', 0)
            .attr('class', 'tooltip')
            .style('background-color', 'lightgray')
            .style('color', 'black')
            .style('border', 'solid')
            .style('border-width', '1px')
            .style('border-radius', '2px')
            .style('padding', '5px')
            .style('position', 'absolute');

        function mouseover(event, d) {
            tooltip.style('opacity', 1);
        }
        function mousemove(event, d) {
            tooltip
                .style('left', `${event.x + 40}px`)
                .style('top', `${event.y - 20}px`)
                .style('text-align', 'center')
                .html(`<b>${d.data.year}</b><br /><b>${d.current}</b><br />${d[1] - d[0]}`)
        }
        function mouseleave(event, d) {
            tooltip.style('opacity', 0);
        }



        // Bars
        dataSvg.append('g')
            // Group same crimes over years together
            .selectAll('g')
            .data(stackedData)
            .enter()
            .append('g')
            .style('fill', d => colourScale(d.key))
            // Drawing crime per year
            .selectAll('rect')
            .data(d => {
                for (const crime of d) {
                    crime.current = d.key
                }
                return d
            })
            .enter()
            .append('rect')
            .attr('x', d => xAxis(d.data.year))
            .attr('y', d => yAxis(d[1]))
            .attr('width', xAxis.bandwidth())
            .attr('height', d => (yAxis(d[0]) - yAxis(d[1])))
            .on('mouseover', mouseover)
            .on('mouseleave', mouseleave)
            .on('mousemove', mousemove);



        // Legend (Broken, drawn out of view box)
        const legend = dataSvg
            .selectAll('.legend')
            .data(colours)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(30, ${i * 22})`);

        legend.append('rect')
            .attr('x', width - 20)
            .attr('width', 20)
            .attr('height', 20)
            .style('fill', (d, i) => colours.slice().reverse()[i]);

        const crimeNamesReverse = [...crimesNames].reverse()
        legend.append('text')
            .attr('x', width + 5)
            .attr('y', 10)
            .attr('dy', '.35rem')
            .attr('text-anchor', 'start')
            .text((d, i) => crimeNamesReverse[i]);
    });*/

    onLoad().catch(console.log)
});

async function onLoad() {
    const viewBoxHeight = 600
    const viewBoxWidth = 860
    const marginX = 50
    const marginY = 50
    const height = viewBoxHeight - marginY * 2
    const width = viewBoxWidth - marginX * 2

    const svg = d3.select('#dataChart')
        .append('svg')
        .attr('viewBox', [0, 0, viewBoxWidth, viewBoxHeight]);

    const [mapJson, populationData] = await Promise.all([
        d3.json('./data/sgmap.json'),
        d3.csv('./data/population2021.csv', (data) => ({
            subzone: data["Subzone"],
            planningArea: data["Planning Area"],
            population: +data["Population"] || 0
        })),
    ]);

    const highestPopulation = populationData.map(d => d.population).reduce((previousResult, currentValue) => Math.max(previousResult, currentValue));
    const colourScale = d3.scaleSequential().domain([0, highestPopulation])
        .interpolator(d3.interpolatePurples);

    const mapProjection = d3.geoMercator()
        .center([103.851959, 1.290270])
        .fitExtent([[marginX, marginY], [width, height]], mapJson);
    const geoPath = d3.geoPath().projection(mapProjection);

    /** @type {Map<string, number>} */
    const populationMap = populationData.reduce((previousResult, currentValue) => previousResult.set(currentValue.subzone.toUpperCase(), currentValue.population),
        new Map());
    console.log(populationMap)

    svg.append('g')
        .attr('id', 'districts')
        .selectAll('path')
        .data(mapJson.features)
        .enter()
        .append('path')
        .attr('class', 'map-area')
        .attr('d', geoPath)
        .attr('fill', (data) => {
            data.population = populationMap.has(data.properties.Name) ? populationMap.get(data.properties.Name) : 0;
            return colourScale(data.population);
        })
}
