const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
const app = express()
app.use(express.json())

let db = null

const initDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('The Server is running at http://localhost:3000/'),
    )
  } catch (err) {
    console.log(`DB Error ${err.message}`)
    process.exit(1)
  }
}

initDbAndServer()
// GET players
app.get('/players/', async (request, response) => {
  const getPlayers = `SELECT player_id AS playerId, player_name AS playerName
  FROM player_details;`
  const players = await db.all(getPlayers)
  response.send(players)
})
// GET player on Id
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayer = `SELECT player_id AS playerId, player_name AS playerName
  FROM  player_details WHERE player_id=${playerId};`
  const player = await db.get(getPlayer)
  response.send(player)
})
// PUT player details
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const putPlayer = `UPDATE player_details SET player_name='${playerName}' 
    WHERE player_id=${playerId};`
  await db.run(putPlayer)
  response.send('Player Details Updated')
})
// GET match on Id
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatch = `SELECT match_id AS matchId,
    match, year FROM match_details WHERE match_id=${matchId};`
  const match = await db.get(getMatch)
  response.send(match)
})
// GET all matches of player
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getMatchOfPlayer = `SELECT match_id AS matchId, match, year 
    FROM player_match_score NATURAL JOIN match_details WHERE player_id=${playerId};`
  const playerMatches = await db.all(getMatchOfPlayer)
  response.send(playerMatches)
})
// GET players of a match
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getPlayersOfMatch = `SELECT 
  player_match_score.player_id AS playerID, player_name AS playerName 
  FROM player_match_score NATURAL JOIN player_details 
  WHERE match_id=${matchId};`
  const playersOfMatch = await db.all(getPlayersOfMatch)
  response.send(playersOfMatch)
  //ON player_details.player_id = player_match_score.player_id
})
// GET stats of player on Id
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getplayerStats = `SELECT 
  player_details.player_id AS playerId, player_details.player_name AS playerName, 
  SUM(player_match_score.score) AS totalScore, SUM(fours) AS totalFours, 
  SUM(sixes) AS totalSixes 
  
  FROM player_details INNER JOIN player_match_score 
  ON player_details.player_id= player_match_score.player_id
  WHERE player_details.player_id=${playerId};`
  const playerStats = await db.get(getplayerStats)
  response.send(playerStats)
})

module.exports = app
