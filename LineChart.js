export default class LineChart {

	constructor(options) {

		const order = ["Game of Thrones", "Dexter", "How I Met Your Mother", "Pretty Little Liars", "True Blood", "Mon oncle Charlie", "Scrubs", "House of Cards"];

		this.data = d3.nest()
			.key(function(d) {
				return d.title;
			})
			.entries(options.data)
			.filter(function(d) {
				let mean = d3.mean(d.values, function(d) {
					return +d.rating;
				});
				return d.values[d.values.length - 1].rating < 0.8 * mean;
			});

		this.data.sort(function(a, b) {
			return order.indexOf(a.key) - order.indexOf(b.key);
		})
		console.log(this.data)

		this.element = options.element;

		this.draw();
	}

}


LineChart.prototype.draw = function() {

	let that = this;

	this.width = 800;
	this.height = 500;
	this.margin = 20;

	this.createSVG();
	this.createScales();
	this.createAxes();
	this.createLines();

	this.createTooltip();

}


// LineChart.prototype.createMenu = function() {
//
// 	let that = this;
//
// 	this.menu = d3.select(this.element)
// 		.append('select')
// 		.on('change', function() {
// 			let show = d3.select(d3.event.target).property('value');
// 			that.update(show);
// 		});
//
// 	this.menu.append('option')
// 		.attr('value', "Sélectionnez une série")
// 		.html("Sélectionnez une série");
//
// 	for (let show of this.data) {
// 		this.menu.append('option')
// 			.attr('value', show.key)
// 			.html(show.key);
// 	}
//
//
// }


LineChart.prototype.createSVG = function() {

	this.svg = d3.select(this.element)
		.append('svg')
			.attr('viewBox', `0 0 ${this.width} ${this.height}`);
			// .attr('width', this.width)
			// .attr('height', this.height);

}

LineChart.prototype.createScales = function() {

	this.xScale = d3.scaleLinear()
		.domain([0, 1])
		.range([this.margin, this.width - this.margin]);

	this.yScale = d3.scaleLinear()
		.domain([0, 10])
		.range([this.height - this.margin, this.margin]);

}


LineChart.prototype.createAxes = function() {

	this.xAxis = d3.axisBottom()
    	.scale(this.xScale)
		.tickSize(0)
		.tickFormat("");

	this.yAxis = d3.axisLeft()
    	.scale(this.yScale);

	this.grid = d3.axisLeft()
		.scale(this.yScale)
		.tickSize(- this.width + 2*this.margin)
		.tickFormat("");

	this.svg.append('g')
		.call(this.grid)
		.attr('class', 'grid')
		.attr('transform', `translate(${this.margin}, 0)`);

	this.svg.append('g')
		.call(this.xAxis)
		.attr('transform', `translate(0, ${this.height - this.margin})`);

	this.svg.append('g')
		.call(this.yAxis)
		.attr('transform', `translate(${this.margin}, 0)`);

}


