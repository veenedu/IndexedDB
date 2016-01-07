var app = angular.module('app', ['veen.db']);

app.controller('MainController', function (indexedDB) {
	
	var ctrl = this;
	ctrl.status = "Controller Loaded";	
	
	var results = [];
	ctrl.results = results;
	
	function addResults(description,expected,received){
		results.push({
			description:description,
			result:expected === received,
			expected:expected,
			received:received
		});
	}
	
	addResults("Pass Test",true,true);
	addResults("Fail Test",true,false);
	
	
	//
	var db = indexedDB.init("db_name",2,[
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
	
	
	//insertDoc	
	db.insertDoc("persons",{
		id:1,
		name: "Praveen",
		age:31
	}).then(function(){
		db.getAllDocs("persons").then(function(res){
			addResults("Insert one doc",1,res.length);
			
			//
			db.clearTable("persons");
			
			
			//
			db.insertDocs("persons", [
					{id: 1,name: "Praveen",age: 31},
					{id: 2,name: "Praveen",age: 31}
				]).then(function () {
				db.getAllDocs("persons").then(function (res) {
					addResults("Insert multiple docs", 2, res.length);
							
					//
					db.clearTable("persons");
				});
			})													
			
			
		});
	})

});