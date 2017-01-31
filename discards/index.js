'use strict';

// TODO
// Show czar to everyone

const Cards = require('../api.cards');
const Player = require('./player');
const Discord = require("discord.js");

const max_cards = 8;
const STATE = {
    IDLE: 0,
    CALL: 1,
    JUDGE: 2
}

module.exports = class Bot {
    constructor(prefix, token) {
        this.prefix = prefix;
        
        this.decks = [];
        this.black = [];
        this.white = [];
        
        this.reset();
        
        this.cards = new Cards();
        this.discord = new Discord.Client();
        
        this.discord.on("error", err => console.log(err));
        
        this.discord.on("message", msg => {
            this.handleMessage(msg);
        });
        
        this.discord.login(token);
    }
    
    // Check message and if prefix is present, split in command and arguments
    parseMessage(msg) {
        // Only consider prefix
        if(!msg.content.startsWith(this.prefix)) return {};
        // Prevent bot explosion 
        if(msg.author.bot) return {};
        
         // Parse command and arguments
        let [command, ...args] = msg.content.split(" ");
        command = command.slice(this.prefix.length);
        
        return {'command': command, 'args':args};
    }
    
    // Dispatch the commands
    handleMessage(msg) {
        let {command, args} = this.parseMessage(msg);
        switch (command) {
            case "decks": {
                msg.channel.sendMessage(this.listDecks());
                break;
            }
            case "add": {
                this.addDeck(args[0]).catch(err => "Could not add pack: " + err.error.message)
                    .then(response => msg.channel.sendMessage(response)); 
                break;
            }
            case "remove": {
                msg.channel.sendMessage(this.removeDeck(args[0]));
                break;
            }
            case "join": {
                if(this.join(msg.author)) msg.channel.sendMessage(msg.author.username + " has joined the game");
                break;
            }
            case "leave": {
                if(this.leave(msg.author.id)) msg.channel.sendMessage(msg.author.username + " has left the game");
                break;
            }
            case "players": {
                msg.channel.sendMessage(this.listPlayers());
                break;
            }
            case "start": {
                if (this.state === STATE.IDLE){
                    if (this.players.length > 2) {
                        this.init(args[0]);
                        this.nextRound();
                    } else msg.channel.sendMessage("You need three people to play");
                } else msg.channel.sendMessage("Game has already started!");
                break;
            }
            case "play": {
                let player = this.players.filter(player => player.id == msg.author.id)[0];
                // Check if the id's are numbers between 0 and max_cards and if so, truncate
                let card_ids = args.map(id => +id -1)
                                    .filter(id => !isNaN(id) && id >= 0 && id < max_cards)
                                    .map(id => Math.trunc(id))
                                    .slice(0, this.challenge.text.length - 1);
                
                // Check if game has started an it's a player
                if (this.state === STATE.CALL && player && !player.czar){
                    player.discord_user.sendMessage("You have played:" + player.play(card_ids).map(card => "\n\t" + card.text).join(""));
                }
                break;
            }
            case "judge": {
                let player = this.players.filter(player => player.id == msg.author.id)[0];
                let id = +args[0] - 1;
                if (this.state === STATE.JUDGE && player && player.czar && !isNaN(id) && id >= 0 && id < this.responses.length) {
                    id = Math.trunc(id);
                    this.judge(id);
                }
                break;
            }
            case "score": {
                msg.channel.sendMessage(this.listScore());
                break;
            }
            case "stop": {
                msg.channel.sendMessage("\n Game is over!\n\n" + this.listScore());
                this.reset();
                break;
            }
        }
    }
    
    join(new_player) {
        if (this.players.filter(player => new_player.id == player.id).length == 0) {
            let p = new Player(new_player);
            if(this.state !== STATE.IDLE) {
                for (let i=0; i<max_cards; i++) {
                    p.deal(this.white.pop());
                }
            }
            this.players.push(p);
            return true;
        } else {
            return false;
        }
    }
    
    leave(player_id) {
        let l = this.players.length;
        this.players = this.players.filter(player => player.id !== player_id);
        return (l > this.players.length);
    }
    
    listPlayers() {
        return "Current players are:\n" + this.players.reduce((s, player) => s + "\t"+player.name+"\n", "").slice(0,-1);
    }
    
    addDeck(deck_id) {
        return this.cards.getInfo(deck_id).then(data => {
                return this.cards.getCards(deck_id).then(cards => {
                    data.cards = cards;
                    return data;
                });
            }).then(data => {
                this.decks.push(data);
                return "Added pack: " + data.name;
            });
    }
    
    removeDeck(deck_id) {
        this.decks = this.decks.filter(deck => deck.code !== deck_id);
        return "Removed deck "+deck_id;
    }
    
    listDecks() {
        return "Current packs are:\n" + this.decks.reduce((s, deck) => s + "\t"+deck.code+" - "+deck.name+"\n", "").slice(0,-1);
    }
    
    init(max_points) {
        if(max_points) this.max_points = max_points;
        this.decks.map(deck => {
            this.black.push(...deck.cards.calls);
            this.white.push(...deck.cards.responses);
        });
        shuffleArray(this.black);
        shuffleArray(this.white);
        for (let i=0; i<this.players.length * max_cards; i++) {
            this.players[i % this.players.length].deal(this.white.pop());
        }
        this.players.map(player => player.discord_user.sendMessage("Let's play some Cards Against Humanity!"));
    }
    
    nextRound() {
        this.state = STATE.CALL;
        this.czar = (this.czar + 1) % this.players.length;
        this.responses = [];
        this.challenge = this.black.pop();
        
        if(!this.challenge || Math.max(...this.players.map(player=>player.points)) >= this.max_points) {
            this.players.map(player => player.discord_user.sendMessage("\nGame over!\n\n" + this.listScore()));
            this.reset();
            return;
        }
        
        this.players.map((player, i) => {
            // Reset stuff
            player.response = "";
            
            player.discord_user.sendMessage("Black card:\n"+this.challenge.text.join("\__"));
            let options = "Your white cards are:\n-----------------------\n\n";
            options += player.cards.map((card, j) => "\t" + (j+1) + ") " + card.text + "\n").join("");
            
            if (i !== this.czar)
                options += "\nPlay a card by sending !play [number1] [number2] ... You have 30s to play a card";
            else {
                player.czar = true;
                options += "\nYou are the card czar this round. Since you get to pick the winner in 30s, " +
                            "it would be cheating if you could play a card, wouldn't it?";
            }
            player.discord_user.sendMessage(options);
        });
        
        // context magic
        let self = this;
        this.collectTimer = setTimeout(() => self.collectResponses(), 30000);
    }
    
    collectResponses() {
        console.log("Collecting responses ... ");
        this.state = STATE.JUDGE;
        let options = "The players answered with the following cards: \n-----------------------\n\n";
        this.responses = this.players.map(player => {return {r: player.response, p: player.id};})
                            .filter(response => response.r);
        shuffleArray(this.responses);
        options += this.responses.map((response, i) => "\t" + (i+1) + ") " + response.r.map(r=>r.text).join("\t") + "\n").join("");
        options += "\n\nJudge a submission as the winner by sending !judge [number]";
        
        // This crashes when people leave and it's too big. Should probably check out leave
        this.players[this.czar].discord_user.sendMessage(options);
        
        this.judgeTimer = setTimeout(()=>{
            if (this.state == STATE.JUDGE) {
                this.nextRound();
            }
        }, 60000);
    }
    
    judge(response_id) {
        clearTimeout(this.judgeTimer);
        let player = this.players.filter(player => player.id == this.responses[response_id].p)[0];
        player.score();
        let winner = "The winner of this round is " + player.name + " with:\n\t";
        let entry = this.responses[response_id].r;
        winner += fillInBlanks(this.challenge, entry) + "\n\n";
        winner += "The losing entries were:\n\t";
        winner += this.responses.filter((response, i) => i!==response_id).map(response => fillInBlanks(this.challenge, response.r)).join("\n\t") + "\n\n";
        
        this.players.map(player => {
            player.discord_user.sendMessage(winner);
            player.response = [];
            player.czar = false;
            while(player.cards.length < max_cards && this.white.length) player.deal(this.white.pop());
        });
        this.nextRound();
    }
    
    listScore() {
        let points = this.players.map(player => {return {"name": player.name, "points": player.points};});
        points.sort((a, b) => a.points - b.points);
        let m = "Scoreboard:\n-------------------\n";
        points.map((player, i) => m += (i+1) + ") " + player.name + "\t" + player.points + "\n");
        return m;
    }
    
    reset() {
        this.players = [];
        
        this.state = STATE.IDLE;
        this.czar = 0;
        this.responses = [];
        this.challenge = {};
        
        clearTimeout(this.collectTimer);
        clearTimeout(this.judgeTimer);
    }
}

function fillInBlanks(challenge, entry) {
    return challenge.text.reduce((m, part, i) => m + part + ((i<entry.length) ? entry[i].text[0] : "\_\_"), "").slice(0,-2);
}

function shuffleArray(array) {
    console.log("Shuffeling cards");
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}