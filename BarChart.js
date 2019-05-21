export default class BarChart {

	constructor(options) {

		let that = this;

		this.data = options.data.filter(function(d) {
			return Math.abs(d.value.difference) > 0.02;
		});

		this.data.sort(function(a, b) {
			return a.value.difference - b.value.difference;
		});

		console.log(this.data);

		this.element = options.element;

		d3.select(window).on('scroll', function() {
			if (d3.select(that.element).node().getBoundingClientRect().top < 0.5 * this.innerHeight) {
				that.svg.selectAll('.bar')
					.transition()
					.duration(1500)
					.ease(d3.easeCubic)
						.attr('x', function(d) {
							return that.xScale(Math.min(d.value.difference, 0));
						})
						.attr('width', function(d) {
							return Math.abs(that.xScale(0) - that.xScale(d.value.difference));
						});
				d3.select(window).on('scroll', null);
			}
		})

		this.draw();
	}

}


BarChart.prototype.draw = function() {

	let that = this;

	this.width = 800;
	this.height = 1500;
	this.margin = 20;

	this.createSVG();
	this.createScales();
	this.createAxes();
	this.createBars();
	this.createTooltip();

	// this.createLegend();

}


BarChart.prototype.createSVG = function() {

	this.svg = d3.select(this.element)
		.append('svg')
			.attr('viewBox', `0 0 ${this.width} ${this.height}`);
			// .attr('width', this.width)
			// .attr('height', this.height);

}

BarChart.prototype.createScales = function() {

	this.xScale = d3.scaleLinear()
		.domain([-0.7, 0.2])
		.range([this.margin, this.width - this.margin]);

	this.yScale = d3.scaleBand()
		.domain(this.data.map(function(d) {
			return d.key;
		}))
		.range([this.margin, this.height - this.margin])
		.padding(0.1);

}


BarChart.prototype.createAxes = function() {

	this.xAxis = d3.axisTop()
    	.scale(this.xScale)
		.tickFormat(d3.format('~%'));

	this.grid = d3.axisTop()
		.scale(this.xScale)
		.tickSize(- this.height + 2*this.margin)
		.tickFormat("");

	this.svg.append('g')
		.call(this.grid)
		.attr('class', 'grid')
		.attr('transform', `translate(0, ${this.margin})`)

	// this.svg.append('line')
	// 		.attr('x1', this.xScale(0))
	// 		.attr('y1', this.margin)
	// 		.attr('x2', this.xScale(0))
	// 		.attr('y2', this.height - this.margin)
	// 		.attr('stroke', 'black')
	// 		.attr('stroke-width', 3);

	this.svg.append('g')
		.call(this.xAxis)
		.attr('class', 'xAxis')
		.attr('transform', `translate(0, ${this.margin})`);

}


BarChart.prototype.createBars = function() {

	let that = this;

	this.bars = this.svg.selectAll('.bar')
		.data(this.data)
		.enter().append('rect')
			.attr('class', 'bar')
			.on('mouseover', function(d) {
				that.tooltip.html(that.getTooltip(d))
					.style('left', function() {
						return `${d3.mouse(this.parentNode)[0]}px`;
					})
					.style('top', function() {
						return `${d3.mouse(this.parentNode)[1]}px`;
					})
				that.tooltip
					.transition()
					.duration(200)
					.style('opacity', .9)
			})
			.on('mouseout', function(d) {
				that.tooltip
					.transition()
					.duration(200)
					.style('opacity', 0)
			})
			.attr('y', function(d) {
				return that.yScale(d.key);
			})
			.attr('height', this.yScale.bandwidth())
			.attr('fill', function(d) {
				if (d.key == "Game of Thrones") return 'darkred';
				return (d.value.difference > 0) ? 'green' : 'crimson';
			})
			.attr('x', this.xScale(0))
			.attr('width', 0)
			.style('cursor', 'pointer');
}


BarChart.prototype.createTooltip = function() {

	this.tooltip = d3.select(d3.select(this.element).node().parentNode).append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0);

}


BarChart.prototype.getTooltip = function(d) {
	return `
		<h3>${d.key}</h3>
		<div>
			<p><b><i>${(d.value.finaleTitle.startsWith("Episode")) ? "Pas de titre" : d.value.finaleTitle}</i></b></p>
			<p>diffusé le ${new Date(d.value.finaleAirdate).toLocaleDateString()}</p>
		</div>
		<div>
			<h4>Note moyenne&nbsp;: ${d3.format('.2~')(d.value.averageRating)}/10</h4>
		</div>
		<div>
			<h4>Note du final&nbsp;: ${d3.format('.2~')(d.value.finaleRating)}/10</h4>
			<p>(${d3.format('.1~%')(Math.abs(d.value.difference))} ${(d.value.difference > 0) ? "meilleur" : "moins bien"})</p>
		</div>
	`;
}
