<template>
    <div id='app' class='c-text' >

            <div class='w_full_height o-grid'>

                <div class='o-grid__cell'>
                    <div class='w_half_height o-grid'>
                        <div class='o-grid__cell--width-37'>
                            <weathercard :dayOffset="0">
                            </weathercard>
                        </div>
                        <div class='o-grid__cell--width-37'>
                            <weathercard :dayEndOffset="1">
                            </weathercard>
                        </div>
                        <div class='o-grid__cell--width-25'>
                            <traincard>
                            </traincard>
                        </div>
                    </div>

                    <div class='w_half_height o-grid'>
                        <div class='o-grid__cell--width-37'>
                            <weathercard :dayOffset="1">
                            </weathercard>
                        </div>
                        <div class='o-grid__cell--width-37'>
                            <weathercard :dayEndOffset="0">
                            </weathercard>
                        </div>
                        <div class='o-grid__cell--width-25'>
                            <soccercard>
                            </soccercard>
                        </div>
                    </div>

                </div>
            </div>
    </div>
</template>


<script>

import weathercard from './weathercard.vue'
import traincard from './traincard.vue'
import soccercard from './soccer-card.vue'


export default {
    name: 'app',
    data() {
        return { }
    },

    components: {
        weathercard, traincard, soccercard
    }
}
</script>

<style>
#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: inherit;
    height: inherit;
    background-color: black;

    min-height: 100vh;
    margin: 0;
    padding: 0;
}

.w_full_height {
    height: 100%;
}

.w_half_height {
    height: 50%;
}

</style>
