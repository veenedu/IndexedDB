/**
 * DOCS
 *
 * Create database
 * indexedDB.init('db_name',version,schema);
 * schema: an array of oject with three properties:::
 *  name:->String,
    keyPath:->String,  (its like key, usually 'id', getById(), works only with this property
*	indexes:->Array of indexes
*
* Add/Remove Index: if you want to add/remove index, you just change them in array
* you have to update the version value too
* system will automaticall remove or add indexes based on array

Index---> you need index to run query on a proprty
eg: if you want to run query like select * from persons where age>23
you need to have an index on 'age' property

*
 * var db = indexedDB.init("db_name",1,[
        {
            name:'persons',
            keyPath:'id',
            indexes:['id','name','age','gender','city']
        },
        {
            name:'feed',
            keyPath:'id',
            indexes:['feedId','shares']
        }
    ]);
    
    
    //format
    db.runQuery().then(function(res){
        //something
    })
    
    //get all docs where age=30
    db.getDocsEquals('table_name','age',30).then
    
    //get all docs  where age less than 30
    db.getDocsLessThan('table_name','age',30).then
    
    //get all docs where age between 18 and 60
    db.getAllDocsRange('table','age',18,60)
    
    //update all docs where
    age less than 30
    db.updateDocsLessThan('table_name','age',30,function(person){
        person.type = "foo"
        //you dont have to return the object
    })
    
    
    'clearTable'
    'deleteDb'
    'insertDoc' --  (upsert) inserts a doc
    'insertDocs' -- (upsert) inserts an array of objects
    
    'getById' -- get object, where id= keyPath
    'getAllDocs' -- get all docs of a table
    'getDocsEquals'
    'getDocsLessThan'
    'getDocsGreaterThan'
    'getDocsRange'
    
    'updateAllDocs'
    'updateDocsEquals'
    'updateDocsLessThan'
    'updateDocsGreaterThan'
    'updateDocsRange'
    
    'deleteDoc'  -- deletes a doc, you pass object or key
    'deleteDocs' -- delets array of obejcts, you pass objects or ids array
    'deleteAllDocs'
    'deleteDocsEquals'
    'deleteDocsLessThan'
    'deleteDocsGreaterThan'
    'deleteDocsRange'
    
    
    'put' vs 'add'
    while inserting doc/docs we can choose two methods 'put' or 'add'
    add --> if doc already exists its ignored
    put --> if doc already exists its updated
 */
