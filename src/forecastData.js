import Vue from 'vue'
import moment from 'moment'

export default class ForecastData {

    constructor() {
        this.forecastData = null
        this.hourly = null
        this.daily = null
    }

    getHourlyData(callback) {
        this.fetchForecastData(() => {
            if (this.hourly === null) {

                let dailyData = []
                for (let day of this.forecastData.data.daily.data) {

                    let today = moment(new Date(day.sunriseTime * 1000)).startOf('day')
                    dailyData[today] = {
                        day: today,
                        sunrise: new Date(day.sunriseTime * 1000),
                        sunset: new Date(day.sunsetTime * 1000)
                    }
                }
                this.daily = dailyData

                let hd = this.forecastData.data.hourly.data
                for (let d of hd) {
                    d.sunshinePercentage = 100 - Math.trunc(d.cloudCover * 100)
                    d.localTime = new Date(d.time * 1000)
                    d.precipIntensity = d.precipIntensity || 0
                    if (d.precipProbability < 1) {
                        d.precipProbability = Math.trunc(d.precipProbability * 100)
                    }
                    d.temperature = Math.trunc(d.temperature)
                }
                this.hourly = hd
            }

            callback(this.hourly, this.daily)
        })
    }

    checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response
        }

        var error = new Error(response.statusText)
        error.response = response
        throw error
    }

    clearData() {
        this.hourly = null
        this.daily = null
    }

    fetchForecastData(callback) {
        if (!callback) {
            throw new Error('Callback not specified')
        }

        if (this.forecastData != null) {
            callback()
        }

        var url = '/api/weather'

        if (Vue.config.overrideApiHost) {
            url = 'http://localhost:3131' + url
            console.log('fetching most recent weather forecast data from %o', url)
        }
        fetch(url)
            .then(this.checkStatus)
            .then(r => r.json())
            .then(data => {
                this.forecastData = data
                this.clearData()
                callback()
            })
    }

}
