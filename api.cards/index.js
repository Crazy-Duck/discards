'use stict';
const rp = require("request-promise-native");

module.exports = class Cards{
    constructor() {
        this.baseURL = "https://api.cardcastgame.com/v1/decks/";
    }
    
    getCards(deck_id) {
        return rp({
            'uri':    this.baseURL + deck_id + "/cards",
            'json':   true
        });
    }
    
    getInfo(deck_id) {
        return rp({
            'uri':    this.baseURL + deck_id,
            'json':   true
        });
    }
} 