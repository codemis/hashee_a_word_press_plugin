/**
 * The modules main javascript file the hasheeSettings var is in the module
 * hash_tags: the hashtags to pull
 * result_type: type of results to pull (recent, popular, mixed)
 * load_per_pull_max: maximum number of tweets to load
 * refresh: how often to refresh the map in seconds
 * map_max: maximum number of pins on the map at one time
 * list_all_tweets: list all tweets no matter if they have geo code
 */
/**
 * holds the current tweet ids on the map 
 */
var current_tweets = [];
/**
 * The google map object 
 */
var hashee_map = '';
/**
 * an iterator integer 
 */
var hasheeIterator = 0;
/**
 * an iterator integer for tweets 
 */
var hasheeTweetIterator = 0;
/**
 * current markers 
 */
var hasheeMarkers = [];
/**
 * all markers on the map
 */
var allHasheeMarkers = [];
/**
 * object of the opened info window 
 */
var openedInfoWindow = null;
/**
 * The hasheeSettings object 
 */
var hasheeSettings = {};
/**
 * Set the hasheeSettings var 
 */
function setSettings(settings) {
  hasheeSettings = settings;
};
/**
 * Grab the tweets related to the selected hashtags 
 */
function getTweetsForHashees() {
  /**
   * reset all global vars 
   */
  hasheeIterator = 0;
  hasheeMarkers = [];
  var hashtags = encodeURIComponent(hasheeSettings.hash_tags);
  var rpp = hasheeSettings.load_per_pull_max * 3;
  jQuery.getJSON("http://search.twitter.com/search.json?result_type="+hasheeSettings.result_type+"&rpp="+rpp+"&callback=?&q="+hashtags, 
    function (response) {
      mapHashee(response);
  });
};
/**
 * iterates over tweets, and finds new ones , and adds to map 
 */
function mapHashee(tweets) {
  var new_markers = [];
  var marker_details = [];
  var tweet_list_items = [];
  var total_tweets = 1;
  var total_tweet_list_items = 1;
  jQuery.each(tweets.results.reverse(), function(index, tweet) {
    /**
     * Only get tweets with Geo Code and that have not been displayed 
     */
    if(jQuery.inArray(tweet.id, current_tweets) == -1) {
      if (tweet.geo) {
        if(tweet.geo.type == 'Point') {
          var lat = tweet.geo.coordinates[0];
          var lng = tweet.geo.coordinates[1];
          if(total_tweets <= hasheeSettings.load_per_pull_max) {
            new_markers.push(new google.maps.LatLng(lat, lng));
            marker_details.push(tweet);
            current_tweets.push(tweet.id);
            if(total_tweet_list_items <= hasheeSettings.load_per_pull_max) {
              tweet['add_geocode_class'] = true;
              tweet_list_items.push(tweet);
              total_tweet_list_items++;
            }
          } 
        }
        total_tweets++;
      }else {
        if(hasheeSettings.list_all_tweets == 'true' && total_tweet_list_items <= hasheeSettings.load_per_pull_max) {
          /**
           * Only list the maximum they want per pull 
           */
          tweet['add_geocode_class'] = false;
          tweet_list_items.push(tweet);
          current_tweets.push(tweet.id);
          total_tweet_list_items++;
        }
      }
    }
  });
  if(new_markers.length != 0) {
   hasheeDropPins(new_markers, marker_details); 
  }
  /**
   * If we have tweets to list, and the div is available, then list them 
   */
  if(tweet_list_items.length != 0 && jQuery('#'+hasheeSettings.tweet_list_id).length != 0) {
    hasheeAddTweetsToList(tweet_list_items);
  }
};
/**
 * Add the marker to the map 
 */
