/**
 * Validate block rollbackers
 *
 * @desc Prevents that rollbackers in ptwikipedia blocks autoconfirmed users and of exceed the block limit (1 day).
 * @author [[w:pt:User:!Silent]]
 * @date 15/apr/2012
 * @updated 22/mar/2020
 */
/* jshint laxbreak: true */
/* global mw, $ */

( function () {
'use strict';

mw.messages.set( {
	'vbr-noPermissionAutoconfirmed': 'Como Reversor, você não tem permissão para bloquear esse usuário, pois ele é um autoconfirmado.',
	'vbr-noPermissionHimself': 'Como Reversor, você não tem permissão para bloquear a si mesmo.'
} );

var $target, queue;

/**
 * Verify if the user is an autoconfirmed
 * @return {jQuery.Deferred}
 */
function isAutoconfirmed() {
	var apiDeferred = $.Deferred();

	// Prevents more than one request
	if ( !queue ) {
		queue = 1;
	} else {
		return apiDeferred.promise();
	}

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
 * Executes
 * @return {undefined}
 */
function validateBlockRollbackers() {
	if ( $target.val() === mw.config.get( 'wgUserName' ) ) {
		$( '#mw-content-text' ).html( mw.message( 'vbr-noPermissionHimself' ).plain() );
		return;
	}

	isAutoconfirmed().done( function ( confirmed ) {
		if ( confirmed ) {
			$( '#mw-content-text' ).html( mw.message( 'vbr-noPermissionAutoconfirmed' ).plain() );
		}
	} );

	$( '#ooui-5 div' ).each( function() {
		if ( $( this ).text().search( /((segundo|minuto|hora)s?|1 dia)/ ) === -1 ) {
			$( this ).remove();
		}
	} );

	$( '#ooui-1 .oo-ui-optionWidget' ).each( function() {
		if ( $( this ).text().search( /(vandalismo|Propaganda ou \[\[WP:SPAM|spam\]\])/i ) === -1
			|| $( this ).text().indexOf( 'IP com longo histórico' ) !== -1
		) {
			$( this ).remove();
		}
	} );

	$target.blur( function () {
		isAutoconfirmed().done( function ( confirmed ) {
			if ( confirmed ) {
				alert( mw.message( 'vbr-noPermission' + ( $target.val() === mw.config.get( 'wgUserName' ) ? 'Himself' : 'Autoconfirmed' ) ).plain() );
				$target.val( '' ).focus();
			}
		} );
	} );

	$( '#mw-input-wpExpiry .oo-ui-indicatorElement-indicator' ).remove();
	$( '#mw-input-wpExpiry .oo-ui-buttonElement-framed' ).eq( 1 ).remove();
	$( '#ooui-7' ).next().remove();
	$( '#ooui-8' ).remove();
}

$( function() {
	$target = $( 'input[name="wpTarget"]' );
	validateBlockRollbackers();
} );

}() );