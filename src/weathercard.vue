<template>
    <div id="weathercard" class='o-grid' >
        <div class='w_cell o-grid__cell o-grid__cell--width-15'>
            <div class='w_cell o-grid__cell w_day'>{{day}}</div>
            <div class='w_cell o-grid__cell w_text' v-html="maxTemperature"></div>
            <div class='w_cell o-grid__cell w_text' v-html="rainSunshine"></div>
        </div>
        <div class='w_cell o-grid__cell--width-80 canvas_cell'>
            <canvas class='weather-chart' ref='canvas'> </canvas>
        </div>
    </div>
</template>


<script>

import ForecastData from './forecastData'
import Chart from 'chart.js'
import moment from 'moment'

export default {
    name: 'weathercard',
    data() {
        return {
            timer: null,
            daysOfTheWeek: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            dayOneEndOffset: [6, 6, 5, 4, 3, 3, 3],
            dayTwoEndOffset: [2, 5, 4, 3, 2, 2, 2],
            forecastData: new ForecastData(),

            parentNode: null,

            day: '',
            maxTemperature: '',
            rainSunshine: '',

            // Chart.js
            canvas: null,
            chart: null,
            chartData: { },
            options: {
                animation: {
                    duration: 0
                },
                responsive:true,
                responsiveAnimationDuration: 0,
                maintainAspectRatio:false,
                legend: {
                    labels: {
                        usePointStyle: true,
                    },
                },
                scales: {
                    yAxes: [{
                        type: "linear",
                        display: true,
                        position: "left",
                        id: "y-axis-100",
                        ticks: {
                            min: 0,
                            max: 100
                        }
                    }, {
                        type: "linear",
                        display: true,
                        position: "right",
                        id: "y-axis-1",
                        gridLines: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                        },
                        ticks: {
                            min: 0,
                            max: 0.06
                        }
                    }],
                }
            },
        }
    },

    props: [
        'dayOffset', 'dayEndOffset'
    ],

    mounted: function() {
        this.initializeCanvas()
        this.fetchData()
        this.timer = setInterval(this.fetchData, 15 * 60 * 1000)
    },

    beforeDestroy: function() {
        this.cancelAutoUpdate()
    },

    methods: {

        initializeCanvas: function() {
            this.canvas = this.$refs['canvas']
            this.parentNode = this.canvas.parentNode

            Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, 255)'
            this.renderChart();
        },

        renderChart: function() {
            if (this.chart == null) {
                this.chart = new Chart(
                    this.canvas, {
                        type: 'bar',
                        data: this.chartData,
                        options: this.options,
                    });
            } else {
                this.chart.update(0)
            }

        },

        isPastLastHour: function(allHourlyData, dailyData, startHour) {

        },


        getForecastSlice: function(allHourlyData, dailyData) {
            var startHour = 0
            if (this.dayOffset >= 0) {
                startHour = this.dayOffset * 24
            } else if (this.dayEndOffset >= 0) {
                var currentDay = allHourlyData[0].localTime.getDay()
                if (this.dayEndOffset == 0) {
                    startHour = this.dayOneEndOffset[currentDay] * 24
                } else if (this.dayEndOffset == 1) {
                    startHour = this.dayTwoEndOffset[currentDay] * 24
                } else {
                    throw new Error('dayEndOffset can only be 1 or 2')
                }

            } else {
                throw new Error('Either "dayOffset" or "dayEndOffset" must be defined')
            }

            // Snap back to the start of the day
            while (startHour != 0 && this.getHour(allHourlyData[startHour]) != 0) {
                --startHour
            }

            var endHour = Math.min(startHour + 24, allHourlyData.length)
            var slice = allHourlyData.slice(startHour, endHour)

            let day = moment(new Date(allHourlyData[endHour].time * 1000)).startOf('day')
            let dayInfo = dailyData[day]

            let sunriseHour = moment(dayInfo.sunrise).startOf('hour').hour()
            let sunsetHour = moment(dayInfo.sunset).startOf('hour').hour() + 1

            // Only chart from 'now' to sunset.
            if (this.dayOffset == 0) {
                var firstDay = [sunsetHour - sunriseHour]

                // Becuase we don't have data for earlier than 'now', mark the missing
                // data as present, but with no value
                let firstHour = this.getHour(allHourlyData[0])
                for (let i = 0; i < firstHour; i++) {
                    firstDay[i] = NaN
                }

                // 'allHourlyData' starts at the 'now' hour, rather than the start of the day
                for (let i = firstHour; i < sunsetHour; i++) {
                    firstDay[i] = allHourlyData[i - firstHour]
                }

                slice = firstDay.slice(sunriseHour, sunsetHour)

            } else {
                slice = slice.slice(sunriseHour, sunsetHour)
            }

            return slice
        },

        fetchData: function() {
            this.forecastData.getHourlyData((allHourlyData, dailyData) => {

                var hourlyData = this.getForecastSlice(allHourlyData, dailyData)

                this.chartData.labels = hourlyData.map(d => d ? d.localTime.getHours().toString() : '')
                this.day = this.getDay(hourlyData[hourlyData.length - 1])

                var minY = 0
                var maxY = 100
                var maxTemp = hourlyData[hourlyData.length - 1].temperature
                var maxSunshine = 0
                var maxRainChance = 0
                var totalRainAmount = 0
                hourlyData.forEach( d => {
                    if (d) {
                        minY = Math.min(minY, d.temperature)
                        minY = Math.min(minY, d.sunshinePercentage)
                        minY = Math.min(minY, d.precipProbability)

                        maxY = Math.max(maxY, d.temperature)
                        maxY = Math.max(maxY, d.sunshinePercentage)
                        maxY = Math.max(maxY, d.precipProbability)

                        maxTemp = Math.max(maxTemp, d.temperature)
                        maxSunshine = Math.max(maxSunshine, d.sunshinePercentage)
                        maxRainChance = Math.max(maxRainChance, d.precipProbability)
                        totalRainAmount += d.precipIntensity

                        // The graph looks better if the rain columns appear only
                        // when they're non-zero
                        if (d.precipProbability === 0 && d.precipIntensity === 0) {
                            d.precipProbability = d.precipIntensity = NaN
                        }

                    }
                })

                this.options.scales.yAxes[0].ticks.min = minY
                this.options.scales.yAxes[0].ticks.max = maxY

                this.chartData.datasets = []

                this.chartData.datasets.push({
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderColor: 'rgba(255, 2, 2, 0.9)',
                    data: hourlyData.map(d => d.temperature),
                    fill: false,
                    label: 'Temperature (F)',
                    pointStyle: 'circle',
                    pointRadius: 5,
                    type: 'line',
                    yAxisID: "y-axis-100",
                })

                if (maxRainChance > 0) {
                    this.chartData.datasets.push({
                       backgroundColor: 'rgba(0, 0, 0, 0)',
                       borderColor: 'rgba(153, 102, 255, 0.9)',
                       data: hourlyData.map(d => d.precipProbability),
                       fill: false,
                       label: 'Rain %',
                       pointRadius: 5,
                       pointStyle: 'triangle',
                       type: 'line',
                   })
                }

                if (totalRainAmount > 0) {
                    this.chartData.datasets.push({
                       backgroundColor: 'rgba(0, 0, 255, 0.7)',
                       borderColor: 'rgba(0, 0, 255, 0.4)',
                       data: hourlyData.map(d => d.precipIntensity),
                       label: 'Rain amount (in)',
                       pointStyle: 'rect',
                       type: 'bar',
                       yAxisID: "y-axis-1",
                   })
                }

                this.chartData.datasets.push({
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 0.9)',
                    data: hourlyData.map(d => d.sunshinePercentage),
                    fill: true,
                    label: 'Sunshine %',
                    pointRadius: 5,
                    pointStyle: 'star',
                    type: 'line',
                    yAxisID: "y-axis-100",
                })

                this.renderChart()
                this.maxTemperature = '' + maxTemp + '°&nbsp;🌡️'

                if (maxRainChance < 1) {
                    this.rainSunshine = maxSunshine + '%&nbsp;☀️'
                } else {
                    this.rainSunshine = maxRainChance + '%&nbsp;🌧️ ' + this.roundTo(totalRainAmount, 2) + '"'
                }
            })
        },

        getDayAndHour(hourlyItem) {
            return [hourlyItem.localTime.getHours().toString(), this.daysOfTheWeek[hourlyItem.localTime.getDay()]]
        },

        getHour(hourlyItem) {
            return hourlyItem.localTime.getHours()
        },

        getDay(hourlyItem) {
            return this.daysOfTheWeek[hourlyItem.localTime.getDay()]
        },

        cancelAutoUpdate: function() {
            clearInterval(this.timer)
        },

        roundTo(n, digits) {
            if (digits === undefined) {
                digits = 0;
            }

            var multiplicator = Math.pow(10, digits);
            n = parseFloat((n * multiplicator).toFixed(11));
            return Math.round(n) / multiplicator;
        }
    }
}
</script>

<style>
#weathercard {
    color: white;
    background-color: black;
    width: inherit;
    height: 100%;
    padding-right: 0.6em;
}

.weather-chart {
    background-color: black;
}

.canvas_cell {
    position: relative;
    height:48vh;
    width:30vw;
}

.w_cell {
    padding-right: 0.1em;
    padding-left: 0.1em;
}

.w_text {
    font-size: 1.5em;
}

.w_day {
    font-weight: bold;
    font-size: 1.8em;
}

</style>
