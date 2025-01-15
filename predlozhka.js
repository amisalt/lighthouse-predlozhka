const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000;
app.use(express.static('static'))
app.use(express.json());

const {Telegraf, Markup} = require('telegraf')
const {message, channelPost} = require("telegraf/filters")
const bot = new Telegraf(process.env.BOT_API_KEY)

app.use(bot.webhookCallback(`/${process.env.SECRET_PATH}`))
bot.telegram.setWebhook(`https://lighthouse-predlozhka.onrender.com/${process.env.SECRET_PATH}`)

bot.use(async(ctx, next)=>{
  //USER RELATED INTERFACE
  if(ctx.update?.message?.chat?.id !== process.env.ADMIN_CHAT_ID || ctx?.update?.message?.chat?.id !== process.env.CHANNEL_CHAT_ID || !ctx.has('channel_post')){
    ctx.update.ADMIN = false
  }
  //NURYM RELATED INTERFACE
  else{
    ctx.update.ADMIN = true
  }
  next()
})

const notSupportedFormatReply = '👍 круто, но такой формат сообщений пока не поддерживается(доступно: обычный текст, картинки, видео)'
const messageToNurymFormat = (ctx)=>{return{parse_mode:'HTML', caption:`${ctx.update.message.caption || ''}\n\n<tg-emoji emoji-id="5368324170671202286">🦛</tg-emoji> ${ctx.update.message.from.username}`, chat_id:process.env.ADMIN_CHAT_ID, disable_notification:true}}

function getInlineKeyboardMarkup(){
  return Markup.inlineKeyboard([
    Markup.button.callback('Accept Jesus to connect', 'accept_post'),
    Markup.button.callback('Decline Jesus to disconnect', 'decline_post')
  ])
}

bot.command('/start', async (ctx)=>{
  if(!ctx.update.ADMIN){
    await ctx.reply('Карочи это предложка')
  }
})
bot.on(message('text'), async(ctx)=>{
  if(!ctx.update.ADMIN){
    await ctx.sendMessage(`${ctx.update.message.text}\n\n<tg-emoji emoji-id="5368324170671202286">🦛</tg-emoji> ${ctx.update.message.from.username}`, {parse_mode:'HTML', chat_id:process.env.ADMIN_CHAT_ID, reply_markup:getInlineKeyboardMarkup(), disable_notification:true})
    await ctx.sendMessage(`👍`, {chat_id:ctx.update.message.chat.id})
  }
})
bot.on(message('photo'), async(ctx)=>{
  if(!ctx.update.ADMIN){
    if(ctx.has(message('media_group_id'))){
      const photoIds = []
      for(let photo of ctx.update.message.photo){
        if(!photoIds.includes(photo.file_id)){
          photoIds.push(photo.file_id)
        }
      }
      await ctx.reply(notSupportedFormatReply)
    }else{
      await ctx.sendPhoto(ctx.update.message.photo[0].file_id, messageToNurymFormat(ctx))
      await ctx.sendMessage(`👍`, {chat_id:ctx.update.message.chat.id})
      await ctx.reply(JSON.stringify(ctx.update, null, 2))
    }
  }
})
bot.on(message('voice'), async(ctx)=>{
  if(!ctx.update.ADMIN){
    await ctx.reply(notSupportedFormatReply)
  }
})
bot.on(message('video_note'), async()=>{
  if(!ctx.update.ADMIN){
    await ctx.reply(notSupportedFormatReply)
  }
})
bot.on(message('video'), async(ctx)=>{
  if(!ctx.update.ADMIN){
    if(ctx.has(message('media_group_id'))){
      const photoIds = []
      for(let photo of ctx.update.message.photo){
        if(!photoIds.includes(photo.file_id)){
          photoIds.push(photo.file_id)
        }
      }
      await ctx.reply(notSupportedFormatReply)
    }else{
      await ctx.sendVideo(ctx.update.message.video.file_id, messageToNurymFormat(ctx))
      await ctx.sendMessage(`👍`, {chat_id:ctx.update.message.chat.id})
      await ctx.reply(JSON.stringify(ctx.update, null, 2))
    }
  }
})
bot.on(message('sticker'), async(ctx)=>{
  if(!ctx.update.ADMIN){
    await ctx.reply(notSupportedFormatReply)
  }
})
bot.on(message('document'), async(ctx)=>{
  if(!ctx.update.ADMIN){
    await ctx.reply(notSupportedFormatReply)
  }    
})
bot.on(message('location'), async(ctx)=>{
  if(!ctx.update.ADMIN){
    await ctx.reply(notSupportedFormatReply)
  }
})
bot.on(message('poll'), async(ctx)=>{
  if(!ctx.update.ADMIN){
    await ctx.reply(notSupportedFormatReply)
  }
})
bot.on(message('contact'), async(ctx)=>{
  if(!ctx.update.ADMIN){
    await ctx.reply(notSupportedFormatReply)
  }
})
bot.on(message('audio'), async(ctx)=>{
  if(!ctx.update.ADMIN){
    await ctx.reply(notSupportedFormatReply)
  }
})

bot.launch().then(()=>console.log("STARTED"))
app.listen(port, () => console.log(`Listening on ${port}`));