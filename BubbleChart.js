export default class BubbleChart {

	constructor(options) {
		this.data = options.data.filter(function(e) {
			return (e.value.finaleRating != 0) || (e.value.finaleRating == NaN);
		});

		this.element = options.element;

		console.log(this.data.filter(function(e) {
			return e.value.finaleTitle.toLowerCase().includes("end");
		}));

		console.log(this.data.filter(function(e) {
			return e.value.finaleTitle.toLowerCase().includes("final");
		}));

		console.log(this.data.filter(function(e) {
			return e.value.finaleTitle.toLowerCase().includes("last");
		}));

		console.log(this.data.filter(function(e) {
			return e.value.pilotTitle == "Pilot";
		}));

		this.draw();
	}

}


BubbleChart.prototype.draw = function() {

	let that = this;

	this.width = 1200;
	this.height = 800;
	this.margin = 50;

	this.createSVG();
	this.createScales();
	this.createAxes();
	this.createLines();
	this.createBubbles();
	//this.createTooltip();

	// this.createLegend();

}


BubbleChart.prototype.createSVG = function() {

	this.svg = d3.select(this.element)
		.append('svg')
			//.attr('viewBox', `0 0 ${this.width} ${this.height}`);
			.attr('width', this.width)
			.attr('height', this.height);

}

BubbleChart.prototype.createScales = function() {

	this.xScale = d3.scaleLinear()
		//.exponent(Math.E)
		.domain([0, 10])
		.range([this.margin, this.height - this.margin]);

	this.yScale = d3.scaleLinear()
		.domain([0, 10])
		.range([this.height - this.margin, this.margin]);

}


BubbleChart.prototype.createAxes = function() {
	this.xAxis = d3.axisBottom()
    	.scale(this.xScale);

	this.yAxis = d3.axisLeft()
    	.scale(this.yScale);

	this.svg.append('g')
		.call(this.xAxis)
		.attr('transform', `translate(0, ${this.height - this.margin})`);

	this.svg.append('g')
		.call(this.yAxis)
		.attr('transform', `translate(${this.margin}, 0)`);
}


BubbleChart.prototype.createBubbles = function() {

	console.log(this.data)

	let that = this;

	this.bubbles = this.svg.selectAll('circle')
		.data(this.data)
		.enter().append('circle')
			.on('mouseover', function(d) {
				console.log(d.key, d.value)
			})
			.attr('cx', function(d) {
				return that.xScale(d.value.averageRating);
			})
			.attr('cy', function(d) {
				return that.yScale(d.value.finaleRating);
			})
			.attr('r', 5)
			.attr('fill', function(d) {
				return (d.value.ratio > 1) ? 'green' : 'red';
			})
			//.style('cursor', 'pointer');
}

BubbleChart.prototype.createLines = function() {

	this.svg.append('line')
		.attr('x1', this.xScale(0))
		.attr('y1', this.yScale(0))
		.attr('x2', this.xScale(10))
		.attr('y2', this.yScale(10))
		.attr('stroke', 'purple')
		.attr('stroke-width', 3)

	this.svg.append('line')
		.attr('x1', this.xScale(0))
		.attr('y1', this.yScale(0))
		.attr('x2', this.xScale(10))
		.attr('y2', this.yScale(11))
		.attr('stroke', 'lightgreen')
		.attr('stroke-width', 3)

	this.svg.append('line')
		.attr('x1', this.xScale(0))
		.attr('y1', this.yScale(0))
		.attr('x2', this.xScale(10))
		.attr('y2', this.yScale(9.1))
		.attr('stroke', 'red')
		.attr('stroke-width', 3)

	this.svg.append('line')
		.attr('x1', this.xScale(0))
		.attr('y1', this.yScale(0))
		.attr('x2', this.xScale(10))
		.attr('y2', this.yScale(12))
		.attr('stroke', 'green')
		.attr('stroke-width', 3)

	this.svg.append('line')
		.attr('x1', this.xScale(0))
		.attr('y1', this.yScale(0))
		.attr('x2', this.xScale(10))
		.attr('y2', this.yScale(8.3))
		.attr('stroke', 'darkred')
		.attr('stroke-width', 3)

	this.xAxis = d3.axisBottom()
    	.scale(this.xScale);

	this.yAxis = d3.axisLeft()
    	.scale(this.yScale);

	this.svg.append('g')
		.call(this.xAxis)
		.attr('transform', `translate(0, ${this.height - this.margin})`);

	this.svg.append('g')
		.call(this.yAxis)
		.attr('transform', `translate(${this.margin}, 0)`);
}



