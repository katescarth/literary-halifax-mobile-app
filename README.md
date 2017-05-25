# literary-halifax-mobile-app
Literary Halifax Mobile App

This is a GPL mobile client for omeka. It allows users to see landmarks and tours which are made up of landmarks, It also allows the user to cache content so that when visiting landmarks, they do not need to use data.

The app is built in ionic v1, and is free to use. To customize it for your own project:

* modify the files localization.js and localization.css.
* Change the background image by replacing BG1.jpg with your image of choice (using the name BG1.jpg). 
* Change the icon and splash screen by replacing icon.png and splash.png (these files can be found in the resources folder)

You will also need to set up an Omeka server which includes the following plugins:

* [TourBuilder](https://github.com/David-Owen-Walker/TourBuilder)
* [Landmarks](https://github.com/David-Owen-Walker/Landmarks)
* [Simple Pages](https://github.com/omeka/plugin-SimplePages)
* [Geolocation](https://github.com/omeka/plugin-Geolocation)


install [Node.js](https://nodejs.org/en/)

Clone this repository

npm install -g cordova ionic

npm install -g bower

navigate to the 'literaryHalifax' folder

bower install

modify www/lib/ngCordova/dist/ng-cordova.js according to [issue #13](https://github.com/katescarth/literary-halifax-mobile-app/issues/13)

# To run in a browser:

in www/js/cacheLayer.js, change '192.168.2.14' to your localhost IP address

ionic serve

This will launch the app in a browser, but some parts of the app (specifically audio and caching) won't work.

# Running in android

Download and install [Android SDK Command Line Tools](https://developer.android.com/studio/index.html#downloads) (but see [issue #15](https://github.com/katescarth/literary-halifax-mobile-app/issues/15): you may need an old version)

Launch the SDK manager and install build tools and platform for android 23

navigate to the 'literaryHalifax' folder

ionic run android

To run the full version of the app on android, download and install the latest apk from [here](https://www.dropbox.com/sh/an112jsdms3pnfd/AACK8klx-eQ-c4R47w_VM6qpa?dl=0). 

Chris G.'s notes one building for my mobile android device:
To run on your mobile device follow these instructions: http://www.neilberry.com/how-to-run-your-ionic-app-on-real-devices/
Had to make a licnese file though for android studio before I could build it (see http://stackoverflow.com/questions/40383323/cant-accept-license-agreement-android-sdk-platform-24) (I already had android studio installed from previously).
