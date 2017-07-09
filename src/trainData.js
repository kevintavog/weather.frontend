import Vue from 'vue'
import moment from 'moment'

export default class TrainData {

    constructor() {
    }

    getData(callback) {
        this.fetchTrainData((response) => {

            // The silly device displaying this page seems to lose time, even with it set to
            // keep the time in sync automatically. Sigh - use the server time instead of 'now'
            let serverTimestamp = new Date(response['timestamp'] * 1000)

            let arrivalData = []
            for (let a of response.data.data.entry.arrivalsAndDepartures) {

                let diff = 0
                let type = 'scheduled'
                let lastUpdated = 0
                if (a.predicted) {
                    type = 'predicted'
                    diff = (new Date(a.predictedArrivalTime) - serverTimestamp) / 1000
                    lastUpdated = (serverTimestamp - new Date(a.lastUpdateTime)) / 1000
                } else {
                    diff = (new Date(a.scheduledArrivalTime) - serverTimestamp) / 1000
                }

                let arrivalTime = ''
                let timeAway = ''
                if (diff < 60) {
                    timeAway = ''
                    arrivalTime = 'now'
                } else {
                    timeAway = '' + Math.round(diff / 60)
                    arrivalTime = moment(serverTimestamp).add(diff, 's').format('HH:mm')
                }

                let distanceAway = this.roundTo(a.distanceFromStop * 0.00062137, 1)

                arrivalData.push({
                    type: type,
                    timeAway: timeAway,
                    stopsAway: a.numberOfStopsAway,
                    arrivalTime: arrivalTime,
                    distanceAway: distanceAway,
                    lastUpdated: Math.round(lastUpdated / 60)})

// console.log('%o: %o min, %o stops away, %o miles away (last updated %o min ago)',
//     type,
//     timeAway,
//     a.numberOfStopsAway,
//     distanceAway,
//     Math.round(lastUpdated / 60))

            }

            callback(arrivalData)
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

    fetchTrainData(callback) {
        if (!callback) {
            throw new Error('Callback not specified')
        }

        var url = '/api/stop'
        if (Vue.config.overrideApiHost) {
            url = 'http://localhost:3131' + url
            console.log('%s: fetching most recent stop data from %o', moment(new Date()).format('HH:mm:ss.SSS'), url)
        }

        fetch(url)
            .then(this.checkStatus)
            .then(r => r.json())
            .then(data => {
                callback(data)
            })
    }

    roundTo(n, digits) {
        if (digits === undefined) {
            digits = 0;
        }

        var multiplicator = Math.pow(10, digits);
        n = parseFloat((n * multiplicator).toFixed(11));
        return Math.round(n) / multiplicator;
    }

}
