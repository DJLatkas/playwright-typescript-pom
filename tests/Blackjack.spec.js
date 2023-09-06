//@ts-check
import {test, expect} from '@playwright/test';
var deckId;
const baseUrl = 'https://deckofcardsapi.com/api/deck/';
test('New Deck', async({request})=>{
  // Navigate to the deckofcardsapi.com website
  const response = await request.get(baseUrl+'new/shuffle/?deck_count=1')
  const res = await response.json()
  deckId = await res.deck_id+'/'
  console.log(res);
  console.log(deckId)
  expect(response.status()).toBe(200);
});

test('Deal', async({request})=>{
  // Get a new deck and shuffle it
  const response = await request.get(
    baseUrl+deckId+'/draw/?count=6');
  const res = await response.json()
  const cards = res.cards;
  console.log(await res);

  const players = {
    player1: cards.slice(0, 3),
    player2: cards.slice(3)
  };

  function hasBlackjack(cards) {
    const values = cards.map(card => card.value);

    const acesCount = values.filter(value => value === 'ACE').length;
    const nonAceTotal = values
      .filter(value => value !== 'ACE')
      .reduce((total, value) => total + (['KING', 'QUEEN', 'JACK'].includes(value) ? 10 : parseInt(value, 10)), 0);

    // Blackjack can be achieved with an Ace and a 10-valued card
    return (nonAceTotal + acesCount) === 11 && acesCount === 1;
  }

  for (const playerName in players) {
    if (hasBlackjack(players[playerName])) {
      console.log(`${playerName} has blackjack.`);
    }
    else console.log(`${playerName} does not have blackjack.`);
    
  }
});
