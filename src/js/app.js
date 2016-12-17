/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var _ = require('underscore');
var traverson = require('traverson');
var JsonHalAdapter = require('traverson-hal');

var apiHost = 'http://192.168.1.15:8080';

// Loading page
var main = new UI.Card({
    title: 'PConnect',
    icon: 'images/menu_icon.png',
    subtitle: 'Loading...'
});
main.show();

// register the traverson-hal plug-in for media type 'application/hal+json'
traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);

// use Traverson to follow links, as usual
var api = traverson.from(apiHost)
        .jsonHal();
var loadMenu = function (follow) {
    api.newRequest()
        .follow(follow.slice())
        .getResource(function (error, resource) {
            if (error) {
                console.error('No luck :-)', error, follow);
                return;
            }

            if (main) {
                main.hide();
                main = null;
            }

            console.log('We have followed the path and reached our destination.');
            console.log(JSON.stringify(resource, null, '  '));
            console.log(JSON.stringify(follow, null, '  '));

            var items = _.map(resource, function (item) {
                return {
                    title: item.title
                };
            });

            var menu = new UI.Menu({
                backgroundColor: 'white',
                textColor: 'black',
                highlightBackgroundColor: 'dukeBlue',
                highlightTextColor: 'white',
                sections: [{
                        items: items
                    }]
            });
            menu.on('select', function (e) {
                var newFollow = follow.slice();
                newFollow.unshift('item[' + e.itemIndex + ']');

                if (resource[e.itemIndex].action) {
                    var notification = new UI.Card({
                        title: 'Sending Command...'
                    });
                    notification.show();

                    var url = api.getFrom() + resource[e.itemIndex]._links.self.href;
                    ajax({
                        method: 'POST',
                        url: url
                    }, function (data, statusCode) {
                        var timeout = 250;
                        notification.subtitle('Sent! :)');
                        setTimeout(function() {
                            notification.hide();
                        }, timeout);
                    }, function (){
                        notification.subtitle('An error occured :(');
                    });
                    return;
                }
                loadMenu(newFollow);
            });
            menu.show();
        });
};
loadMenu(['item[$all]']);