/**
 * Validate block rollbackers
 * @desc Prevents that rollbackers in ptwikipedia blocks autoconfirmed users and of exceed the block limit (1 day).
 * @author [[w:pt:User:!Silent]]
 * @date 15/apr/2012
 */
/* global mw, $ */

( function () {
'use strict';

if ( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Block' && $.inArray( 'rollbacker', mw.config.get( 'wgUserGroups' ) ) !== -1 ) {
	mw.loader.load( 'ext.gadget.validateBlockRollbackersCore' );
}

}() );
