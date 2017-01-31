# Discards
Cards against humanity bot for discord

## Usage
The following table lists all commands the bot will respond to. Required arguments are between "<...>", optional arguments between "[...]".

### Channel commands
|command|arguments|description|
|---|---|---|
|`!decks`|| List the card decks currently loaded. These will be used in the next game.|
| `!add` |`<cards_id>` | Add a card pack from [CardCastGame](https://www.cardcastgame.com/browse). Use the 5 character code as parameter.|
| `!remove` |`<cards_id>` | Remove a card pack from the currently loaded decks.|
| `!join` || Join the playerpool. You'll be able to play as soon as a new game starts or, if there is a game on-going, as soon as the current round has ended.|
| `!leave` || Leave the playerpool, you will no longer be able to participate|
| `!players` || List the players currently in the player pool|
| `!start`| `[max_points]` | Start a new game with the current deck of cards. If `max_points` is provided the game will end as soon as someone scores `max_points` points.|
| `!stop` || End the game. This makes all players leave and prints the score of each player|
| `!score` || Show the scores of all players|

### PM commands
|command|arguments|description|
|---|---|---|
| `!play`| `<card1> [card2 ... cardN]` | Play one or multiple white cards. The arguments reference the number of the card in your card list.|
| `!judge` |`<card_nr>` | Choose a player response as the winner of this round. The argument references the number of the response in the response list.|
