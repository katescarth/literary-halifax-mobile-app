angular-dotdotot
================

Angular directive for applying the dotdotdot jquery plugin- http://dotdotdot.frebsite.nl/

Usage:
------
Include the directive in your app (see js/angular-dotdotdot.js).

Then in your controller:

    $scope.myText = 'some really long text';

Template:

	<p dotdotdot='myText'>{{myText}}</p>
