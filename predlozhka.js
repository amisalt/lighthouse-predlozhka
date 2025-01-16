require('dotenv').config()
const ADMIN_CHAT_ID = Number(process.env.ADMIN_CHAT_ID)
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME
const CHANNEL_CHAT_ID = Number(process.env.CHANNEL_CHAT_ID)
const BOT_API_KEY = process.env.BOT_API_KEY
const PORT = Number(process.env.PORT)
const SECRET_PATH = process.env.SECRET_PATH

console.log(
  ADMIN_CHAT_ID, CHANNEL_USERNAME, CHANNEL_CHAT_ID, BOT_API_KEY, PORT, SECRET_PATH,
)

const express = require('express')
const app = express()
const port = PORT || 3000;
app.use(express.static('static'))
app.use(express.json());

const {Telegraf, Markup} = require('telegraf')
const {message, channelPost} = require("telegraf/filters")
const bot = new Telegraf(BOT_API_KEY)


// app.use(bot.webhookCallback(`/${SECRET_PATH}`))
// bot.telegram.setWebhook(`https://lighthouse-predlozhka.onrender.com/${SECRET_PATH}`)

bot.use(async(ctx, next)=>{
  if(ctx.update?.message?.chat?.id === ADMIN_CHAT_ID || ctx?.update?.message?.chat?.id === CHANNEL_CHAT_ID || ctx.update?.callback_query?.message?.chat?.id === ADMIN_CHAT_ID || ctx?.update?.callback_query?.message?.chat?.id === CHANNEL_CHAT_ID || ctx.has('channel_post')){
    ctx.update.ADMIN = true
  }
  else{
    ctx.update.ADMIN = false
  }
  next()
})

const adminKeyboard = Markup.inlineKeyboard([
  Markup.button.callback('Accept Jesus to connect', 'accept_post'),
  Markup.button.callback('Decline Jesus to disconnect', 'decline_post')
])
const userKeyboard = (messageId)=>Markup.inlineKeyboard([
  Markup.button.url('Посмотреть в канале',`https://t.me/${CHANNEL_USERNAME}/${messageId}`)
])

const notSupportedFormatReply = '👍 круто, но такой формат сообщений пока не поддерживается(доступно: обычный текст, картинки, видео)'
const messageToNurymFormat = (ctx, has_caption)=>{
  if(has_caption) return{parse_mode:'HTML', caption:`${ctx.update.message.caption || ''}\n\n<tg-emoji emoji-id="5368324170671202286">🦛</tg-emoji> ${ctx.update.message.from.username}-${ctx.update.message.chat.id}`, chat_id:ADMIN_CHAT_ID, disable_notification:true, reply_markup:adminKeyboard.reply_markup}
  else return [`${ctx.update.message.text}\n\n<tg-emoji emoji-id="5368324170671202286">🦛</tg-emoji> ${ctx.update.message.from.username}-${ctx.update.message.chat.id}`, {parse_mode:'HTML', chat_id:ADMIN_CHAT_ID, reply_markup:adminKeyboard.reply_markup, disable_notification:true}]
}
const messageToChannelFormat = (ctx, has_caption)=>{
  if(has_caption){
    let newCaption = ctx.update.callback_query.message.caption.split(' ')
    const chat_id = newCaption[newCaption.length-1].split('-')[1]
    newCaption[newCaption.length-1] = newCaption[newCaption.length-1].split('-')[0]
    newCaption = newCaption.join(' ')
    return {format:{chat_id:`@${CHANNEL_USERNAME}`, caption:newCaption}, chat_id}
  }else{
    let newText = ctx.update.callback_query.message.text.split(' ')
    const chat_id = newText[newText.length-1].split('-')[1]
    newText[newText.length-1] = newText[newText.length-1].split('-')[0]
    newText = newText.join(' ')
    return {format:[newText, {chat_id:`@${CHANNEL_USERNAME}`}], chat_id}
  }
}
const messageToUserAcceptedFormat = (ctx, chat_id, message_id)=>{
  return ['Урааа пост приняли', {chat_id, reply_markup:userKeyboard(message_id).reply_markup}]
}

bot.command('/start', async (ctx)=>{
  if(!ctx.update.ADMIN){
    await ctx.reply('Карочи это предложка')
  }
})
bot.action('accept_post', async(ctx)=>{
  if(ctx.update.ADMIN){
    await ctx.answerCbQuery('Post was accepted and descended to your channel', {callback_query_id:ctx.update.callback_query.id}).then(async ()=>{
      if(ctx.callbackQuery.message?.photo){
        const {format, chat_id} = messageToChannelFormat(ctx, true)
        const post = await ctx.sendPhoto(ctx.update.callback_query.message.photo[0].file_id, format)
        await ctx.sendMessage(...messageToUserAcceptedFormat(ctx,chat_id,post.message_id))
      } else if(ctx.callbackQuery.message?.video){
        const {format, chat_id} = messageToChannelFormat(ctx, true)
        const post = ctx.sendVideo(ctx.update.callback_query.message.video.file_id, format)
        await ctx.sendMessage(...messageToUserAcceptedFormat(ctx,chat_id,post.message_id))
      } else if (ctx.callbackQuery.message?.text){
        const {format, chat_id} = messageToChannelFormat(ctx, false)
        const post = await ctx.sendMessage(...format)
        await ctx.sendMessage(...messageToUserAcceptedFormat(ctx,chat_id,post.message_id))
      } else{
        await ctx.reply("we're doomed, message types are not supported")
      }
    }).then(async()=>{
      await ctx.deleteMessage()
    })
  }
})
bot.action('decline_post', async(ctx)=>{
  if(ctx.update.ADMIN){
    await ctx.answerCbQuery('Post was declined and sent to hell', {callback_query_id:ctx.update.callback_query.id}).then(async ()=>{
      await ctx.deleteMessage()
    })
  }
})
bot.on(message('text'), async(ctx)=>{
  if(!ctx.update.ADMIN){
    await ctx.sendMessage(...messageToNurymFormat(ctx, false))
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
      await ctx.sendPhoto(ctx.update.message.photo[0].file_id, messageToNurymFormat(ctx, true))
      await ctx.sendMessage(`👍`, {chat_id:ctx.update.message.chat.id})
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
      await ctx.sendVideo(ctx.update.message.video.file_id, messageToNurymFormat(ctx, true))
      await ctx.sendMessage(`👍`, {chat_id:ctx.update.message.chat.id})
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