LineChart.prototype.createLines = function() {

	console.log(this.data);

	let that = this;

	this.seasonGuides = that.svg.append('g');
	this.lines = this.svg.append('g');
	this.highlightedEpisodes = this.svg.append('g');

	this.data.forEach(function(d) {

		let title = d.key;
		let episodes = d.values;
		let nbSeasons = episodes[episodes.length - 1].season;
		let nbEpisodes = episodes.length;

		let nbEpisodesPerSeason = d3.nest()
			.key(function(d) {
				return d.season;
			})
			.rollup(function(v) {
				return v.length;
			})
			.entries(episodes);

		let seasonGuides = that.seasonGuides.append('g')
			.attr('class', title.replace(/ /g, "-").toLowerCase())
			.style('opacity', 0);

		let counter = 0;
		for (let i = 0; i < nbSeasons; i++) {

			counter += nbEpisodesPerSeason[i].value;

			if (i < nbSeasons - 1) {
				seasonGuides.append('line')
					.attr('x1', that.xScale((counter + 0.5) / nbEpisodes))
					.attr('x2', that.xScale((counter + 0.5) / nbEpisodes))
					.attr('y1', that.yScale(0))
					.attr('y2', that.yScale(10))
					.attr('stroke', '#424242')
					.attr('stroke-width', 2)
					.attr('stroke-dasharray', '5 5')
					.style('opacity', 0.5);
			}

			seasonGuides.append('text')
				.attr('class', 'textSeason')
				.attr('x', that.xScale((counter - 0.5 * nbEpisodesPerSeason[i].value + 0.5) / nbEpisodes))
				.attr('y', that.yScale(1.2))
				.attr('text-anchor', 'middle')
				.attr('fill', '#424242')
				.text(i + 1);

		}

		let lineData = d3.line()
			.x(function(d, i) {
				return that.xScale((i + 1) / nbEpisodes);
			})
			.y(function(d) {
				return that.yScale(+d.rating);
			})
			.curve(d3.curveCatmullRom);

		let line = that.lines.append('path')
			.datum(episodes)
			.attr('class', title.replace(/ /g, "-").toLowerCase())
			.attr('d', lineData)
			.attr('stroke', 'crimson')
			.attr('stroke-width', 2)
			.attr('stroke-linecap', 'round')
			.attr('fill', 'none');

		let length = line.node().getTotalLength();
		line
			.attr('stroke-dasharray', `${length} ${length}`)
			.attr('stroke-dashoffset', length);

		let maxRating = d3.max(episodes, function(d) {
			return d.rating;
		});
		let highestRatedEpisodes = episodes.filter(function(e) {
			return e.rating == maxRating;
		})

		let minRating = d3.min(episodes, function(d) {
			return d.rating;
		});
		let lowestRatedEpisodes = episodes.filter(function(e) {
			return e.rating == minRating;
		})

		let highlightedEpisodesData = highestRatedEpisodes.concat(lowestRatedEpisodes);

		let highlightedEpisodes = that.highlightedEpisodes.append('g')
			.attr('class', title.replace(/ /g, "-").toLowerCase())
			.style('opacity', 0)
			.style('visibility', 'hidden');

		highlightedEpisodes.selectAll('circle')
			.data(highlightedEpisodesData)
			.enter().append('circle')
				.attr('cx', function(d) {
					return that.xScale((episodes.findIndex(function(e) {
						return e.episode == d.episode;
					}) + 1) / nbEpisodes);
				})
				.attr('cy', function(d) {
					return that.yScale(d.rating);
				})
				.attr('r', 10)
				.attr('fill', 'white')
				.attr('stroke', 'crimson')
				.attr('stroke-width', 4);
	});

}


LineChart.prototype.update = function(title) {

	let that = this;

	this.lines.selectAll('path')
		.attr('stroke-dashoffset', 0)
		.attr('stroke-dasharray', 'none');

	this.seasonGuides.selectAll('g')
		.transition()
		.duration(1000)
			.style('opacity', 0);

	this.highlightedEpisodes.selectAll('g')
		.transition()
		.duration(1000)
			.style('opacity', 0)
			.style('visibility', function() {
				return (d3.select(this).style('opacity') != 1) ? 'hidden' : 'visible';
			});

	this.highlightedEpisodes.selectAll('circle')
		.on('mouseover', function(d) {
			return null;
		})
		.on('mouseout', function(d) {
			return null;
		})
		.style('cursor', 'auto');

	this.lines.selectAll('path')
		.transition()
		.duration(1000)
			.style('opacity', 0);


	this.svg.selectAll(`.${title.replace(/ /g, "-").toLowerCase()}`)
		.transition()
		.duration(1000)
			.style('opacity', 1)
			.style('visibility', 'visible');

	this.lines.select(`path.${title.replace(/ /g, "-").toLowerCase()}`)
		.transition()
		.duration(1000)
			.attr('stroke-width', 4)
			.attr('stroke', 'crimson')
			.style('opacity', 1);

	this.highlightedEpisodes.select(`.${title.replace(/ /g, "-").toLowerCase()}`).selectAll('circle')
		.on('mouseover', function(d) {
			let boundingRect = d3.select(that.element).node().getBoundingClientRect();
			let ratio = boundingRect.width / that.width;
			let offset = boundingRect.top;
			that.tooltip.html(that.getTooltip(d))
				.style('left', `${parseFloat(d3.select(d3.event.target).attr('cx')) * ratio}px`)
				.style('top', `${offset + parseFloat(d3.select(d3.event.target).attr('cy')) * ratio + 25}px`);
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
		.style('cursor', 'pointer');

}


LineChart.prototype.createTooltip = function() {

	this.tooltip = d3.select(this.element).append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0);

}


LineChart.prototype.getTooltip = function(d) {
	return `
		<div>
			<h3><i>${(d.episode.startsWith("Episode")) ? "Pas de titre" : d.episode}</i></h3>
			<p>diffusé le ${new Date(d.airdate).toLocaleDateString()}</p>
		</div>
		<div>
			<h4>Note&nbsp;: ${d3.format('.2~')(d.rating)}/10</h4>
		</div>
	`;
}
