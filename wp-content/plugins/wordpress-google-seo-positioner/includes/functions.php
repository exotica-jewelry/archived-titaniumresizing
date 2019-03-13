<?php
/*
* Position Yourself WP Plugin Functions
*/


/**
* Trims all array elements
* @return array
*/
if ( !function_exists('pyTrimArray') ) :
function pyTrimArray($totrim) {
	if (is_array($totrim)) {
		$totrim = array_map("trim", $totrim);
	} else {
		$totrim = trim($totrim);
	}
	return $totrim;
}
endif;

/*
* Output a clean version of array / object
*/
if ( !function_exists('pyPre') ) :
function pyPre($array) {
	echo "<pre>";
	print_r($array);
	echo "</pre>";
}
endif;


//Author Binu.v.Pillai
function diffTime($bigTime, $smallTime) {
//input format hh:mm:ss

	list($h1, $m1, $s1) = split(":", $bigTime);
	list($h2, $m2, $s2) = split(":", $smallTime);
   
	$second1 = $s1 + ( $h1*3600 ) + ( $m1*60 );//converting it into seconds
	$second2 = $s2 + ( $h2*3600 ) + ( $m2*60 );

	if ( $second1 == $second2 ) {
		$resultTime = "00:00:00";
		return $resultTime;
		exit();
	}
	if ( $second1 < $second2 ) {
		$second1 = $second1 + ( 24*60*60 );//adding 24 hours to it.
	}
	$second3 = $second1 - $second2;
	//print $second3;
	if ( $second3 == 0 ) {
		$h3 = 0;
	} else {
		$h3 = floor( $second3/3600 );//find total hours
	}
	
	$remSecond = $second3 - ( $h3*3600 );//get remaining seconds
	if ( $remSecond == 0 ) {
		$m3 = 0;
	} else {
		$m3 = floor( $remSecond / 60);// for finding remaining  minutes
	}
	   
	$s3 = $remSecond - ( 60*$m3 );
	if ( $h3 == 0 ) {
		$h3 = "00";
	}
	if ( $m3 == 0 ) {
		$m3="00";
	}
	if ( $s3 == 0 ) {
		$s3="00";
	}
	   
	$resultTime = "$h3:$m3:$s3";

	return $resultTime;
}
?>