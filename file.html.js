// var myTimeOut = function(){
//     var promise = new Promise(function(resolve, reject) {
//         setTimeout(function(){
//             var pass= true;
//
//             if (pass) {
//                 resolve("Stuff worked!");
//             }
//             else {
//                 reject(Error("It broke"));
//             }
//         },1000);
//     });
//     // do a thing, possibly async, then…
//     return promise;
// }
//
// myTimeOut()
// .then(function(res){
//     console.log(res);
// })
// .then(function(res){
//   console.log(res)
// })




var db = veen.indexedDB.init("db_name",2,[
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

// console.log(db);
//
// // db.insertDoc("persons",{
// //   id:Date.now(),
// //   name: "Praveen",
// //   age:32
// // }).then(function(){
// //   db.getAllDocs("persons").then(function(res){
// //     console.log(res);
// //     // db.clearTable("persons");
// //   })
// // });
//



db.getDocsEquals("persons",'id',1455047992762).then(function(res){
  console.log(res);
})

db.getAllDocs("persons").then(function(res){
  console.log(res);
  // db.clearTable("persons");
})





//
// var $q;
// var promise = new Promise(function(resolve, reject) {
//
//   function res(r){
//     resolve(r);
//   }
//
//   function rej(r){
//     resolve(r);
//   }
//
//   $q = {
//     defer:function(){
//       return {
//         promise: promise,
//         resolve:res,
//         reject:rej
//       }
//     }
//   };
// });
//
//
// var defer = $q.defer();
//
// window.setTimeout(function(){
//   defer.resolve(function(){
//     console.log("hello");
//   })
// },500);
//
// defer.promise.then()
