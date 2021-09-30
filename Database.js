import pg from 'pg';
const { Pool } = pg;

global.dbPool = null;
global.dbClient = null;

export default class Database {
	static async init(callback) {
		if(!!dbPool) { return; }

		dbPool = new Pool(databaseAuth);

		try {
			dbClient = await dbPool.connect();
		} catch(err) {
			log('[DB]' + err,'error');
			return;
		}

		log('Successfuly connected to server database.');
	}

	static async stop(callback) {
		if(!dbPool) { return; }

		dbPool.end();
		dbPool = null;
	}

	static buildUpdateQuery(table, fields) {
		let query = 'UPDATE "' + table + '" SET';
		const values = [];

		for(const key in fields) {
			values.push(fields[key]);
			query += ' "' + key + '" = $' + values.length + ',';
		}

		query = query.substr(0, query.length-1);

		return [query, values];
	}

	static buildInsertQuery(table, fields) {
		let query = 'INSERT INTO "' + table + '"(';
		let columns = '';
		let valueStr = '';
		const values = [];


		for(const key in fields) {
			values.push(fields[key]);

			columns += '"' + key + '",';
			valueStr += '$' + values.length + ',';
		}

		columns = columns.substr(0, columns.length - 1);
		valueStr = valueStr.substr(0, valueStr.length - 1);

		query += columns + ') VALUES (' + valueStr + ')';

		return [query, values];
	}

	static async execQuery(query, params) {
		try {
			return await dbClient.query(query, params);
		} catch(err) {
			if(!!err.constraint && err.constraint.includes('_pkey')) {
				return;
			}

			log('[DB] ' + err, 'error');
			console.log(params);
		}
	}
};