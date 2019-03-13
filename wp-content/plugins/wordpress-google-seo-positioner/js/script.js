function addNewCompetitorField() {
	jQuery("table#competitor-list tr:first")
		.clone()
		.appendTo("table#competitor-list tbody");
	
	jQuery("table#competitor-list tr:last td input").val('');
	
	jQuery('<span><a href="javascript:void(0);" class="remove-link"><img src="http://test.quero.lcl/KimPress/wp-content/plugins/positioner/images/remove.png" alt="Remove" align="absbottom" /></a></span>').insertAfter("table#competitor-list tr:last td input").click();
	//jQuery("a").append("table#competitor-list tr:last td input");
	
	jQuery("table#competitor-list tr:last td span a").click(function() {
		jQuery("table#competitor-list tr:last").remove();
	});
	/*jQuery("table#competitor-list tr:last").click(function() {
		jQuery(this).remove();
	});*/	
}