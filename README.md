# liars_cards_app
app to play liar's cards online

#bugs
if 'ready' is hit to green and then back to red before server says confirms that everyone is ready and hands out the cards, will not hand cards to the play who changed ready back to red (only for player who last clicked it...?)

going to '/game-room' works if you don't have a proper token
if someone is out for a round, they should not have the "show cards" options (it should auto show them cards when everyone who is still playing is ready)
if someone has already been out (or maybe as soon as they are out), they shouldn't have the option to ready up anymore (it should always show them as ready)

show on screen to a player when they are out or they win
should also show how many cards each person has

roomUsers have auth-token and password when given to client side...not good

#stretch
someone should be able to x out/ refresh and still play the game they were in properly
show how many of each suit there was at the end of the round in the moves(rename to 'data' or something) box
have card count persist to database?