module.exports.apis = [
  {
    "path":"/pets/{petId}",
    "description":"Operations about pets",
    "operations":[
      {
        "httpMethod":"GET",
        "summary":"Find pet by ID",
        "notes":"Returns a pet based on ID",
        "responseClass":"Pet",
        "nickname":"getPetById",
        "parameters":[
          {
            "name":"petId",
            "description":"ID of pet that needs to be fetched",
            "paramType":"path",
            "required":true,
            "allowMultiple":false,
            "dataType":"string"
          }
        ],
        "errorResponses":[
          {
            "code":400,
            "reason":"Invalid ID supplied"
          },
          {
            "code":404,
            "reason":"Pet not found"
          }
        ]
      }
    ]
  },
  {
    "path":"/pets",
    "description":"Operations about pets",
    "operations":[
      {
        "httpMethod":"GET",
        "summary":"View list of pets",
        "responseClass":"void",
        "nickname":"pets",
        "responseClass":"List[Pet]",
        "parameters":[],
        "errorResponses":[]
      },
      {
        "httpMethod":"POST",
        "summary":"Add a new pet to the store",
        "responseClass":"void",
        "nickname":"addPet",
        "parameters":[
          {
            "description":"Pet object that needs to be added to the store",
            "paramType":"body",
            "required":true,
            "allowMultiple":false,
            "dataType":"Pet"
          }
        ],
        "errorResponses":[
          {
            "code":405,
            "reason":"Invalid input"
          }
        ]
      },
      {
        "httpMethod":"PUT",
        "summary":"Update an existing pet",
        "responseClass":"void",
        "nickname":"updatePet",
        "parameters":[
          {
            "description":"Pet object that needs to be updated in the store",
            "paramType":"body",
            "required":true,
            "allowMultiple":false,
            "dataType":"Pet"
          }
        ],
        "errorResponses":[
          {
            "code":400,
            "reason":"Invalid ID supplied"
          },
          {
            "code":404,
            "reason":"Pet not found"
          },
          {
            "code":405,
            "reason":"Validation exception"
          }
        ]
      }
    ]
  }
]