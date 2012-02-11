# Hashee (Word Press Plugin)
Hashee is a Google Map and Twitter API mashup designed to geographically displays tweets belonging to a set of supplied hashtags.  This plugin generates a Google Map and pinpoints tweets upon that map based on the supplied hashtags.  You can also display the tweets in a list, or all tweets that are tagged with the given hashtags but not geo coded.
## Required
* Word Press 3.1 or higher
## Installation
1. Download or clone this Github repo.
2. Upload this folder into the Word Press Site in wp-content/plugins directory
3. Login to your Word Press admin area, and click on the "Plugins" link in the left navigation
4. Find Hashee in the list of plugins, and click activate
## To Embed a Hahee Map
On the page or post that you would like to embed the Hashee Map,  just add the following tag:

	[hashee_display hashtags="#culture" type="recent" tweet_list="true" all_tweets="true"]

There are several options you can set on this tag.  Here they are:

* hashtags __(required)__ - A single or multiple hashtags to display.  Add the hash symbol (#) to the tag
* type (default: recent) - The type of search to use. Your options are:
	* mixed - Include both popular and real time results in the response
	* recent - return only the most recent results in the response
	* popular - return only the most popular results in the response
* tweet_list (default: false) - Do you want to display a list of tweets under the map.
* all_tweets (default: false) - Do you want to display tweets in the list that are not geo coded.
* pin_interval (default: 1500) - The number of seconds between each pin drop
* tweets_per_pull (default: 10) - The max number of tweetspulled at one time.  This number is multiplied by 3.
* refresh_rate (default: 2000) - The number of seconds between pulling of the tweets.
* max_pins (default: 10) - The max number of pins to display every time it pulls the tweets
## Development
Questions or problems? Please post them on the [issue tracker](https://github.com/codemis/hashee_a_word_press_plugin/issues). You can contribute changes by forking the project and submitting a pull request. You can ensure the tests passing by running `bundle` and `rake`.

This plugin is created by Johnathan Pulos and is under the MIT License.