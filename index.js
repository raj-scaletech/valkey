const Redis = require('ioredis');

const redis = new Redis({
    host: 'localhost',
    port: 6969,
});

//LIST
async function listMethods() {
    try {
        const listKeys = 'myList'
        // Push elements into the list where rpush add element from right and lpush add element from left
        await redis.rpush(listKeys, "List 1")
        await redis.lpush(listKeys, "List 2")
        await redis.rpush(listKeys, "List 3")

        // check length of redis
        const listLength = await redis.llen(listKeys)
        console.log(`Length of listKeys: ${listLength}`);

        // remove an element from the front of the list and right from list
        const firstElement = await redis.lpop(listKeys);
        console.log(`Popped from front: ${firstElement}`);
        const lastElement = await redis.rpop(listKeys);
        console.log(`Popped from back: ${lastElement}`);

        // Insert an element before another element in the list
        await redis.linsert(listKeys, 'BEFORE', 'List 1', 'List 1.5');
        await redis.linsert(listKeys, 'AFTER', 'List 1', 'List 2.5');

        // Get all elements after insertion
        const updatedElements = await redis.lrange(listKeys, 0, -1);
        console.log(`Updated elements in the list: ${updatedElements}`);

        // get element from index
        const elementAtIndex = await redis.lindex(listKeys, 0);
        console.log(`Element at index 0: ${elementAtIndex}`);

        // Remove an element from the list
        await redis.lrem(listKeys, 1, 'List 1.5');
        const lists = await redis.lrange(listKeys, 0, -1);
        console.log(`Final elements in the list: ${lists}`);

        // Deleting the list
        await redis.del(listKeys);
    } catch (error) {
        console.error(`Error while getting list methods: `, error);
    } finally {
        redis.quit()
    }
}
// listMethods()

// STRING
async function stringCommand() {
    try {
        // set string in redis
        await redis.set('myKey', 'Hello')
        console.log(`myKey set to Hello`);

        // Get value of key
        const myKey = await redis.get('myKey')
        console.log(`Value of myKey ${myKey}`);

        // Append on existing key
        await redis.append('myKey', ' World!!!')
        const appendKey = await redis.get('myKey')
        console.log(`Appended myKey : ${appendKey}`);

        // Increament numeric value
        await redis.set('counter', 5)
        await redis.incr('counter')
        const count = await redis.get('counter')
        console.log(`Increamented counter is ${count}`);

        // Decreament numeric value
        await redis.decr('counter')
        const updatedCount = await redis.get('counter')
        console.log(`Decreamented counter is ${updatedCount}`);

        // Get length of string
        const length = await redis.strlen('myKey')
        console.log(`length of string myKey is: ${length}`);

        // Get substring
        const substring = await redis.getrange('myKey', 0, 4);
        console.log(`Substring of myKey is: ${substring}`);

        // Set substring in the string
        await redis.setrange('myKey', 6, 'Redis')
        const newString = await redis.get('myKey')
        console.log(`New string is: ${newString}`);

        // Set and Get multiple string values at once
        await redis.mset('name', 'raj soni', 'age', 22, 'city', 'Ahmedabad')
        const values = await redis.mget('name', 'age', 'city')
        console.log(`name, age, city : ${values.join(', ')}`);

    } catch (error) {
        console.error('Error in string operations demo:', error);
    } finally {
        redis.quit();
    }
}

// stringCommand();

// STREAM
async function streamCommands() {
    try {
        const streamKey = 'inbox'
        // Adding message to stream
        await redis.xadd(streamKey, '*', 'session_id', '1', 'temprature', '22.5')
        await redis.xadd(streamKey, '*', 'session_id', '2', 'temprature', '23.5')
        await redis.xadd(streamKey, '*', 'session_id', '3', 'temprature', '24.5')
        console.log('Message added in stream');

        // Readng all messages to stream
        const messages = await redis.xrange(streamKey, "-", "+")
        console.log("Messages in stream: ");
        messages.forEach((message) => {
            const [id, fields] = message
            console.log(`ID: ${id}, Fields: ${fields}`);
        });

        // DELETE message by id
        const firstMessage = messages[0][0]
        await redis.xdel(streamKey, firstMessage)

        // Other messages
        const remainingMessages = await redis.xrange(streamKey, '-', '+');
        console.log('Remaining Messages in the stream after deletion:');
        remainingMessages.forEach((message) => {
            const [id, fields] = message;
            console.log(`ID: ${id}, Fields: ${fields}`);
        });


    } catch (error) {
        console.error(`Error in stream operations:`, error);
    } finally {
        redis.quit();
    }
}
// streamCommands()