function hasheeAddMarker(new_markers, marker_details) {
  var user = (marker_details[hasheeIterator].from_user != undefined)  ? marker_details[hasheeIterator].from_user : 'Anonymous';
  var marker = new google.maps.Marker({
    position: new_markers[hasheeIterator],
    map: hashee_map,
    draggable: false,
    title: user
  });
  hasheeMarkers.push(marker);
  allHasheeMarkers.push(marker);
  
  if (allHasheeMarkers.length >= hasheeSettings.map_max) {
    /**
     * remove the oldest marker 
     */
    remove_marker = allHasheeMarkers.shift();
    remove_marker.setMap(null);
  }
  var content_string = hasheeCreateBubble(marker_details[hasheeIterator]);
  var infowindow = new google.maps.InfoWindow({
      content: content_string.html()
  });
  new google.maps.event.addListener(marker, 'click', function() {
    if (openedInfoWindow != null) openedInfoWindow.close();
    infowindow.open(hashee_map,marker);
    openedInfoWindow = infowindow;
  });
  new google.maps.event.addListener(infowindow, 'closeclick', function() {
      openedInfoWindow = null;
  });
  hasheeIterator++;
};
/**
 * Add the tweets to the list
 * @param array tweet_list_items a list of tweets
 */
function hasheeAddTweetsToList(tweet_list_items) {
  var interval_speed = hasheeSettings.refresh/tweet_list_items.length;
  for (var i =0; i < tweet_list_items.length; i++) {
    var content_string = "";
    content_string = hasheeCreateBubble(tweet_list_items[i]);
    jQuery('<div>').addClass('single-tweet').html(content_string).hide().prependTo('#'+hasheeSettings.tweet_list_id).delay(i * interval_speed).slideDown('fast');
  }
};
/**
 * Get the template to display 
 */
function hasheeCreateBubble(tweety) {
  if(tweety.created_at) {
    var d = new Date(tweety.created_at);
    tweety['pp_created_on'] = getTweetDate(d)+" "+getTweetTime(d);
  }
  hasheeTweetIterator++;
  tweety['iterator'] = hasheeTweetIterator;
  tweety['from_user'] = (tweety['from_user'] != undefined)  ? tweety['from_user'] : 'Anonymous';
  if(tweety['add_geocode_class'] != undefined){
     tweety['geocode_class'] = (tweety['add_geocode_class'] === true)  ? 'geocoded' : '';
  }
  return jQuery("#hasheeBubbleTemplate").tmpl(tweety);
};
/**
 * Slow down the marker drop 
 */
function hasheeDropPins(new_markers, marker_details) {
  var interval_speed = hasheeSettings.refresh/new_markers.length;
  for (var i =0; i < new_markers.length; i++) {
    setTimeout(function() {
      hasheeAddMarker(new_markers, marker_details);
    }, i * interval_speed);
  }
  if(hasheeSettings.center_map == 'true' && new_markers.length > 1) {
    /**
     * Autocenter the map on the given pins 
     */
    hasheeAutoCenter(); 
  }
};
/**
 * Auto center the map 
 */
function hasheeAutoCenter() {
   //  Create a new viewpoint bound
   var bounds = new google.maps.LatLngBounds();
   //  Go through each...
   jQuery.each(allHasheeMarkers, function (index, marker) {
     bounds.extend(marker.position);
   });
   //  Fit these bounds to the map
   hashee_map.fitBounds(bounds);
};
function getTweetTime(date) {
  var curr_hour = date.getHours();
  if (curr_hour < 12){
    a_p = "AM";
  }else {
    a_p = "PM";
  }
  if (curr_hour == 0) {
    curr_hour = 12;
  }
  if (curr_hour > 12) {
    curr_hour = curr_hour - 12;
  }
  var curr_min = date.getMinutes();
  curr_min = curr_min < 10 ? "0" + curr_min : curr_min;
  return curr_hour + ":" + curr_min + " " + a_p;
};
function getTweetDate(date) {
  var m_names = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
  var curr_date = date.getDate();
  var curr_month = date.getMonth();
  var curr_year = date.getFullYear();
  return  m_names[curr_month]+", "+curr_date+" "+curr_year;
};