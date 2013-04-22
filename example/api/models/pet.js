/**
 Return sample json that represents this object
*/
module.exports.stub = function(params, options) {
  return {
    id: 1,
    category: {"id": 1, "name": "dog"},
    name: "kiss",
    photoUrls: null,
    tags: [{"id": 1,  "name": "dog"}],
    status: "sold"
  };
};


// Swagger Model Spec. 
// See:  https://github.com/wordnik/swagger-core/wiki/Datatypes
module.exports.spec = {
  id:"Pet",
  properties:{
    tags:{
      items:{
        "$ref":"Tag"
      },
      type:"Array"
    },
    id:{
      type:"long"
    },
    category:{
      type:"Category"
    },
    status:{
      allowableValues:{
        valueType:"LIST",
        values:[
          "available",
          "pending",
          "sold"
        ]
      },
      description:"pet status in the store",
      type:"string"
    },
    name:{
      "type":"string"
    },
    photoUrls:{
      items:{
        type:"string"
      },
      type:"Array"
    }
  }
};