// SET:  set is an unordered collection of unique strings (members)
async function setOperation() {
    const setKey1 = 'set1'
    const setKey2 = 'set2'
    try {
        // Add members in set
        await redis.sadd(setKey1, "Apple", "Apple", "Banana", "Watermelon")
        await redis.sadd(setKey2, "Mango", "Kiwi", "Banana")

        // Get number of memeber in set1
        const countSet1 = await redis.scard(setKey1)
        console.log(`Member in ${setKey1} : ${countSet1}`);

        // Get all member in set1
        const set1List = await redis.smembers(setKey1)
        console.log(`Members in ${setKey1} : ${set1List}`);

        //check if member in set
        const isMember = await redis.sismember(setKey1, "apple")
        console.log(`Is 'apple' member of ${setKey1}: ${isMember ? "true" : "false"}`);

        // UNion of set 1 and set2
        const unionMembers = await redis.sunion(setKey1, setKey2)
        console.log(`Union of ${setKey1} and ${setKey2} is : ${unionMembers}`);

        //Intersection result of both sets
        const intersectionMember = await redis.sinter(setKey1, setKey2)
        console.log(`Intersection of ${setKey1} and ${setKey2} is: ${intersectionMember}`);

        //remove member from set
        await redis.srem(setKey1, "Apple")
        console.log(`Apple remove from ${setKey1}`);

        //verify members after remove apple
        const updatedSet1 = await redis.smembers(setKey1)
        console.log(`Updated members of ${setKey1}: ${updatedSet1}`);
    } catch (error) {
        console.error(`Error while getting set operation: `, error);
    } finally {
        await redis.quit()
    }
}
// setOperation()

//Sorted-set
//useful in leaderboard and inventory management
async function sortedSets() {
    const sortedSetKey = "Scoreboard"
    try {
        //add players in scoreboard
        await redis.zadd(sortedSetKey, 100, "Player 1", 200, "Player 2", 150, "Player 3")
        console.log('Players added to sorted set');

        //count of player in scoreboard
        const count = await redis.zcard(sortedSetKey)
        console.log(`players in scoreboard: ${count}`);

        // get all players in scoreboard
        const players = await redis.zrange(sortedSetKey, 0, -1, 'WITHSCORES')
        console.log(`player and their score is ${sortedSetKey} : ${players}`);

        //Get score od specific to player
        const score = await redis.zscore(sortedSetKey, "Player 2")
        console.log(`Score of Player2 is: ${score}`);

        // remove specific player by name
        await redis.zrem(sortedSetKey, 'Player 3')
        console.log('Removed Charlie from the sorted set.');

        // get all players in scoreboard verify after removed one
        const updatePlayers = await redis.zrange(sortedSetKey, 0, -1, 'WITHSCORES')
        console.log(`player and their score is ${sortedSetKey} : ${updatePlayers}`);

        //remove return player with highest score
        const highestPlayer = await redis.zrevrange(sortedSetKey, 0, 0, 'WITHSCORES')
        console.log(`Highest player is ${highestPlayer}`);

        //remove return player with highest score
        const removeHighestPlayer = await redis.zpopmax(sortedSetKey)
        console.log(`Highest player is and remove from sorted set ${removeHighestPlayer}`);

    } catch (error) {
        console.error(`Error while getting sort operation: `, error);
    } finally {
        redis.quit()
    }

}
// sortedSets()

// BITMAP
async function bitmap() {
    try {
        //BITMAP:-> They are ideal for tracking user behaviour, such as clicks, views, and sign-ups
        const key = 'bitmapKey';

        // Set the bit at offset 1 to 1 (true)
        await redis.setbit(key, 1, 1);
        console.log('Set bit at offset 1 to 1.');

        // Set the bit at offset 5 to 1 (true)
        await redis.setbit(key, 5, 1);
        console.log('Set bit at offset 5 to 1.');

        // Get the bit at a specific offset
        const bitAt1 = await redis.getbit(key, 1);
        console.log(`Bit at offset 1: ${bitAt1}`);

        const bitAt5 = await redis.getbit(key, 5);
        console.log(`Bit at offset 5: ${bitAt5}`);

        const bitAt10 = await redis.getbit(key, 10);
        // Check a bit not set (should be 0)
        console.log(`Bit at offset 10: ${bitAt10}`);

        // Count the number of set bits (BITCOUNT)
        const bitCount = await redis.bitcount(key);
        console.log(`Number of bits set to 1: ${bitCount}`);

        // Use BITPOS to find the first set bit (1)
        const firstSetBit = await redis.bitpos(key, 1);
        console.log(`First bit set to 1 is at offset: ${firstSetBit}`);

        await redis.del(key);
        console.log('Deleted bitmap key.');
    } catch (error) {
        console.error('Error in bitmap operation:', error);
    } finally {
        redis.quit();
    }
}

// bitmap();

//  HASH - Store value as field value
async function hashMethod() {
    try {
        const hashKey = 'user:1001'; // it will be unique key
        //set muliple key in hash
        await redis.hmset(hashKey, 'name', 'raj', 'age', 22, 'city', 'ahmedabad')
        console.log('Hash field set');

        // get all value from hash
        const hashData = await redis.hgetall(hashKey)
        console.log('Hash data ', hashData);

        // increament age by 1
        await redis.hincrby(hashKey, 'age', 1)
        const updatedAge = await redis.hget(hashKey, 'age')
        console.log(`Updated age : ${updatedAge}`);

        // check if city filed exists?
        const cityExists = await redis.hexists(hashKey, 'city');
        console.log(`City exists :  ${cityExists === 1 ? 'true' : 'false'}`);

        //delete city key
        await redis.hdel(hashKey, 'city');
        const userAfterDelete = await redis.hgetall(hashKey);
        console.log('Hash after deleting city:', userAfterDelete);

        //get number of field in hash
        const fieldCount = await redis.hlen(hashKey);
        console.log('Number of fields in hash:', fieldCount);

        // delete hash key
        await redis.del(hashKey);
    } catch (error) {
        console.error(`Error in hash method: ${error}`);
    } finally {
        redis.quit();
    }
}
// hashMethod()