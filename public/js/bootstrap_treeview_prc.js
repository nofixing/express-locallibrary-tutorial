$(function() {

  var simpleData = [];
  /*
  var element = {text:'Parent 1'};
  simpleData.push(element);
  simpleData.push({text:'Parent 2'});
  simpleData.push({text:'Parent 3'});
  simpleData.push({text:'Parent 4'});
  simpleData.push({text:'Parent 5'});
  simpleData[0].nodes = [];
  simpleData[0].nodes.push({text:'Child 1'});
  simpleData[0].nodes.push({text:'Child 2'});
  simpleData[0].nodes[0].nodes = [];
  simpleData[0].nodes[0].nodes.push({text:'Grandchild 1'});
  simpleData[0].nodes[0].nodes.push({text:'Grandchild 2'});
  */
  
  var voca = JSON.parse($('#dic_content').val());
  
  var word_id = voca.id;
  var results = voca.results;
  for (let i = 0; i < results.length; i++) {
    var word = results[i].word;
    simpleData.push({text:word});
    console.log('word: '+word);
    var id = results[i].id;
    //console.log('results['+i+'].id: '+results[i].id);
    var language = results[i].language;
    var lexicalEntries = results[i].lexicalEntries;
      for (let j = 0; j < lexicalEntries.length; j++) {
        if (j == 0) simpleData[i].nodes = [];
      var lexicalEntries_language = lexicalEntries[j].language;
      var lexicalCategory = lexicalEntries[j].lexicalCategory;
      if (typeof lexicalCategory === 'object') {
        var lexicalCategory_id = lexicalCategory.id;
        var lexicalCategory_text = lexicalCategory.text;
        console.log('lexicalCategory.text:'+lexicalCategory.text);
        simpleData[i].nodes.push({text:lexicalCategory.text});
      }
      var pronunciations = lexicalEntries[j].pronunciations;
      if (typeof pronunciations === 'object') {
        for (let k = 0; k < pronunciations.length; k++) {
          var audioFile = pronunciations[k].audioFile;
          if (typeof audioFile !== 'undefined') {
            console.log('audioFile: '+audioFile);
            simpleData[i].nodes[j].text = simpleData[i].nodes[j].text + '&nbsp;<a onclick="playAudio(this);" style="cursor: pointer;" class="fa fa-play" src="'+audioFile+'"></a>';
          }
          var dialects = pronunciations[k].dialects;
          //console.log('dialects: '+dialects);
          var phoneticNotation = pronunciations[k].phoneticNotation;
          var phoneticSpelling = pronunciations[k].phoneticSpelling;
        }
      }
      var text = lexicalEntries[j].text;
      var derivatives = lexicalEntries[j].derivatives;
      if (typeof derivatives === 'object') {
        for (let k = 0; k < derivatives.length; k++) {
          //console.log('derivatives['+k+'].text: '+derivatives[k].text);
        }
      }
      var entries = lexicalEntries[j].entries;
      for (let k = 0; k < entries.length; k++) {
        var grammaticalFeatures = entries[k].grammaticalFeatures;
        if (typeof grammaticalFeatures === 'object') {
          var grammaticalFeatures_id = grammaticalFeatures[0].id;
          var grammaticalFeatures_text = grammaticalFeatures[0].text;
          //console.log('grammaticalFeatures[0].text: '+grammaticalFeatures[0].text);
          var grammaticalFeatures_type = grammaticalFeatures[0].type;
          //console.log('grammaticalFeatures[0].type: '+grammaticalFeatures[0].type);
        }
        var etymologies = entries[k].etymologies;
        if (typeof etymologies === 'object') {
          //console.log('etymologies: '+etymologies);
          console.log('simpleData['+i+']: '+JSON.stringify(simpleData[i]));
          
          if (typeof simpleData[i].nodes[j].nodes !== 'object') {
            simpleData[i].nodes[j].nodes = [];
            simpleData[i].nodes[j].nodes.push({text:'etymologies: '+etymologies});
          } else {
            simpleData[i].nodes[j].nodes.push({text:'etymologies: '+etymologies});
          }
          
        }
        var homographNumber = entries[k].homographNumber;
        var entries_pronunciations = entries[k].pronunciations;
        if (typeof entries_pronunciations === 'object') {
          for (let l = 0; l < entries_pronunciations.length; l++) {
            var entries_audioFile = entries_pronunciations[l].audioFile;
            if (typeof entries_audioFile !== 'undefined') {
              console.log('entries_audioFile: '+entries_audioFile);
              if (typeof simpleData[i].nodes[j].nodes !== 'object') {
                simpleData[i].nodes[j].nodes = [];
                simpleData[i].nodes[j].nodes.push({text:'&nbsp;<a onclick="playAudio(this);" style="cursor: pointer;" class="fa fa-play" src="'+entries_audioFile+'"></a>'});
              } else {
                var isExists = false;
                var isIdx = 0;
                for (let v = 0; v < simpleData[i].nodes[j].nodes.length; v++) {
                  if (simpleData[i].nodes[j].nodes[v].text.indexOf("mp3") > -1) {
                    isExists = true;
                    isIdx = v;
                  }
                }
                if (isExists) {
                  simpleData[i].nodes[j].nodes[isIdx].text = simpleData[i].nodes[j].nodes[isIdx].text + '&nbsp;<a onclick="playAudio(this);" style="cursor: pointer;" class="fa fa-play" src="'+entries_audioFile+'"></a>';
                } else {
                  simpleData[i].nodes[j].nodes.push({text:'&nbsp;<a onclick="playAudio(this);" style="cursor: pointer;" class="fa fa-play" src="'+entries_audioFile+'"></a>'});
                }
              }
            }
            var entries_dialects = entries_pronunciations[l].dialects;
            //console.log('entries_dialects: '+entries_dialects);
            var entries_phoneticNotation = entries_pronunciations[l].phoneticNotation;
            var entries_phoneticSpelling = entries_pronunciations[l].phoneticSpelling;
          }
        }
        var senses = entries[k].senses;
        for (let l = 0; l < senses.length; l++) {
          
          var ssIdx = 0;
          
          if (typeof simpleData[i].nodes[j].nodes !== 'object') simpleData[i].nodes[j].nodes = [];
          var definitions = senses[l].definitions;
          if (typeof definitions !== 'undefined') {
            console.log('definitions: '+definitions);
            simpleData[i].nodes[j].nodes.push({text:definitions});
            ssIdx = simpleData[i].nodes[j].nodes.length - 1;
          }
          var crossReferenceMarkers = senses[l].crossReferenceMarkers;
          if (typeof crossReferenceMarkers !== 'undefined') {
            console.log('crossReferenceMarkers: '+crossReferenceMarkers);
            simpleData[i].nodes[j].nodes.push({text:crossReferenceMarkers});
          }
          var domains = senses[l].domains;
          if (typeof domains === 'object') {
            domains[0].id;
            domains[0].text;
          }
          var examples = senses[l].examples;
          if (typeof examples === 'object') {
            for (let m = 0; m < examples.length; m++) {
              var examples_registers = examples[m].registers;
              if (typeof examples_registers !== 'undefined') {
                //console.log('examples_registers[0].text: '+examples_registers[0].text);
              }
              var examples_text = examples[m].text;
              console.log('examples_text: '+examples_text);
              simpleData[i].nodes[j].nodes.push({text:'<i>'+examples[m].text+'</i>'});
              ssIdx = simpleData[i].nodes[j].nodes.length - 1;
            }
          }
          var senses_id = senses[l].id;
          var registers = senses[l].registers;
          var regions = senses[l].regions;
          var notes = senses[l].notes;
          if (typeof notes === 'object') {
            var notes_text = notes[0].text;
            var notes_type = notes[0].type;
          }
          var shortDefinitions = senses[l].shortDefinitions;
          if (typeof shortDefinitions !== 'undefined') {
            //console.log('shortDefinitions: '+shortDefinitions);
          }
          var subsenses = senses[l].subsenses;
          if (typeof subsenses === 'object') {
            if (typeof simpleData[i].nodes[j].nodes[ssIdx].nodes !== 'object') simpleData[i].nodes[j].nodes[ssIdx].nodes = [];
            for (let m = 0; m < subsenses.length; m++) {
              var subsenses_definitions = subsenses[m].definitions;
              if (typeof definitions !== 'undefined') {
                console.log('subsenses_definitions: '+subsenses_definitions);
                simpleData[i].nodes[j].nodes[ssIdx].nodes.push({text:subsenses_definitions});
              }
              var subsenses_domains = subsenses[m].domains;
              var subsenses_examples = subsenses[m].examples;
              if (typeof subsenses_examples === 'object') {
                for (let n = 0; n < subsenses_examples.length; n++) {
                  var subsenses_examples_registers = subsenses_examples[n].registers;
                  if (typeof subsenses_examples_registers !== 'undefined') {
                    //console.log('subsenses_examples_registers[0].text: '+subsenses_examples_registers[0].text);
                  }
                  var subsenses_examples_text = subsenses_examples[n].text;
                  console.log('subsenses_examples_text: '+subsenses_examples_text);
                  simpleData[i].nodes[j].nodes[ssIdx].nodes.push({text:'<i>'+subsenses_examples[n].text+'</i>'});
                }
              }
              var subsenses_id = subsenses[m].id;
              var subsenses_registers = subsenses[m].registers;
              var subsenses_regions = subsenses[m].regions;
              if (typeof subsenses_regions === 'object') {
                var subsenses_regions_id = subsenses_regions[0].id;
                var subsenses_regions_text = subsenses_regions[0].text;
                //console.log('subsenses_regions[0].text:'+subsenses_regions[0].text);
              }
              var subsenses_notes = subsenses[m].notes;
              if (typeof subsenses_notes === 'object') {
                var subsenses_notes_text = subsenses_notes[0].text;
                var subsenses_notes_type = subsenses_notes[0].type;
                //console.log('subsenses_notes[0].text:'+subsenses_notes[0].text);
              }
              var subsenses_shortDefinitions = subsenses[m].shortDefinitions;
              if (typeof subsenses_shortDefinitions !== 'undefined') {
                //console.log('subsenses_shortDefinitions: '+subsenses_shortDefinitions);
              }
              var subsenses_thesaurusLinks = subsenses[m].thesaurusLinks;
            }
          }
          var thesaurusLinks = senses[l].thesaurusLinks;
          if (typeof thesaurusLinks === 'object') {
            var thesaurusLinks_entry_id = thesaurusLinks[0].entry_id;
            //console.log('thesaurusLinks[0].entry_id: '+thesaurusLinks[0].entry_id);
            var thesaurusLinks_sense_id = thesaurusLinks[0].sense_id;
          }
        }
      }
    }
    var type = results[i].type;
  }
  console.log(JSON.stringify(simpleData));
  
  $('#treeview1').treeview({
    levels: 99,
    data: simpleData
  });
  
  });