BubbleChart.prototype.update = function(measure) {

	let that = this;

	let info = this.info['$' + measure][0];

	d3.select('h2')
		.html(`${info.description} en ${info.annee} (${info.source})`);

	let min = d3.min(this.data, function(d) {
		return +d[measure];
	});
	let max = d3.max(this.data, function(d) {
		return +d[measure];
	});
	let step = (max - min) / 8;

	this.color
		.domain((info.direction == '+') ? d3.range(min, max + 1, step) : d3.range(max, min - 1, -step));

	console.log(this.color.domain())

	this.BubbleChart
		.value(function(d) {
			console.log(+d.properties[measure])
			return +d.properties[measure];
		});

	this.features = this.BubbleChart(this.regions, this.regions.objects.regions.geometries).features;

	this.map.data(this.features)

	this.map
		.on('mouseover', function(d) {
			that.tooltip.html(`
				<h3>${d.properties.region}</h3>
				<p>${d.properties[measure]} ${that.info['$' + measure][0].unite}</p>
			`)
			// .style('left', function() {
			// 	return `${that.path.centroid(d)[0]}px`;
			// })
			// .style('top', function() {
			// 	return `${that.path.centroid(d)[1]}px`;
			// })
			that.tooltip
				.transition()
				.duration(200)
				.style('opacity', .9)
		})
		.on('mousemove', function(d) {
			that.tooltip
				.style('left', function() {
					return `${d3.mouse(this)[0]}px`;
				})
				.style('top', function() {
					return `${d3.mouse(this)[1]}px`;
				});
		})
		.transition()
		.duration(1000)
		.attr('fill', function(d) {
			return that.color(+d.properties[measure]);
		})
		.attr('d', this.BubbleChart.path);

		//this.spinner.stop();

}


BubbleChart.prototype.createTooltip = function() {

	this.tooltip = d3.select('body').append('div')
	    .attr('class', 'tooltip')
	    .style('opacity', 0);

}


BubbleChart.prototype.createLegend = function() {

	this.svg.append('text')
		.attr('x', this.margin)
		.attr('y', this.margin - 25)
		.attr('text-anchor', 'middle')
		.style('font-style', 'italic')
		.text('Fréquence');

	this.svg.append('text')
		.attr('x', this.width - this.margin + 10)
		.attr('y', this.height - this.margin + 30)
		.attr('text-anchor', 'end')
		.style('font-style', 'italic')
		.text('Année');

	this.legend = this.svg.append('g')
		.attr('class', 'legend')
		.style('opacity', 0);

	for (let i = 0; i < 2; i++) {
		this.legend.append('rect')
			.attr('x', this.width/2 - 180 + 300*i)
			.attr('y', this.margin - 37)
			.attr('width', 40)
			.attr('height', 3)
			.attr('fill', (i == 0) ? this.colorWinner : this.colorAudience);

		this.legend.append('text')
			.attr('x', this.width/2 - 130 + 300*i)
			.attr('y', this.margin - 30)
			.attr('text-anchor', 'start')
			.attr('alignment-baseline', 'central')
			.text((i == 0) ? 'Films nommés aux Oscars' : 'Films du top 20 au box office');
	}

}
