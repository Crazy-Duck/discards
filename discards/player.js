'use strict';

module.exports = class Player {
    constructor(discord_user) {
        this.discord_user = discord_user;
        this.cards = [];
        this.points = 0;
        this.response = [];
        this.czar = false;
    }
    
    deal(card) {
        if (card) this.cards.push(card);
    }
    
    play(card_ids) {
        this.response = [];
        // Card id's are unsorted and may not be sorted!
        while(card_ids.length) {
            let idx = card_ids.pop();
            this.response.unshift(...this.cards.splice(idx, 1));
            // decrement index for all indices greater than current one, 
            // since this.cards just got smaller
            card_ids = card_ids.map(id => idx > id ? id : id - 1);
        }
        return this.response;
    }
    
    score() {
        this.points++;
    }
    
    get id() {
        return this.discord_user.id;
    }
    
    get name() {
        return this.discord_user.username;
    }
}