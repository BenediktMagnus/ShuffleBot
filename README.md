# Shuffle

A networking bot for Discord that shuffles and distributes people into voice corners.

## Made possible by:

**Indie Treff e.V.** - [www.indietreff.de](http://www.indietreff.de/) \
The Hamburger Indie Treff (German for meetup) is the regular meetup for Hamburg indie developers. At the Treff folks get together to learn something, network and of course: play games.

# Manual

## Create a bot
  - Go to https://discord.com/developers/applications
  - Click on "New Application"
  - Name your Bot
  - Click on "Create"
  - Click on the "Bot" tab and then "Add Bot"
  - "Username" contains the name of your bot
  - "Token" is your bot's access token.
  - Under the tab "OAuth" is the client ID.
## Add the bot to your server
  - While in the applications view (see link above) for your bot, click on the "OAuth2" tab.
  - At the bottom below "OAuth2 URL Generator", select the following Scopes: "bot" and "applications.commands"
  - Copy and open the URL that showed up below.
  - Choose your server in the list.
  - Click on "Authorise".
  - Give the bot the "Manage channels", "Manage roles" and "Move members" permissions.
## Configure your server
  - Any role can be the bot control role (every member of the role will be allowed to use the bot's commands).
  - Any channel can be the info channel (where all info is written to).
    - Your bot needs write access there.
    - The bot control role needs write access there.
    - The bot control role must be allowed to use bot commands there.
  - Any voice channel can be the lobby (where the bot gets the people from to distribute to the meeting rooms).
  - In your Discord, activate the developer mode via:
    - User settings -> Advanced -> Developer mode
  - Click on any user in the bot control role, right click on the role and then on "Copy ID" to get the "controlGroupId".
  - Right click on the lobby channel and then on "Copy ID" to get the "lobbyChannelId".
## Install the bot
  - The bot is only tested on Linux (Ubuntu 21.04 and Debian 11). It may or may not work on other operating systems.
  - You need to have Node.JS (https://nodejs.org/) 16.0.0 or higher installed.
  - All dependencies are installed via `npm install` (NPM is shipped with Node.JS).
  - Minimal configuration:
    - Copy "data/config.json.default" to "data/config.json"
    - Set "name" to the name of your bot.
    - Set "clientId" to the bot's client ID.
    - Set "token" to the bot's access token.
## Start the bot
  - Start via `npm start`.
## Use the bot:
  - First configuration:
    - `/setlobbychannel @lobby` to set the lobby channel.
    - `/setmeetingroomname MeetingRoom` to set the name of each meeting room (suffixed with the room number).
    - `/setpeopleperroom number` to set the maximum number of people in each meating room.
    - `/setsecondsperround seconds` to set the seconds a round will last.
    - `/setsecondsbetweenrounds seconds` to set the seconds after a round before the next one will be started.
  - Show current settings:
    - `/showparameters`
  - Start shuffling:
    - `/start seconds` to start a round after the given amount of seconds. Will start immediately if no seconds are given.
  - End the shuffling:
    - `/end boolean` to end the shuffling. If given true, the bot will immediately return everyone to the lobby, if given false or nothing, the bot will start no new round after the current one but waits for it to finish.