(function () {
    var CURSOR_TYPE = {
        NEXT: 'next',
        NEXT_UNIQUE: 'nextunique',
        PREV: 'prev',
        PREV_UNIQUE: 'prevunique'
    };
    var TRANSACTION_TYPE = {
        READONLY: "readonly",
        READWRITE: "readwrite"
    };
    function emptyFn(val) {
        return val;
    }
    var dbMethods = {
        exposed: [
            'clearTable', 'deleteDb',
            'insertDoc', 'insertDocs',
            'getById', 'getAllDocs', 'getDocsEquals', 'getDocsLessThan', 'getDocsGreaterThan', 'getDocsRange',
            'updateAllDocs', 'updateDocsEquals', 'updateDocsLessThan', 'updateDocsGreaterThan', 'updateDocsRange',
            'deleteDoc', 'deleteDocs', 'deleteAllDocs', 'deleteDocsEquals', 'deleteDocsLessThan', 'deleteDocsGreaterThan', 'deleteDocsRange'
        ],
        //this method adds common methods to txn
        addCommonMethods: function (txn, callback) {
            txn.onerror = function (result) {
                callback(result, true);
            };
            txn.oncomplete = function (result) {
                callback(result);
            };
            txn.onsuccess = function (result) {
                callback(result);
            };
            txn.onabort = function (result) {
                callback(result, true);
            };
        },
        //query store(table) its raw query 
        query: function (db, callback, tableName, txnType, cursorType, index, range, onEachCursor, onComplete) {
            //OnComplete: if undefined then whatever value received from tansaction wil be paaded
            //if you define this function than whatever value you will return will be passed as result
            //onEachCursor:: we will call this method on each cursor(guarantee that cursor cant be null or empty), 
            ///you delete update or collect cursor or its value 
            var txn = db.transaction(tableName, (txnType || TRANSACTION_TYPE.READONLY));
            var query = txn.objectStore(tableName);
            // //default values				
            range = (range === undefined) ? null : range;
            cursorType = cursorType || CURSOR_TYPE.NEXT;
            onComplete = onComplete || emptyFn;
            onEachCursor = onEachCursor || emptyFn;
            // //bind methods
            dbMethods.addCommonMethods(txn, callback);
            txn.oncomplete = function (result) {
                callback(onComplete(result));
            };
            if (index) {
                query = query.index(index);
            }
            //run query				
            query = query.openCursor(range, cursorType);
            query.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    onEachCursor(cursor);
                    cursor.continue();
                }
            };
        },
        //its same as query but you can pass clause rather than range
        queryWithClause: function (db, callback, tableName, transactionType, cursorType, property, clause, onEachCursor, onComplete) {
            //property --> is 'index' on which clause is applied
            //clause = {operator,values,inclusive}
            //clause.operator -> ('<' -> less than, '>' -> greater than, '=' -> equals, '<>' -> Range
            //clause.values = [value], [val1, val2] -> for range
            //clause.inclusive -> [true,false] ->include the lase value its like >= thing
            var idbRange = state.window.IDBKeyRange;
            var range;
            var rangeMethods = {
                "<": "upperBound",
                ">": "lowerBound",
                "=": "only",
                "<>": "bound"
            };
            if (clause) {
                var values = clause.values;
                var inc = clause.inclusive || [true, true];
                var method = rangeMethods[clause.operator];
                if (clause.operator == "<>") {
                    range = idbRange[method](values[0], values[1], !inc[0], !inc[1]);
                }
                else {
                    range = idbRange[method](values[0], !inc[0]);
                }
            }
            dbMethods.query(db, callback, tableName, transactionType, cursorType, property, range, onEachCursor, onComplete);
        },
        //its base structure for read query
        getDocsBase: function (db, callback, tableName, property, clause) {
            var transactionType = TRANSACTION_TYPE.READONLY;
            var cursorType = CURSOR_TYPE.NEXT;
            var items = [];
            function onEachCursor(cursor) {
                //Todo: You can add filter fn
                var filterItem = emptyFn(cursor.value);
                if (filterItem) {
                    items.push(cursor.value);
                }
            }
            function onComplete(res) {
                return items;
            }
            dbMethods.queryWithClause(db, callback, tableName, transactionType, cursorType, property, clause, onEachCursor, onComplete);
        },
        //get all items of a table
        getAllDocs: function (db, callback, tableName) {
            dbMethods.getDocsBase(db, callback, tableName);
        },
        //select * from table where prop=value
        getDocsEquals: function (db, callback, tableName, property, value) {
            dbMethods.getDocsBase(db, callback, tableName, property, {
                operator: "=",
                values: [value]
            });
        },
        getDocsLessThan: function (db, callback, tableName, property, value, includeEndPoint) {
            dbMethods.getDocsBase(db, callback, tableName, property, {
                operator: "<",
                values: [value],
                inclusive: [includeEndPoint]
            });
        },
        getDocsGreaterThan: function (db, callback, tableName, property, value, includeEndPoint) {
            dbMethods.getDocsBase(db, callback, tableName, property, {
                operator: ">",
                values: [value],
                inclusive: [includeEndPoint]
            });
        },
        getDocsRange: function (db, callback, tableName, property, start, end, includeEndPoint1, includeEndPoint2) {
            dbMethods.getDocsBase(db, callback, tableName, property, {
                operator: "<>",
                values: [start, end],
                inclusive: [includeEndPoint1, includeEndPoint2]
            });
        },
        //this methods returns a single row with id
        getById: function (db, callback, tableName, id) {
            var txn = db.transaction(tableName, TRANSACTION_TYPE.READWRITE);
            var table = txn.objectStore(tableName);
            var request = table.get(id);
            dbMethods.addCommonMethods(txn, callback);
            txn.oncomplete = function (res) {
                callback(request.result);
            };
        },
        updateDocsBase: function (db, callback, tableName, updateFn, property, clause) {
            //update fn should just update the value it want to update, no need to return value
            var transactionType = TRANSACTION_TYPE.READWRITE;
            var cursorType = CURSOR_TYPE.NEXT;
            var items = [];
            function onEachCursor(cursor) {
                updateFn(cursor.value);
                cursor.update(cursor.value);
                items.push(cursor.value);
            }
            function onComplete(res) {
                return items;
            }
            dbMethods.queryWithClause(db, callback, tableName, transactionType, cursorType, property, clause, onEachCursor, onComplete);
        },
        updateAllDocs: function (db, callback, tableName, updateFn) {
            dbMethods.updateDocsBase(db, callback, tableName, updateFn);
        },
        updateDocsEquals: function (db, callback, tableName, property, value, updateFn) {
            dbMethods.updateDocsBase(db, callback, tableName, updateFn, property, {
                operator: "=",
                values: [value]
            });
        },
        //
        updateDocsLessThan: function (db, callback, tableName, property, value, updateFn, includeEndPoint) {
            dbMethods.updateDocsBase(db, callback, tableName, updateFn, property, {
                operator: "<",
                values: [value],
                inclusive: [includeEndPoint]
            });
        },
        updateDocsGreaterThan: function (db, callback, tableName, property, value, updateFn, includeEndPoint) {
            dbMethods.updateDocsBase(db, callback, tableName, updateFn, property, {
                operator: ">",
                values: [value],
                inclusive: [includeEndPoint]
            });
        },
        updateDocsRange: function (db, callback, tableName, property, start, end, updateFn, includeEndPoint1, includeEndPoint2) {
            dbMethods.updateDocsBase(db, callback, tableName, updateFn, property, {
                operator: "<>",
                values: [start, end],
                inclusive: [includeEndPoint1, includeEndPoint2]
            });
        },
        insertDoc: function (db, callback, tableName, doc) {
            var txn = db.transaction(tableName, TRANSACTION_TYPE.READWRITE);
            var table = txn.objectStore(tableName);
            dbMethods.addCommonMethods(txn, callback);
            //Read 'put' vs 'add' in docs
            table.put(doc);
        },
        insertDocs: function (db, callback, tableName, docs) {
            var txn = db.transaction(tableName, TRANSACTION_TYPE.READWRITE);
            var table = txn.objectStore(tableName);
            dbMethods.addCommonMethods(txn, callback);
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];
                //Read 'put' vs 'add' in docs
                table.put(doc);
            }
        },
        deleteDocs: function (db, callback, tableName, docsOrIds, keyPath) {
            //docsOrIds --> array of ids or objects or mixed
            //if objects then keyPath will be 'id', if keyPath is undefined 
            var txn = db.transaction(tableName, TRANSACTION_TYPE.READWRITE);
            var table = txn.objectStore(tableName);
            dbMethods.addCommonMethods(txn, callback);
            function getId(item) {
                var isObj = typeof (item) == "object";
                if (isObj) {
                    var prop = keyPath || 'id';
                    return item[prop];
                }
                else {
                    return item;
                }
            }
            for (var i = 0; i < docsOrIds.length; i++) {
                var id = getId(docsOrIds[i]);
                table.delete(id);
            }
        },
        deleteDoc: function (db, callback, tableName, docOrId, keyPath) {
            //delete object or id
            dbMethods.deleteDocs(db, callback, tableName, [docOrId], keyPath);
        },
        deleteDocsBase: function (db, callback, tableName, property, clause) {
            //update fn should just update the value it want to update, no need to return value
            var transactionType = TRANSACTION_TYPE.READWRITE;
            var cursorType = CURSOR_TYPE.NEXT;
            var items = [];
            function onEachCursor(cursor) {
                items.push(cursor.value);
                cursor.delete();
            }
            function onComplete(res) {
                return items;
            }
            dbMethods.queryWithClause(db, callback, tableName, transactionType, cursorType, property, clause, onEachCursor, onComplete);
        },
        deleteAllDocs: function (db, callback, tableName, updateFn) {
            dbMethods.deleteDocsBase(db, callback, tableName, updateFn);
        },
        deleteDocsEquals: function (db, callback, tableName, property, value) {
            dbMethods.deleteDocsBase(db, callback, tableName, property, {
                operator: "=",
                values: [value]
            });
        },
        deleteDocsLessThan: function (db, callback, tableName, property, value, includeEndPoint) {
            dbMethods.deleteDocsBase(db, callback, tableName, property, {
                operator: "<",
                values: [value],
                inclusive: [includeEndPoint]
            });
        },
        deleteDocsGreaterThan: function (db, callback, tableName, property, value, includeEndPoint) {
            dbMethods.deleteDocsBase(db, callback, tableName, property, {
                operator: ">",
                values: [value],
                inclusive: [includeEndPoint]
            });
        },
        deleteDocsRange: function (db, callback, tableName, property, start, end, includeEndPoint1, includeEndPoint2) {
            dbMethods.deleteDocsBase(db, callback, tableName, property, {
                operator: "<>",
                values: [start, end],
                inclusive: [includeEndPoint1, includeEndPoint2]
            });
        },
        deleteDb: function (db, callback) {
            // Close and clear the handle to the database
            db.close();
            //delete database
            var dbRequest = state.window.indexedDB.deleteDatabase(db.name);
            dbRequest.onerror = function (res) {
                state.reset();
                callback(false, true);
            };
            dbRequest.onsuccess = function (res) {
                callback(true);
            };
        },
        clearTable: function (db, callback, tabelName) {
            var txn = db.transaction(tabelName, TRANSACTION_TYPE.READWRITE);
            var table = txn.objectStore(tabelName);
            dbMethods.addCommonMethods(txn, callback);
            table.clear();
        }
    };
    var state = {
        window: undefined,
        reset: function () {
            state.promise = undefined;
            state.window = undefined;
        },
        promise: undefined,
        promiseWrapper: function ($q, fn) {
            var defer = $q.defer();
            state.promise.then(function (db) {
                fn(db, function (data, fail) {
                    if (!fail) {
                        defer.resolve(data);
                    }
                    else {
                        defer.reject(data);
                    }
                });
            });
            return defer.promise;
        },
        createDatabase: function ($window, $q, dbName, version, schema) {
            state.window = $window;
            var defer = $q.defer();
            state.promise = defer.promise;
            if (!('indexedDB' in $window)) {
                $window.indexedDB = $window.mozIndexedDB || $window.webkitIndexedDB || $window.msIndexedDB;
            }
            if (!('IDBTransaction' in $window)) {
                $window.IDBTransaction = $window.IDBTransaction || $window.webkitIDBTransaction || $window.msIDBTransaction;
            }
            if (!('IDBKeyRange' in $window)) {
                $window.IDBKeyRange = $window.IDBKeyRange || $window.webkitIDBKeyRange || $window.msIDBKeyRange;
            }
            var dbRequest = $window.indexedDB.open(dbName, version);
            dbRequest.onsuccess = function (evt) {
                var db = evt.target.result;
                defer.resolve(db);
            };
            dbRequest.onblocked = function () { };
            dbRequest.onerror = function () { };
            dbRequest.onupgradeneeded = function (evt) {
                //create stores
                var db = evt.target.result;
                for (var i = 0; i < schema.length; i++) {
                    var t = schema[i];
                    //table reference
                    var table;
                    //table already exists refer it
                    if (db.objectStoreNames.contains(t.name)) {
                        table = evt.currentTarget.transaction.objectStore(t.name);
                    }
                    else {
                        table = db.createObjectStore(t.name, { keyPath: t.keyPath, unique: true });
                    }
                    //delete Indexes
                    //remove all those indexes that doesn't exist in current schema
                    for (var k = 0; k < table.indexNames.length; k++) {
                        var index = table.indexNames[k];
                        //new structure doesn't contain this index delete it
                        if (t.indexes.indexOf(index) < 0) {
                            table.deleteIndex(index, index, { unique: false });
                        }
                    }
                    //create indexes
                    for (var j = 0; j < t.indexes.length; j++) {
                        var index = t.indexes[j];
                        //if index doesn't exists, create it
                        if (!table.indexNames.contains(index)) {
                            table.createIndex(index, index, { unique: false });
                        }
                    }
                }
            };
        },
        wrapDbMethods: function ($q) {
            var db_methods = {};
            var methods = dbMethods.exposed;
            for (var i = 0; i < methods.length; i++) {
                (function () {
                    var methodName = methods[i];
                    db_methods[methodName] = function (a, b, c, d, e, f, g, h, i, j, k) {
                        return state.promiseWrapper($q, function (db, callback) {
                            var method = dbMethods[methodName];
                            method(db, callback, a, b, c, d, e, f, g, h, i, j, k);
                        });
                    };
                })();
            }
            return db_methods;
        },
        init: function ($window, $q, dbName, version, schema) {
            //create db
            state.createDatabase($window, $q, dbName, version, schema);
            //wrap DB Methods
            return state.wrapDbMethods($q);
        }
    };
    var app = angular.module('veen.db', []);
    app.factory('indexedDB', ['$window', '$q', function ($window, $q) {
            var service = {
                init: function (dbName, version, schema) {
                    /**
                     * dbName : name of database
                     * version: version of Db
                     * schema: an array of oject with three properties:::
                     * name:->String,
                     * keyPath:->String,  (its like key, usually 'id', getById(), works only with this property
                     * indexes:->Array of indexes
                     *
                     * Addings/Remove Index: if you want to add/remove index, you just chnage them in array
                     * you have to update the version value too
                     *  */
                    return state.init($window, $q, dbName, version, schema);
                }
            };
            return service;
        }]);
})();
// 	class Entity {
// 		id: string;
// 		table: string;
// 		private static counter: number = 0;
// 		constructor(table: string) {
// 			Entity.counter++; //increase counter to avoid same ids, 
// 			this.id = new Date().toISOString() + Entity.counter;
// 			this.table = table;
// 		}
// 	}
///Dalete Table
//db.deleteObjectStore(tabelName);
//Range
//https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange	
//Read this "Version changes while a web app is open in another tab"
//https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB	
//delete
//https://developer.mozilla.org/en-US/docs/Web/API/IDBCursor/delete
//"put" this method updates or insert check it 
