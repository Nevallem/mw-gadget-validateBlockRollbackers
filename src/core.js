/**
 * Validate block rollbackers
 *
 * @desc Prevents that rollbackers in ptwikipedia blocks autoconfirmed users and of exceed the block limit (1 day).
 * @author [[w:pt:User:!Silent]]
 * @date 15/apr/2012
 * @updated 04/jul/2021
 */
/* jshint laxbreak: true */
/* global mw, $ */

( function () {
'use strict';

mw.messages.set( {
	'vbr-noPermissionAutoconfirmed': 'Como reversor você não tem permissão para bloquear esse usuário, pois ele é um autoconfirmado.',
	'vbr-noPermissionHimself': 'Como reversor você não tem permissão para bloquear a si mesmo.'
} );

var $target, queue;

/**
 * Verify if the user is an autoconfirmed
 * @return {jQuery.Deferred}
 */
function isAutoconfirmed() {
	var apiDeferred = $.Deferred();

	// Prevents more than one request
	if ( !queue )
		queue = 1;
	else
		return apiDeferred.promise();

	$.getJSON( mw.util.wikiScript( 'api' ), {
		action: 'query',
		list: 'allusers',
		format: 'json',
		auprop: 'implicitgroups',
		aulimit: '1',
		aufrom: $target.val(),
		auto: $target.val()
	}, function ( data ) {
		apiDeferred.resolve(
			$.isEmptyObject( data.query.allusers )
				? false
				: ( $.inArray( 'autoconfirmed', data.query.allusers[ 0 ].implicitgroups ) !== -1 )
		);

		queue = 0;
	} );

	return apiDeferred.promise();
}

/**
 * Erase prohibited options to rollbackers
 * @param {string} wpExpiryTarget
 * @param {string} wpReasonTarget
 * @return {undefined}
 */
function eraseProhibitedOptions( wpExpiryTarget, wpReasonTarget ) {
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
}

/**
 * Executes
 * @return {undefined}
 */
function validateBlockRollbackers() {
	if ( $target.val() === mw.config.get( 'wgUserName' ) ) {
		$( '#mw-content-text' ).html( mw.message( 'vbr-noPermissionHimself' ).plain() );
		return;
	}

	isAutoconfirmed().done( function ( confirmed ) {
		if ( confirmed )
			$( '#mw-content-text' ).html( mw.message( 'vbr-noPermissionAutoconfirmed' ).plain() );
	} );

	eraseProhibitedOptions.apply(
		undefined,
		location.hostname !== 'pt.m.wikipedia.org'
			? [ '#ooui-7 div', '#ooui-2 div' ]
			: [ 'select[name="wpExpiry"] option', 'select[name="wpReason"] option' ]
	);

	$target.blur( function () {
		isAutoconfirmed().done( function ( confirmed ) {
			if ( confirmed ) {
				alert( mw.message( 'vbr-noPermission' + ( $target.val() === mw.config.get( 'wgUserName' ) ? 'Himself' : 'Autoconfirmed' ) ).plain() );
				$target.val( '' ).focus();
			}
		} );
	} );

	$( '#ooui-8' ).next().remove();
	$( '#ooui-php-14' ).remove();
	$( '#ooui-php-15' ).remove();
	$( '#ooui-php-16' ).remove();
	$( '#ooui-php-17' ).remove();
	$( '#ooui-php-18' ).remove();
	$( 'input[name="wpExpiry-other"]').next().next().remove();
	$( 'input[name="wpExpiry-other"]').remove();
	$( 'optgroup[label="Motivos predefinidos"]').remove();
	$( '#mw-input-wpEditingRestriction label[role="radio"]' ).eq( 1 ).remove();
}

$( function() {
	$target = $( 'input[name="wpTarget"]' );
	validateBlockRollbackers();
} );

}() );
