const {Telegraf} = require('telegraf')
const {message} = require("telegraf/filters")
const bot = new Telegraf('7621583757:AAGrisvEIlQMqXyv41u22mZ2VT6Ox8Fsicw')


const express = require('express')
const app = express()
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    bot.use(async(ctx)=>{
        if(ctx.has(message('text'))){
            const text = ctx.update.message.text.toLowerCase()
            if(text === 'иди нахуй') await ctx.reply("Сам иди нахуй")
            else if(text === 'сам иди нахуй') await ctx.reply("Нет, ты иди нахуй")
            else if(text.includes('нет')){
                await ctx.reply("Пидора ответ")
                await ctx.reply("Иди нахуй")
            }
            else await ctx.reply('Иди нахуй')
        }
        else await ctx.reply('Иди нахуй')
    })
    bot.launch().then(()=>console.log("STARTED"))
    process.once("SIGINT", ()=>bot.stop("SIGINT"))
    process.once("SIGTERM", ()=>bot.stop("SIGTERM"))
})