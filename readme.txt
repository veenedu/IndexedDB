see readme.txt of utils package to learn about 
file structure,
bower,
gulp,
tsc compile and js minification
-----------------------
-----------------------

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