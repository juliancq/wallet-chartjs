const $graph = document.querySelector("#graph").getContext("2d");


let app = new Vue({
    el: '#app',
    data(){
        return{

            data : [],
            categories : [],
            values : [],
            colors : [],

            selected_category : {},

            chart : undefined
        }
    },
    methods: {

        async fetchData(){

            await fetch('./data.json')
                .then((r) => r.json())
                .then((json) => this.data = json)

        },

        parseData(){
            
            this.categories = [];
            this.colors = [];
            this.values = [];

            
            this.data.categories.forEach(category => {
                
                this.categories.push(category.title);
                this.colors.push(category.color);
                
                let total = 0;

                category.items.forEach(item =>{
                    total += +item.value
                })

                this.values.push(total);
            })
            
        }
        ,

        renderGraph(){
            
            if(this.chart) this.chart.destroy();

            let context = document.querySelector("#graph").getContext("2d");

            this.chart = new Chart(context, {
            type: 'doughnut',
            data : {
                labels: this.categories,
                datasets: [{
                    label: 'Spending',
                    data: this.values,
                    backgroundColor: this.colors,
                }]
            },
            
            options: {
                plugins: {
                    legend: {
                        display : false
                    },

                },
                layout : {
                    padding: 20
                },
                onClick(e, item){
                    if(item.length == 0) return
                    app.openModal(item[0].index);
                },
                
                hoverOffset : 10,
                borderColor : "rgba(0,0,0,0)"
            }
            })
            
        },

        openModal(index){

            this.selected_category = this.data.categories[index];
            document.querySelector("dialog").showModal();
        },

        closeModal(){
           
            if(!document.querySelector('#items-table').reportValidity()) return;

            document.querySelector("dialog").close();
            this.selected_category.items.forEach(item => item.editable = false);
            this.parseData();
        },

        addItem(){
            this.selected_category.items.push({

                description : "",
                date : "",
                value : 0,
                editable : true
            })
        },

        deleteItem(index){

            this.selected_category.items.splice(index, 1);
            this.parseData();
            this.renderGraph();
            
        },

        toggleEditable(index){

            this.selected_category.items[index].editable = !this.selected_category.items[index].editable
            this.$forceUpdate();
        },

        toggleMode(){
            console.log("hola")
            document.querySelector('body').classList.toggle('dark');
        }
    },
    computed: {
        total(){
            return this.values.reduce((acc, v) => acc += v,0);
        }
    }
    ,
    async mounted(){

        await this.fetchData();
        this.parseData();
        this.renderGraph();
    }
})

