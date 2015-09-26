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

var main = new UI.Card({
    title: 'Pebble Connect',
    icon: 'images/menu_icon.png',
    subtitle: 'Loading...'
});
main.show();



// register the traverson-hal plug-in for media type 'application/hal+json'
traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);

// use Traverson to follow links, as usual
var api = traverson.from('http://192.168.1.134:8080')
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
                sections: [{
                        items: items
                    }]
            });
            menu.on('select', function (e) {
                var newFollow = follow.slice();
                newFollow.unshift('item[' + e.itemIndex + ']');

                if (resource[e.itemIndex].action) {
                    var url = api.getFrom() + resource[e.itemIndex]._links.self.href;
                    ajax({
                        method: 'POST',
                        url: url
                    });
                    return;
                }
                loadMenu(newFollow);
            });
            menu.show();
        });
};
loadMenu(['item[$all]']);