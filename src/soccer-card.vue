<template>
    <div id='soccercard' >
        <center>⚽</center>
        <div class='soccer_league'>Sounders
            <div v-for="game in gameData.sounders" class='soccer_text_cell o-grid' :class="{'home':game.home,'away':!game.home}">
                <div class='o-grid__cell o-grid__cell--width-35 s_grid_cell' v-html="game.opponent"></div>
                <div class='o-grid__cell o-grid__cell--width-65 s_grid_cell' >{{game.when}}</div>
            </div>
        </div>
        <div class='soccer_league'>Reign
            <div v-for="game in gameData.reign" class='soccer_text_cell o-grid' :class="{'home':game.home,'away':!game.home}">
                <div class='o-grid__cell o-grid__cell--width-35 s_grid_cell' v-html="game.opponent"></div>
                <div class='o-grid__cell o-grid__cell--width-65 s_grid_cell'>{{game.when}}</div>
            </div>
        </div>
    </div>
</template>


<script>

import SoccerData from './soccerData'
import moment from 'moment'


export default {
    name: 'soccercard',
    data() {
        return {
            gameData: [],
            soccerData: new SoccerData(),
            timer: null
        }
    },

    mounted: function() {
        this.fetchData()
        this.timer = setInterval(this.fetchData, 60 * 1000)
    },

    beforeDestroy: function() {
        this.cancelAutoUpdate()
    },

    methods: {

        fetchData: function() {
            this.soccerData.getData((data) => {
                var tempData = {}

                var today = moment(new Date()).startOf('day')

                // Filter games: keep only the next three from today
                for (var name in data) {
                    if (data.hasOwnProperty(name)) {
                        tempData[name] = []

                        var games = data[name]
                        for (var g in games) {
                            let game = games[g]
                            let startTime = moment(game.startTime * 1000)
                            if (today.isSameOrBefore(startTime)) {
                                if (tempData[name].length < 3) {
// console.log('keep %o', game)
                                    tempData[name].push(game)
                                }
                            }
                        }
                    }
                }

                this.gameData = tempData
            })
        },

        cancelAutoUpdate: function() {
            clearInterval(this.timer)
        }
    }
}
</script>

<style>
.soccer_text_cell {
    font-size: .8em;
    font-weight: normal;
}

.soccer_league {
    font-size: .7em;
}

.s_grid_cell {
    padding-left: 10px;
    padding-right: 0;
}

.home {
    color:yellow;
}

.away {
    color:white;
}

#soccercard {
    margin-top: 30px;
    color: white;
    font-weight: bold;
    font-size: 1.8em;
    background-color: black;
    width: inherit;
    padding-right: 0.6em;
}

</style>
