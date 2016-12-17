# literary-halifax-mobile-app
Literary Halifax Mobile App

To run:

install [Node.js](https://nodejs.org/en/)

Clone this repository

npm install -g cordova ionic

navigate the 'literaryHalifax' folder

in www/js/server.js, change '192.168.2.14' to your localhost IP address

ionic serve

This will launch the app in a browser, but some parts of the app (specifically audio) won't work. To run the full version of the app on android, download and install the latest apk from [here](https://www.dropbox.com/sh/an112jsdms3pnfd/AACK8klx-eQ-c4R47w_VM6qpa?dl=0).

Chris G.'s notes one building for my mobile android device:
To run on your mobile device follow these instructions: http://www.neilberry.com/how-to-run-your-ionic-app-on-real-devices/
Had to make a licnese file though for android studio before I could build it (see http://stackoverflow.com/questions/40383323/cant-accept-license-agreement-android-sdk-platform-24) (I already had android studio installed from previously).
