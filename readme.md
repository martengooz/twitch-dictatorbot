# Dictatorbot
A Twitch chat bot that keeps track of how many times a user has had it's messages deleted in chat.

## Installation
`$ npm install`

## Configuration
A config template file can be found in src/cfg.template.json, use this to create a cfg.json located in the same directory. 

`username` Username that the bot will post from

`password` An oAuth token. This can be generated at [twitchapps.com/tmi](https://twitchapps.com/tmi/).

`channels` A list of channels that the bot will connect to and listen for deleted messages.

`dbPath` Path to where the db json files should be stored.

`defaultValues` The default config for new channels. 

&nbsp;&nbsp;&nbsp;&nbsp;`channelName` Does not need configuration. Will be overwritten.

&nbsp;&nbsp;&nbsp;&nbsp;`deletedMessages` Does not need configuration. This is where the list of deleted messages is stored.

&nbsp;&nbsp;&nbsp;&nbsp;`excludedUsers` List of users that should be ignored. Could be other chatbots or moderators. 

&nbsp;&nbsp;&nbsp;&nbsp;`noTopList` The maximum number of users to display in the toplist. Keep in mind that Twitch has a limit of 500 charachters per message.

&nbsp;&nbsp;&nbsp;&nbsp;`messages` What the bot will reply with when that command is issued. 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `help` Is called when a user says "!\<bot username> help" in chat. No variables available.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `topList` Is called when a user says "!\<bot username>" in chat (default command). Available variables `${topList}` - is replaced with the toplist.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `topList empty` Is called when a user says "!\<bot username>" in chat, but the toplist is empty. Available variables `${channel}` - is replaced with the current twitch channel. 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `specificUser` Is called when a user says "!\<bot username> @\<username>" in chat. Available variables `${user}` - The specified user, `${num}` - the number of times the specified user has had its messages deleted. 

`webUrls` Does not need configuration. When a new channel is added, a secret key is generated to access the channels config from the web server at \<ip or domain name>:\<webserverPort>/\<secret>. Eg. `http://localhost:3000/52597879-95b9-4092-89a4-2e13095b6e82` 

`webServerPort` The port that the web server should listen on.


## Run the application

### Build for production
```
$ npm run deploy
$ node dist/bot.js
```

### For development (with hot reload)
```$ npm run dev```

#### Linting
```$ npm run lint```

#### Tests (coverage)
```$ npm run test```

#### Tests (autorun)
```$ npm run test:watch```

## Technologies
* Nodejs / Typescript
* Jest
* Webpack
* Express