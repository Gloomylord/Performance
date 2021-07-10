const fetch = require('node-fetch');

function quantile(arr, q) {
    const sorted = arr.sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sorted[base + 1] !== undefined) {
        return Math.floor(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
    } else {
        return Math.floor(sorted[base]);
    }
}

function prepareData(result) {
	return result.data.map(item => {
		item.date = item.timestamp.split('T')[0];

		return item;
	});
}

// показать значение метрики за несколько дней
function showMetricByPeriod(data, page, name, dateStart, dateEnd) {
	let start = new Date(dateStart);
	let end = new Date(dateEnd);
	let sampleData = data
		.filter(item => item.page == page && item.name == name
			&& new Date(item.date) <= end && new Date(item.date) >= start)
		.map(item => item.value);

	const res = {
		name,
		dateStart,
		dateEnd,
		25: quantile(sampleData, 0.25),
		50: quantile(sampleData, 0.5),
		75: quantile(sampleData, 0.75),
		90: quantile(sampleData, 0.90),
		length: sampleData.length
	};

	console.log(`${dateStart} - ${dateEnd}  ${name}: ` +
		`p25=${res[25]} p50=${res[50]} ` +
		`p75=${res[75]} p90=${res[90]} ` +
		`hits=${sampleData.length}`);
	return res;
}

// показать сессию пользователя
function showSession(data, sessionId) {
	const res = {};
	data
		.filter(item => item.requestId == sessionId)
		.forEach(value => res[value.name] = value.value);
	console.log(JSON.stringify(res));
}

// сравнить метрику в разных срезах
function compareMetric(data, page, name, dateStart1, dateEnd1, dateStart2, dateEnd2) {
	let item1 = showMetricByPeriod(data, page, name, dateStart1, dateEnd1);
	let item2 = showMetricByPeriod(data, page, name, dateStart2, dateEnd2);
	console.log(`diff  ${name}: ` +
		`p25=${item1[25] - item2[25]} p50=${item1[50]- item2[50]} ` +
		`p75=${item1[75] - item2[75]} p90=${item1[90] - item1[90]} `);
}

function calcMetricByDate(data, page, name, date) {
	let sampleData = data
					.filter(item => item.page == page && item.name == name && item.date == date)
					.map(item => item.value);

	console.log(`${date} ${name}: ` +
		`p25=${quantile(sampleData, 0.25)} p50=${quantile(sampleData, 0.5)} ` +
		`p75=${quantile(sampleData, 0.75)} p90=${quantile(sampleData, 0.95)} ` +
		`hits=${sampleData.length}`);
}

fetch('https://shri.yandex/hw/stat/data?counterId=4cece4a5-6ad0-4d6f-891c-55289d1087c8')
	.then(res => (res.json()))
	.then(result => {
		let data = prepareData(result);

		calcMetricByDate(data, 'send test', 'connect', '2021-07-10');
		calcMetricByDate(data, 'send test', 'ttfb', '2021-07-10');
		calcMetricByDate(data, 'send test', 'load', '2021-07-10');
		calcMetricByDate(data, 'send test', 'DOMContentLoaded', '2021-07-10');
		calcMetricByDate(data, 'send test', 'first-paint', '2021-07-10');
		showSession(data, '794980966817');

		showMetricByPeriod(data,'send test', 'first-paint', '2021-07-10', '2021-07-11');
		compareMetric(data,'send test', 'first-paint',
			'2021-07-10', '2021-07-21', '2021-07-10', '2021-07-11',);
	});
