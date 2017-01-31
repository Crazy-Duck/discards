'use strict';

var Bot = require('./discards');

let discordToken = "MjYwMzkwMDA4MjQ0OTI4NTEy.CzlqqQ.3uV_MGrp4tf9DYfRz_pHy87sumg";
let bot = new Bot("!", discordToken);

// bot.addDeck("ZVV68").catch(err => "Could not add pack: " + err.error.message)
//                     .then(response => console.log(response));
// bot.join({
//     id: "1231",
//     username: "test1",
//     sendMessage: msg => console.log(msg)
// });
// bot.join({
//     id: "1232",
//     username: "test2",
//     sendMessage: msg => console.log(msg)
// });
// bot.join({
//     id: "1233",
//     username: "test3",
//     sendMessage: msg => console.log(msg)
// });

// let m = {
//     content: "!start",
//     author: {
//         bot: false
//     },
//     channel: {
//         sendMessage: msg => console.log(msg)
//     }
// };
// setTimeout(()=>{
//     bot.handleMessage(m);
// }, 10000);
// setTimeout(()=>{
//     m.content = "!play 1";
//     m.author.id = "1231";
//     bot.handleMessage(m);
//     m.author.id = "1233";
//     bot.handleMessage(m);
// },11000);
// setTimeout(()=>{
//     m.content = "!judge 1";
//     m.author.id = "1232";
//     bot.handleMessage(m);
// },42000);