<?php
/*
Plugin Name: Hashee
Plugin URI: 
Description: A google map that displays GEO Information for a Twitter Hashtag.  It also streams a list of current tweets.
Version: 1.0.0-alpha
Author: Codemis
Author URI: http://www.codemis.com
License: 
*/
class Hashee {
	/**
	 * The default options if not set.  Set null if it cannot display without tag
	 *
	 * @var array
	 * @access public
	 */
	public $optionDefaults = array(	'hashtags' => null, 'type' => 'recent', 'tweet_list' => 'false', 
												'all_tweets' => 'false', 'pin_interval' => 1500, 'tweets_per_pull' => 10,
												'refresh_rate' => 20000, 'max_pins' => 10);
	/**
	 * An array of hashee settings
	 *
	 * @var array
	 * @access public
	 */
	public $hasheeSettings = array();
	/**
	 * The plugin path
	 *
	 * @var string
	 * @access public
	 */
	public $pluginPath = '';
	/**
	 * The id for the map
	 *
	 * @var string
	 * @access public
	 */
	public $mapId = "hashee-map";
	/**
	 * The id for the tweet list
	 *
	 * @var string
	 * @access public
	 */
	public $tweetListId = "hashee-tweet-list";
	
	/**
	 * Construct the class
	 *
	 * @access public
	 * @author Johnathan Pulos
	 */
	function __construct() {
		$this->pluginPath = trailingslashit(plugins_url(null,__FILE__));
	}
	
	/**
	 * Find the hashee tag [hashee_display settings...]
	 *
	 * @param string $content the content to pars
	 * @return string
	 * @access public
	 * @author Johnathan Pulos
	 */
	function hasheeDisplay($content) {
		$this->hasheeSettings = $this->getSettings($content);
		if(empty($this->hasheeSettings)) {
			return $content;
		}
		$hasheeEle = "<div id='" . $this->mapId . "'></div>";
		if($this->hasheeSettings['tweet_list'] == 'true') {
			$hasheeEle .= "<div id='" . $this->tweetListId . "'></div>";
		}else {
			$this->tweetListId = '';
		}
		return preg_replace("/(\[hashee_display .*\])/", $hasheeEle, $content);
	}
	
	/**
	 * Load the scripts in use
	 *
	 * @return void
	 * @access public
	 * @author Johnathan Pulos
	 */
	function loadScripts() {
		wp_enqueue_script('jquery');
		wp_enqueue_script('jquery.tmpl', $this->pluginPath . 'js/jquery.tmpl.js');
		wp_enqueue_script('hashee_app', $this->pluginPath . 'js/hashee_app.js');
?>
 		<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
		<script id="hasheeBubbleTemplate" type="text/x-jquery-tmpl">
			<div class="tweet"><div id="${from_user_id}"><img src="${profile_image_url}" style="float:left; margin-right: 5px;" />${text} by ${from_user}<br><small>${pp_created_on}</small></div></div>
		</script>
<?php
	}
	
	/**
	 * Load the necessary styles
	 *
	 * @return void
	 * @access public
	 * @author Johnathan Pulos
	 */
	function loadStyles() {
		wp_register_style('hashee_styles', $this->pluginPath . 'css/hashee_styles.css');
		wp_enqueue_style('hashee_styles');
	}
	
	/**
	 * adds the document ready script if the tag is present
	 *
	 * @return void
	 * @access public
	 * @author Johnathan Pulos
	 */
	function addOnLoadScript() {
		if(!empty($this->hasheeSettings)) {
?>
			<script type="text/javascript" charset="utf-8">
				jQuery(document).ready(function() {
				 setSettings({	
												place_pin_interval: <?php echo $this->hasheeSettings['pin_interval']; ?>, 
												hash_tags: '<?php echo $this->hasheeSettings['hashtags']; ?>', 
												result_type: '<?php echo $this->hasheeSettings['type']; ?>', 
												load_per_pull_max: <?php echo $this->hasheeSettings['tweets_per_pull']; ?>, 
												refresh: <?php echo $this->hasheeSettings['refresh_rate']; ?>, 
												map_max: <?php echo $this->hasheeSettings['max_pins']; ?>,
												add_tweet_list: '<?php echo $this->hasheeSettings['tweet_list']; ?>',
												map_id: '<?php echo $this->mapId; ?>',
												tweet_list_id: '<?php echo $this->tweetListId; ?>',
												list_all_tweets: '<?php echo $this->hasheeSettings['all_tweets']; ?>'
										});
										var hasheePollingRate = hasheeSettings.refresh;
										var myLatlng = new google.maps.LatLng(20, -10);
										var myOptions = {
									    zoom: 1,
									    center: myLatlng,
									    mapTypeId: google.maps.MapTypeId.ROADMAP
									  };
										hashee_map = new google.maps.Map(document.getElementById('<?php echo $this->mapId; ?>'), myOptions);
										setInterval('getTweetsForHashees()', hasheePollingRate);
										getTweetsForHashees();
				});
			</script>
<?php
		}
	}
	
	/**
	 * Get the settings provided by the hashee tag [hashee_display settings...]
	 *
	 * @param string $content content to search
	 * @return array
	 * @access private
	 * @author Johnathan Pulos
	 */
	private function getSettings($content) {
		$options = array();
		preg_match("/\[hashee_display(.*)\]/", $content, $userOptions);
		if(array_key_exists(1, $userOptions)) {
			foreach ($this->optionDefaults as $key => $value) {
				preg_match('/'.$key.'="([^"]*)"/', $userOptions[1], $matches);
				if(array_key_exists(1, $matches)) {
					$options[$key] = $matches[1];
				}else {
					if($value == null) {
						return array();
					}else {
						$options[$key] = $value;
					}
				}
			}
		}
		return $options;
	}
	
}
$hasheePlugin = new Hashee();
add_filter('the_content', array($hasheePlugin, 'hasheeDisplay'), 5);
add_action('wp_print_scripts', array($hasheePlugin,'loadScripts'));
add_action('wp_print_styles', array($hasheePlugin, 'loadStyles'));
add_action('wp_print_footer_scripts', array($hasheePlugin, 'addOnLoadScript'));
?>