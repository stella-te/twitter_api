const logger = require('./logger');

var KAFKA_HOST = 'kafka:2181';

var kafka = require('kafka-node'),
    Consumer = kafka.Consumer,
    client = new kafka.Client(KAFKA_HOST),
    offset = new kafka.Offset(client),
    kafkaConsumeroptions = {
        autoCommit: false,
        fromOffset: true,
        fetchMaxWaitMs: 1000, 
        fetchMaxBytes: 1024*1024, 
        encoding: 'utf8'
    },
    consumer;



module.exports = function(options){
	
    logger.info('Setting KAFKA Module Options');
    logger.info(JSON.stringify(options));

    consumer = new Consumer(
        client,
        [],
        kafkaConsumeroptions
    ); 


    consumer.on('message', function(msg){
        if(options.onMessage){
            options.onMessage(msg);
        }
    });

    consumer.on('error', function (err) {
        logger.error('Kafka error');
        logger.error(err);
    });

    consumer.on('offsetOutOfRange', function (topic) {
        logger.info('Kafka offsetOutOfRange for' + topic)
        topic.maxNum = 2;
        topic.time = -1;

        offset.fetch([topic], function (err, offsets) {
            var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
            var max = Math.max.apply(null, offsets[topic.topic][topic.partition]);
            logger.info('Setting Offset ' + topic.topic + ' to ' + max)
            consumer.setOffset(topic.topic, topic.partition, max);
        });
    });


    consumer.addTopics(options.topics, function(err, added){
        console.log('after addTopics ', arguments);
    }, true);

}