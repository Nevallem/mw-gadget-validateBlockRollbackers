/**
 * Validate block rollbackers
 *
 * @desc Prevents rollbackers in ptwikipedia blocks autoconfirmed users and of exceed the block limit (1 day).
 * @author [[w:pt:User:!Silent]]
 * @date 15/apr/2012
 * @updated 25/jun/2025
 */
/* jshint laxbreak: true, esversion: 8 */
/* global mw, $ */

( function () {
'use strict';

// Messages preset
mw.messages.set( {
	'vbr-noPermissionAutoconfirmed': 'Como reversor você não tem permissão para bloquear esse usuário, pois ele é um autoconfirmado.',
	'vbr-noPermissionHimself': 'Como reversor você não tem permissão para bloquear a si mesmo.'
} );

/**
 * Verifies if the user is an autoconfirmed
 * @param {string} target
 * @return {boolean}
 */
async function vbr_isAutoconfirmed( target ) {
	let requestResponse, requestData;

	requestResponse = await fetch( mw.util.wikiScript( 'api' ) + '?' + new URLSearchParams( {
		action: 'query',
		list: 'allusers',
		format: 'json',
		auprop: 'implicitgroups',
		aulimit: '1',
		aufrom: target,
		auto: target
	} ) );

	requestData = await requestResponse.json();

	return $.isEmptyObject( requestData.query.allusers )
		? false
		: ( $.inArray( 'autoconfirmed', requestData.query.allusers[ 0 ].implicitgroups ) !== -1 );
}

/**
 * Erase prohibited options to rollbackers
 * @param {boolean=false} submitDisable
 * @return {undefined}
 */
function vbr_eraseProhibitedOptions( submitDisable = false ) {
	$( '.mw-block-expiry-field__preset-duration li' ).each( function() {
		if ( $( this ).text().search( /((segundo|minuto|hora)s?|1 dia)/ ) === -1 )
			$( this ).remove();
	} );

	$('div[name="wpReason"]').parent().find('.cdx-menu__group-wrapper').slice(1).remove();
	$('.mw-block-submit').prop( 'disabled', submitDisable );
	$('input[value="partial"]').closest('.cdx-radio').remove();
	$('input[value="custom-duration"]').closest('.cdx-radio').remove();
	$('input[value="datetime"]').closest('.cdx-radio').remove();
	$('input[name="wpReason-other"]').closest('.cdx-text-input').remove();
	$('.mw-block-reason-edit').closest('.cdx-field__help-text').remove();
	$('input[value="wpCreateAccount"]').closest('.cdx-field--is-fieldset').remove();
}

/**
 * Executes
 * @param {string} target
 * @return {undefined}
 */
async function vbr_run( target ) {
	if ( await vbr_isAutoconfirmed( target ) )  {
		vbr_eraseProhibitedOptions( true );
		mw.notify(
			mw.message( 'vbr-noPermission' + ( target === mw.config.get( 'wgUserName' ) ? 'Himself' : 'Autoconfirmed' ) ).plain(),
			{ type: 'error' }
		);

		return;
	}

	vbr_eraseProhibitedOptions();
}

// Attaches in the block form
mw.hook( 'SpecialBlock.form' ).add( ( open, target ) => {
	if ( !( open && target ) )
		return;

	vbr_run( target );
} );

}() );
