
var _ = require('underscore');
var program = require('commander');
var inquirer = require("inquirer");
var Discogs = require('disconnect').Client;

var dis = new Discogs(
	'surprisetalkDiscs/0.0.1',
	{
		consumerKey: 'ejQdqNotIuBxVKJLHtKq',
		consumerSecret: 'nKOvAhcftZEblLnTdKNeHQQyoMsKGHNv'
	}
);

program
	.version('0.0.1')
	.arguments('<cmd> [env]')
	.action(function (cmd, env) {
		cmdValue = cmd;
		envValue = env;
	});

program.parse( process.argv );

if( typeof cmdValue === 'undefined' )
{
	console.error('no command given!');
	process.exit(1);

} else {

	dis.database().search( cmdValue, function( err, data ) 
	{
		var results = data.results;
		inquirer.prompt(
		[{
			type: "list",
			name: "title",
			message: "Choose an artist.",
			choices: _( results ).pluck('title')
		}], 
		function( answer )
		{
			var artistId =  _( results ).where( answer )[0]['id'];
			//http://www.discogs.com/artist/1373-Björk?sort=year%2Casc&limit=250&filter_anv=0&subtype=Albums&type=Releases
			dis.database().artistReleases( artistId, { per_page: 100 }, function( err, data )
			{
				_( data.releases ).chain()
				.where( { type: 'master' } )
				.sortBy( function( release ) { return release.year } )
				.each( function( release )
				{
					console.log( release.year + '\t' + release.title );
				});
				
			});
		});
	});
}

