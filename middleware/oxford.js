var https = require('https');

var OxfordDictionary = function(app_id,app_key) {
  console.log('new OxfordDictionary');
        this.config = {
            app_id : app_id,
            app_key : app_key
        };
};    
 
  
    OxfordDictionary.prototype.find = function(word,cb){
      console.log('OxfordDictionary find start');  
      var options = {
            host :  'od-api.oxforddictionaries.com',
            port : 443,
            path : '/api/v2/entries/en-gb/'+word,
            method : 'GET',
            headers : {
                    "Accept": "application/json",
                    "app_id": this.config.app_id,
                    "app_key": this.config.app_key
                   }
            };
        /*
        const req = https.request(options, res => {
          console.log(`statusCode: ${res.statusCode}`);
        
          res.on('data', d => {
            cb(null,JSON.parse(d));
          });
        });
        
        req.on('error', error => {
          console.error(error);
          cb(error);
        });
        
        req.end();
        */
        
        https.get(options, function(res) {
        console.log("\nstatus code: ", res.statusCode);
        if(res.statusCode == 404){
            cb("No such entry found");
        }else{
        var data = "";
        res.on('data', function(chunk) {
             data +=  chunk;
        })
        .on('end',function(){
            try {
              console.log('result data:'+data);
            //result = JSON.parse(data);
            result = data;
          } catch (exp) {
            result = {'status_code': 500, 'status_text': 'JSON Parse Failed'};
          }
            cb(null,result);
        })
        .on('error',function(err){
             cb(err);    
        });}
        });
        
    }; 

module.exports = OxfordDictionary;