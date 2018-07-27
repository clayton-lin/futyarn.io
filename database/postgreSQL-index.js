var pg = require('pg');
var config = require('../config.js');
var connection = config.connection;
var pgClient = new pg.Client(connection);

pgClient.connect();

pgClient.on('error', () => 
{
    console.log('postgres connection error');
});

pgClient.once('open', () => 
{
    console.log('postgres connected successfully');
});


// function stores session in db
// db is queried to insert the session, user_id, and username into the sessions table
// note: for various endpoints, active session is verified via verifySession function before being allowed to continue
const storeSession = (session, user_id, username, callback) => {
    console.log(`storeSession fired for username: ${username}, session: ${session}`);
    let storeSessionQuery = `INSERT INTO sessions (session, user_id, username) VALUES ('${session}', ${user_id}, '${username}');`;
    pgClient.query(storeSessionQuery, (err, results/*, fields*/) => {
        if (err) {
            console.log('error: storeSession failed');
            console.log(err);
            callback(err, null);
        } else {
            console.log('storeSession completed, stored session: ', session);
            callback(null, results);
        }
    });
};


// function queries db to check if a session is stored in the sessions table
    // if yes, user is in an active session and is allowed to continue
    // if no, user is asked to login or sign up
const verifySession = (session, callback) => {
    console.log(`verifySession fired session: ${session}`);
    let verifySessionQuery = `SELECT * FROM sessions WHERE session = '${session}';`;
    pgClient.query(verifySessionQuery, (err, results/*, fields*/) => {
        if (err) {
            console.log('error: verifySession failed');
            console.log(err);
            callback(err, null);
        } else {
            console.log('verifySession completed, verified session: ', session);
            callback(null, results);
        }
    });
};


// removes session from the sessions table
// this ends the active session for the user becasue the user can no longer be authorized
const removeSession = (session, callback) => {
    console.log(`removeSession fired for session: ${session}`);
    let removeSessionQuery = `DELETE FROM sessions WHERE session = '${session}';`;
    pgClient.query(removeSessionQuery, (err, results/*, fields*/) => {
        if (err) {
            console.log('error: removeSession failed');
            console.log(err);
            callback(err, null);
        } else {
            console.log('removeSession completed: removed session: ', session);
            callback(null, results);
        }
    });
};


// function used to add a new user to the db in the users table using the inputted username and password
// wins, losses, games_played, goals_made are set to 0 for a new user
const addNewUser = (username, password, callback) =>
{
    console.log('addNewUser function fired, username: ', username);
    let addNewUserQuery = `INSERT INTO players (username, password, wins, losses, games_played, goals_made) VALUES ('${username}', '${password}', 0, 0, 0, 0);`;
    pgClient.query(addNewUserQuery, (err, results/*, fields*/) => {
        if (err) {
            console.log('error: addNewUser failed');
            console.log(err);
            callback(err, null);
        } else {
            console.log('addNewUser completed, results: ', results);
            callback(null, results);
        }
    });
};

// function queries the db using the provided identifier (second arg) and returns user data
    // identifier is either username or user_id
    // the method (first arg) is a string 
// data returned is a JavaScript object and contains the following key:value pairs
// { user_id: 1,
//   username: 'meow kitty',
//   wins: 5,
//   losses: 0,
//   games_played: 5,
//   goals_made: 13 }

const getUserInfo = (method, identifier, callback) =>
{
    let getUserInfoQuery;
    if (method === 'username') {
        console.log('getUserInfo function fired, username: ', identifier);
        getUserInfoQuery = `SELECT user_id, username, password, wins, losses, games_played, goals_made FROM players WHERE username = '${identifier}';`;
    } else if (method === 'id') {
        console.log('getUserInfo function fired, id: ', identifier);
        getUserInfoQuery = `SELECT user_id, username, password, wins, losses, games_played, goals_made FROM players WHERE user_id = ${identifier};`;
    }
    pgClient.query(getUserInfoQuery, (err, results/*, fields*/) => {
        // console.log('error ---------------------------------------');
        // console.log(err);
        if (err) {
            console.log('error: getUserInfo failed');
            console.log(err);
            callback(err, null);
        } else {
            const foundUser = results.rows[0];
            console.log('getUserInfoQuery results: ', foundUser);
            callback(null, foundUser);
        }
    });
};


// FUNCTION NEEDED
// updateUserInfo




const getLeaderboards = (callback) =>
{
    console.log('getLeaderboards function fired');
    let getLeaderboardQuery = 'SELECT username, wins, losses, games_played, goals_made FROM players ORDER BY wins DESC, goals_made DESC LIMIT 10;';
    pgClient.query(getLeaderboardQuery, (err, results/*, fields*/) => {
        if (err) {
            console.log('error: getLeaderboardQuery failed');
            console.log(err);
            callback(err. null);
        } else {
            console.log('getLeaderboardQuery results:', results);
            const topTenPlayers = results.rows;
            callback(null, topTenPlayers);
        }
    });
};
// Returns the top 10 players, sorted by wins, and then by goals made
// Data is an array of 10 objects.
// Each object is a JavaScript object and contains the following key:value pairs
// { username: 'meow kitty',
//   wins: 5,
//   losses: 0,
//   games_played: 5,
//   goals_made: 13 }



// FUNCTION NEEDED
// postGameInfo
// handlepost request from game server



// FUNCTION NEEDED
// getGameInfo
// handle get request from client




module.exports = {
    pgClient,
    storeSession,
    verifySession,
    removeSession,
    addNewUser,
    getUserInfo,
    getLeaderboards
};
