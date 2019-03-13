<?php
/*
* Position Yourself WP Plugin Classes
*/


class Positioner {
	var $start;
	var $end;
	var $region;
	var $language;
	var $meta			= '';
	var $num_results	= 30;
	var $queries 		= array();
}


class GoogleQuery {
	/**
    * @keyword 		string		The keyword
	* @region 		string		The Google region (.com, .be, .nl, ...)
	* @language 	string		The Google language (hl=nl, hl=en, ...)
    * @query 		string		The Google keyword query string
    * @url 			string		The Google query url
    * @position 	int			The position of the domain for this keyword in Google
	* @options 		string		The Google options (meta=)
	* @num_results 	int			The Google number of results to keep track of
	* @num_queries 	int			The number of Google queries
	* @results 		array		The Google results
    */
	var $keyword;
	var $region;
	var $language;
    var $query;
    var $url			= 'http://www.google.';
    var $top_position	= 0;
	var $top_url		= '';
	var $meta			= '';
	var $num_results	= 30;
	var $num_queries	= 0;
	var $results 		= array();
	var $matches 		= array();
	var $competitors	= array();
	
    /**
    * PHP 4 Compatible Constructor
    */
    function GoogleQuery($keyword, $region, $language, $num_results = 30, $options = '') {
		$this->__construct($keyword, $region, $language, $num_results, $options);
	}
    
    /**
    * PHP 5 Constructor
    */		
    function __construct($keyword, $region, $language, $num_results = 30, $meta = '') {
	
    	$this->keyword 		= (string) 	trim($keyword);
		
		$this->region 		= (string) 	$region;
		$this->language 	= (string) 	$language;
		
		$this->num_results 	= (int) 	$num_results;
		$this->meta			= (string)	$meta;
		
		$this->query		= (string)	( $this->build_query() !== false ) ? $this->build_query() : $this->keyword;
		$this->url			= (string)	$this->build_url();
    }
    
	/**
	* Get the results for a certain keyword
	*/
	function set_results() {
		//	fetch the result for the url of this queryObject
		$parse_result = array();
		$parse_result = (array)$this->parse($this->url);
		
		if ( is_array($parse_result) && count($parse_result) > 0 ) {
			//	remove first one
			array_splice( $parse_result, 0, 1);
			//	remove last two
			array_splice( $parse_result, (count($parse_result)-2), 2);
		}
		
		if ( count($parse_result) > 0 ) $this->num_queries++;
		
		$this->results = (array) $parse_result;
	}
	
	/**
	* Parses an URL through Snoopy
	* @return string
	*/
	function parse($url) {
		global $snoopy;
		
		$snoopy->results = '';
		// set browser
		$snoopy->agent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; nl; rv:1.8.1.13)";

		// set a raw-header
		$snoopy->rawheaders["Pragma"] = "no-cache";
		// fetch the links of the website
		if ($snoopy->fetchlinks($url)) {
			return $snoopy->results;
		} else {
			return $snoopy->error;
		}
	}
	
	
	/**
	* Returns a querified representation of a keyword
	* @return string
	*/
    function build_query() {
		
		$query_keyword = '';
		
		if ($this->keyword) {
			$keyword = $this->keyword;
			if (!preg_match('#\"(.*?)\"#i', $keyword) ) {
				//	split on spaces
				$keywords 	= explode(' ', $keyword);
				//	url encode each part
				$keywords 	= array_map("urlencode", $keywords);
				//	glue back together with +
				$query 		= implode("+", $keywords);
			} else {
				$query = urlencode($keyword);
			}
			return $query;
		} else 
			return false;
    }
	
	/**
	* Returns the url of the Google query
	* @return string
	*/
    function build_url() {
		
		$url  = '';
		$url  = $this->url;
		$url .= $this->region;
		$url .= "/ie?hl=". $this->language;
		$url .= "&q=".$this->query;
		$url .= "&num=".$this->num_results;
		$url .= "&sa=N";
		$url .= "&filter=0";
		$url .= $this->options;

    	return $url;
    }
	
	/**
	* Returns matches in an array as an array
	* @return array
	*/
    function find_matches($results, $url) {
		$matches = array();
		$matches = preg_grep("#^$url#", $results);
		
		if ( count($matches) > 0 ) {
			$this->matches = $matches;

			return $matches;
		} else
			return 0;
	}
	
	/**
	* Returns highest position in matches
	* @return int
	*/
    function find_top_position() {
		
		if ( count($this->matches) > 0 ) {
			$top = 0;
			while ($top == 0 && (list($position, $url) = each($this->matches))) {
				$top 		= (int)((int)$position + 1);
				$top_url 	= $url;
			}		
			$this->top_position = $top;
			$this->top_url 		= $top_url;
		}
	}
	
	/**
	* Returns highest competitor position in competitormatches
	* @return int
	*/
    function find_top_competitor_position($results) {
		
		$top["position"]	= 0;
		$top["url"]			= '';
		
		if ( is_array($results) ) {
		
			while ( $top["position"] == 0 && (list($position, $url) = each($results) ) ) {
			
				$top["position"] 	= (int)((int)$position + 1);
				$top["url"]			= $url;
			}
		}
		return $top;
	}
	
	/**
	* Returns a string representation of a query
	* @return string
	*/
    function to_string($display = 'raw') {
		switch($display) {
			case "list": {
				echo "<br />print as list";
			}
			break;
			
			case "row": {
				echo "<br />print as table row";
			}
			break;
			
			case "raw": {
				pyPre($this);
			}
			break;
		}
    	//return $string;
    }
}
?>