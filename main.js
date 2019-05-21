import BarChart from './BarChart.js';
import LineChart from './LineChart.js';

var barChart, lineChart;

d3.formatDefaultLocale({
	'decimal': ',',
	'thousands': ' ',
	'grouping': [3],
	'currency': ['$', ''],
	'percent': ' %'
});

d3.tsv('episodes.tsv')
	.then(function(data) {
		console.log(data)
		let nested = d3.nest()
			.key(function(d) {
				return d.title;
			})
			.rollup(function(v) {
				let mean = d3.mean(v, function(d) {
					return +d.rating;
				});
				let max = d3.max(v, function(d) {
					return +d.rating;
				});
				let finale = v[v.length - 1];
				return {
					averageRating: mean,
					finaleRating: +finale.rating,
					difference: (+finale.rating - mean) / mean,
					finaleTitle: finale.episode,
					finaleAirdate: finale.airdate,
					max: max
				};
			})
			.entries(data);

		draw(nested, data);

	});

function draw(nested, data) {

	barChart = new BarChart({
		data: nested,
		element: '#barChart'
	});

	lineChart = new LineChart({
		data: data,
		element: '#lineChart'
	});
}

window.onload = function() {

	const scroller = scrollama();

	scroller.setup({
		container: '#scroll',
		graphic: '.chart',
		text: '.text',
		step: '.text .step',
		offset: 0.6
	})
	.onStepEnter(handleStepEnter)
	.onStepExit(handleStepExit);

	function handleStepEnter(response) {

		d3.select(response.element).classed('active', true);

		if (response.index > 8) return null;

		if (response.index == 0) {
			lineChart.lines.selectAll('path').each(function(d, i) {
				d3.select(this).transition()
					.duration(3000)
					.delay(i * 200)
					.attr('stroke-dashoffset', 0);
			});
		}
		else {
			lineChart.update(lineChart.data[response.index - 1].key)

		}

	}


	function handleStepExit(response) {
		d3.select(response.element).classed('active', false);
	}

}
