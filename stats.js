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
};

function prepareData(result) {
	return result.data.map(item => {
		item.date = item.timestamp.split('T')[0];

		return item;
	});
}

// показать значение метрики за несколько день
function showMetricByPeriod() {
}

// показать сессию пользователя
function showSession() {
}

// сравнить метрику в разных срезах
function compareMetric() {
}

// рассчитать метрику за выбранный день
function calcMetricByDate(data, page, name, date) {
	let sampleData = data
					.filter(item => item.page == page && item.name == name && item.date == date)
					.map(item => item.value);

	console.log(`${date} ${name}: ` +
		`p25=${quantile(sampleData, 0.25)} p50=${quantile(sampleData, 0.5)} ` +
		`p75=${quantile(sampleData, 0.75)} p90=${quantile(sampleData, 0.95)} ` +
		`hits=${sampleData.length}`);
}

fetch('https://shri.yandex/hw/stat/data?counterId=1f596567-6b37-4697-b7f6-c3181851944a')
	.then(res => res.json())
	.then(result => {
		let data = prepareData(result);

		calcMetricByDate(data, 'send test', 'connect', '2021-07-10');
		calcMetricByDate(data, 'send test', 'ttfb', '2021-07-10');
		calcMetricByDate(data, 'send test', 'load', '2021-07-10');
		calcMetricByDate(data, 'send test', 'load', '2021-07-10');
		calcMetricByDate(data, 'send test', 'load', '2021-07-10');
		// добавить свои сценарии, реализовать функции выше
		// ...
	});
