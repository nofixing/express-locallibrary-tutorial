var https = require('https');

var OxfordDictionary = function(obj) {
    this.config = {
        app_id : obj.app_id,
        app_key : obj.app_key,
        source_lang: obj.source_lang || 'en'
    };
};

OxfordDictionary.prototype.find = function(props) {
    var path = validate('/api/v2/entries/', props, this);
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .find

OxfordDictionary.prototype.lemmas = function(props) {
    var path = validate('/api/v2/lemmas/', props, this);
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .lemmas

OxfordDictionary.prototype.thesaurus = function(props) {
    var path = validate('/api/v2/thesaurus/', props, this);
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .thesaurus

OxfordDictionary.prototype.sentences = function(props) {
    var path = validate('/api/v2/sentences/', props, this);
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .sentences


// Validation function
var validate = function(path, props, $this, dtype) {
        
        if ( !($this.config.app_id) || !($this.config.app_key) ) {
            throw Error('API_ID or API_KEY is undefined or NULL.');
        }        

        if (typeof props != 'object' && typeof props != 'string') {
            throw Error('Argument is not of proper type');
        }

        if (typeof props != 'undefined' && typeof props === 'object') {

            if ( props.hasOwnProperty('word') && (typeof props.word === 'string') ) {
                path += $this.config.source_lang + '/' + props.word.toLowerCase();
            } else {
                throw Error('Word argument not found');
            }

            if (props.hasOwnProperty('fields') && (typeof props.fields === 'string') ) {
                if (path.indexOf('?') > -1) {
                    path += '&' + props.fields.toString();
                } else {
                    path += '?' + props.fields.toString();
                }
            }

            if (props.hasOwnProperty('filters') && (typeof props.filters === 'string') ) {
                if (path.indexOf('?') > -1) {
                    path += '&' + props.filters.toString();
                } else {
                    path += '?' + props.filters.toString();
                }
            }
        }
        
        if (typeof props === 'string' && props.length > 0) {
            path += $this.config.source_lang + '/' + props.toLowerCase();
        }

        return path;
}; // end validateProp

// HTTPS Request Promise Builder
var buildRequest = function(options) {
    return new Promise(function(resolve, reject) {
        https.get(options, function(res) {
            if (res.statusCode == 404) {
                return reject("No such entry found."); 
            }
            var data = "";
            
            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function() {
                var result;
                try {
                    //result = JSON.parse(data);
                    result = data;
                } catch (exp) {
                    result = {
                        'status_code': 500,
                        'status_text': 'JSON Parse Failed'
                    };
                    reject(result);
                }
                resolve(result);                    
            });

            res.on('error', function (err) {
                reject(err);
            });                
        }); // end https.get
    }); // end promise
}; // end buildRequest


// Constructor Function for Option Objects
function OptionObj(path, app_id, app_key) {
    var options = {
        host :  'od-api.oxforddictionaries.com',
        port : 443,
        path : path,
        method : 'GET',
        headers : {
            "Accept": "application/json",
            "app_id": app_id,
            "app_key": app_key
            }
        };
    return options;
} // end OptionObj

module.exports = OxfordDictionary;
