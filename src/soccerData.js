import Vue from 'vue'
import moment from 'moment'

export default class SoccerData {


    fetchGameData(callback) {
        if (!callback) {
            throw new Error('Callback not specified')
        }

        callback(this.gameData)
    }

    getData(callback) {
        this.fetchGameData((response) => {

                let reign = []
                for (let g of response.reign) {
                    g.home = g.homeTeam === 'Reign'
                    g.opponent = g.home ? g.awayTeam : g.homeTeam
                    let startTime = moment(g.startTime * 1000)
                    g.when = startTime.format('ddd MMM D, kk:mm')
                    reign.push(g)
                }

                let sounders = []
                for (let g of response.sounders) {
                    g.home = g.homeTeam === 'Sounders'
                    g.opponent = g.home ? g.awayTeam : g.homeTeam
                    let startTime = moment(g.startTime * 1000)
                    g.when = startTime.format('ddd MMM D, kk:mm')
                    sounders.push(g)
                }

            callback({ sounders: sounders, reign: reign })
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

    fetchGameData(callback) {
        if (!callback) {
            throw new Error('Callback not specified')
        }

        var url = '/api/soccer'
        if (Vue.config.overrideApiHost) {
            url = 'http://localhost:3131' + url
            console.log('%s: fetching soccer data from %o', moment(new Date()).format('HH:mm:ss.SSS'), url)
        }

        fetch(url)
            .then(this.checkStatus)
            .then(r => r.json())
            .then(data => {
                callback(data)
            })
    }

}
