Topic: Aggregation Pipeline 26 March

Basically, there are multiple stages(queries), and the result of each stage is the input to the next stage, until the last stage, which produces the desired results

format: db.collection.aggregate(pipeline , options) 

pipeline is an array of different operations 
