/**
 * Validate block rollbackers
 *
 * @desc Prevents that rollbackers in ptwikipedia blocks autoconfirmed users and of exceed the block limit (1 day).
 * @author [[w:pt:User:!Silent]]
 * @date 15/apr/2012
 * @updated 30/oct/2021
 */
/* jshint laxbreak: true, esversion: 8 */
/* global mw, $, URLSearchParams */

( function () {
'use strict';

mw.messages.set( {
	'vbr-noPermissionAutoconfirmed': 'Como reversor você não tem permissão para bloquear esse usuário, pois ele é um autoconfirmado.',
	'vbr-noPermissionHimself': 'Como reversor você não tem permissão para bloquear a si mesmo.'
} );

let $target;

/**
 * Verify if the user is an autoconfirmed
 * @return {jQuery.Deferred}
 */
async function vbr_isAutoconfirmed() {
	let requestResponse, requestData;

	requestResponse = await fetch( mw.util.wikiScript( 'api' ) + '?' + new URLSearchParams( {
		action: 'query',
		list: 'allusers',
		format: 'json',
		auprop: 'implicitgroups',
		aulimit: '1',
		aufrom: $target.val(),
		auto: $target.val()
	} ) );

	requestData = await requestResponse.json();

	return $.isEmptyObject( requestData.query.allusers )
		? false
		: ( $.inArray( 'autoconfirmed', requestData.query.allusers[ 0 ].implicitgroups ) !== -1 );
}

/**
 * Erase prohibited options to rollbackers
 * @param {string} wpExpiryTarget
 * @param {string} wpReasonTarget
 * @return {undefined}
 */
function vbr_eraseProhibitedOptions( wpExpiryTarget, wpReasonTarget ) {
	$( wpExpiryTarget ).each( function() {
		if ( $( this ).text().search( /((segundo|minuto|hora)s?|1 dia)/ ) === -1 )
			$( this ).remove();
	} );

	$( wpReasonTarget ).each( function() {
		if ( $( this ).text().search( /(vandalismo|Propaganda ou \[\[WP:SPAM|spam\]\])/i ) === -1
			|| $( this ).text().indexOf( 'IP com longo histórico' ) !== -1
		)
			$( this ).remove();
	} );

	$( '#ooui-8' ).next().remove();
	$( '#ooui-php-17' ).remove();
	$( 'input[name="wpExpiry-other"]').next().next().remove();
	$( 'input[name="wpExpiry-other"]').remove();
	$( 'optgroup[label="Motivos predefinidos"]').remove();
	$( '#mw-input-wpEditingRestriction label[role="radio"]' ).eq( 1 ).remove();
}

/**
 * Executes
 * @return {undefined}
 */
async function vbr_run() {
	if ( $target.val() === mw.config.get( 'wgUserName' ) ) {
		$( '#mw-content-text' ).html( mw.message( 'vbr-noPermissionHimself' ).plain() );
		return;
	}

	if ( await vbr_isAutoconfirmed() ) {
		$( '#mw-content-text' ).html( mw.message( 'vbr-noPermissionAutoconfirmed' ).plain() );
	}

	vbr_eraseProhibitedOptions.apply(
		undefined,
		location.hostname !== 'pt.m.wikipedia.org'
			? [ '#ooui-7 div', '#ooui-2 div' ]
			: [ 'select[name="wpExpiry"] option', 'select[name="wpReason"] option' ]
	);

	$target.blur( async () => {
		if ( await vbr_isAutoconfirmed() ) {
			alert( mw.message( 'vbr-noPermission' + ( $target.val() === mw.config.get( 'wgUserName' ) ? 'Himself' : 'Autoconfirmed' ) ).plain() );
			$target.val( '' ).focus();
		}
	} );
}

$( function() {
	$target = $( 'input[name="wpTarget"]' );
	vbr_run();
} );

}() );
