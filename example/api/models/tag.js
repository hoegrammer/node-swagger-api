/**
 Return sample json that represents this object
*/
module.exports.stub = function(params, options) {
  return {id: 1, name:"woofie"};
};


// Swagger Model Spec. 
// See:  https://github.com/wordnik/swagger-core/wiki/Datatypes
module.exports.spec = {
  id:"Tag",
  properties:{
    id:{
      type:"long"
    },
    name:{
      type:"string"
    }
  }
};