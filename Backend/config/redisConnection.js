import {createClient} from 'redis';

const redisClient = await createClient().on("error", (err) => {
    console.log("Error while connecting to redis", err);
}).connect();


try {
    await redisClient.ft.info('idx:sessions');
  } catch (err) {
    if (err.message.includes('no such index')) {
  
      await redisClient.ft.create('idx:sessions', {
        '$.userId': {
          type: 'TAG',
          AS: 'userId',
        }
      }, {
        ON: 'JSON',
        PREFIX: 'session:'
      });
    } else {
      console.error('Error while checking/creating index:', err);
    }
  }


export default redisClient;