<template>
    <div id='traincard' >
        <center>🚆</center>
        <div class='text_cell o-grid'>
            <div class='o-grid__cell o-grid__cell--width-30'><center>⏰</center></div>
            <div class='o-grid__cell o-grid__cell--width-30'><center>🕙</center></div>
            <div class='o-grid__cell o-grid__cell--width-30'><center>Δ</center></div>
        </div>
        <div v-for="(arrival,index) in arrivalData" class='text_cell o-grid' :class="{'even':index % 2 == 0,'odd':!(index % 2 == 0)}">
            <div v-if="arrival.timeAway == ''" class='o-grid__cell o-grid__cell--width-30'>--</div>
            <div v-else class='o-grid__cell o-grid__cell--width-30'>
                {{arrival.timeAway}}&nbsp;m<b v-if="arrival.type == 'scheduled'">*</b>
            </div>
            <div class='o-grid__cell o-grid__cell--width-30' v-html="arrival.arrivalTime"></div>
            <div class='o-grid__cell o-grid__cell--width-30'>{{arrival.lastUpdated}}&nbsp;m</div>
        </div>
    </div>
</template>


<script>

import TrainData from './trainData'


export default {
    name: 'traincard',
    data() {
        return {
            arrivalData: [],
            trainData: new TrainData(),
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
            this.trainData.getData((data) => {
                this.arrivalData = data
            })
        },

        cancelAutoUpdate: function() {
            clearInterval(this.timer)
        }
    }
}
</script>

<style>
.text_cell {
    font-size: .6em;
    font-weight: normal;
}

.even {
    color:lightgreen;
}

.odd {
    color:white;
}


#traincard {
    margin-top: 10px;
    color: white;
    font-weight: bold;
    font-size: 1.8em;
    background-color: black;
    width: inherit;
    padding-right: 0.6em;
}

</style>
