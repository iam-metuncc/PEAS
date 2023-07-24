
// ***** IMPORTANT *****
// The code below was ran for each individual page separately
// To run it for a page, you need to update teh "pageLink" variable below and provide the web page link
// You also need to provide the VIPS segmentation file which as a json file
// The code also contains console.log commands that were used for debugging. Those can be ignored
// At the end, labels will be added to each element. Those labels were provided to us by the EDDS algorithm


const puppeteer = require("puppeteer");
const fs = require('fs');
const lineReader = require('line-reader');
const path = require('path');
const { resolve } = require("path");
const { Console } = require("console");

//List of all objects, each of which represents a tag 
var tags = [];
var pageLink = "http://localhost/wordpress/index.html";
var page_Name = 'wordpress';
var cssFeatures = ['background-color', 'font-size', 'border', 'color', 'margin', 'padding'];
var counter = 0;
var fileIsRead = 0;
var csvFileName = page_Name + '.csv';


//Opening and reading the JSON file for the selected page
fs.readFile('NewData/Pages/' + page_Name + '.json', 'utf8', (err, jsonString) => {

    process.stdout.write("\n####################################");
    process.stdout.write("\nStarted Reading the VIPS Response File");
    process.stdout.write("\n####################################");

    if (err) {
        console.log("File read failed:", err)
        return
    }
    try {
        const parsedResponse = JSON.parse(jsonString);

        responseObject = parsedResponse.result;

        readResponse(responseObject);

    } catch (error) {
        console.log(error);
    }

    process.stdout.write("\n\n\n####################################");
    process.stdout.write("\nFinished Reading the VIPS Response File");
    process.stdout.write("\n####################################");

    fileIsRead = 1;

});

//Function that will take the root node from the VIPS response, and will recursively populate the
//tags array based on the contents of the VIPS response
function readResponse(element) {

    //Object that will represent a single tag
    var tag = {
        pageName: page_Name,
        name: element.name,
        xpath: element.xpath,
        tagName: element.tagName,
        role: element.role,
        classname: classAssigner(element.className),
        width: element.width,
        height: element.height,
        size: parseInt(element.height) * parseInt(element.width),
        topX: element.topX,
        topY: element.topY,
        fullArea: element.fullArea,
        whiteSpace: element.whiteSpace,
        whiteSpaceRatio: element.whiteSpaceRatio,
        specialCase: 0,
        innerHTML: '',
        titleKeywords: 0,
        textLength: 0,
        avgWordLength: 0,
        fullStopsRatio: 0,
        numberOfVerticalBars: 0,
        numberOfDateTokens: 0,
        numberOfImages: 0,
        numberOfTables: 0,
        wordFrequency: 0,
        numberOfLinks: 0,
        wordFrequencyInLinks: 0,
        wordFrequencyInLinksToAll: 0,
        averageSentenceLength: 0,
        ratioOfTermsToAll: 0,
        ratioOfUppercaseWordsToAll: 0,
        htmlCode: '',
        textSimilarity: 0,
        structureSimilarity: 1,
        structureSimilarity_Levenshtein: 0,
        background_color: 0,
        fontSize: 0,
        borderWidth: '0',
        borderStyle: 'none',
        borderColor: 0,
        color: 0,
        marginTop: '0',
        marginRight: '0',
        marginBottom: '0',
        marginLeft: '0',
        paddingTop: '0',
        paddingRight: '0',
        paddingBottom: '0',
        paddingLeft: '0',
        shape: '',
        label: 0
    };

    //Add the shape of the element
    addShape(tag);

    //Add the XPATH and handle the cases where VIPS generates a custom XPATH for some text elements
    //addXPATH(tag, element);

    //console.log("C are -------------- " + element.children);
    if (element.children)
        tag['children'] = element.children;
    //console.log("T are -------------- " + tag['children']);
    //Adding the tag to our array of tags
    tags.push(tag);
    //console.log("\nAdded: " + JSON.stringify(tag));
    //Recursively handle all of the current tag's children and add them to the array
    if (element.children.length > 0) {
        element.children.forEach(elem => {
            readResponse(elem);
        });
    }
}

//Function that finds the shape based on the width to height ratio
function addShape(tag) {
    var ratio = parseInt(tag['width']) / parseInt(tag['height']);

    if (ratio == 1)
        tag['shape'] = "Square";
    else
        tag['shape'] = "Rectangle";
}


//Function that adds the XPATH and handles the cases where VIPS generates a custom XPATH for some text elements
//THIS FUNCTION IS NO LONGER USED
function addXPATH(tag, element) {
    var slicePoint = (tag.xpath).lastIndexOf("#");
    if (slicePoint >= 0) {
        var parentXPATH = (tag.xpath).slice(0, slicePoint - 1);
        console.log("######### Replacing " + tag.xpath + " with " + parentXPATH + "\n");
        tag.xpath = parentXPATH;
        tag.specialCase = 1;
        tag.tagName = "P";
    }
}

////Reference https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function classAssigner(className) {
    var result = '';

    if (className == null || className == '') {
        var length = 8;
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
    }
    else {
        result = className;
    }

    return result;
}

//Number of headers in an element
function numberOfTitles(innerHTML) {
    var count = innerHTML.match(/<h/g) ? (innerHTML.match(/<h/g)).length : 0;

    return (count);
}

//Average word length in an element's text
function avgWordLength(text) {
    var words = text.split(" ");

    var count = words ? words.length : 0;

    return (count);
}

///Number of words in an element's text
function wordFrequency(text) {
    var words = text.split(" ");
    var frequency = 0;

    if (words)
        frequency = words.length;

    return (frequency);

}

//Ratio of full stops to number of words in an element's text
function fullStopsRatio(text) {
    var fullStops = text.match(/\./g);
    var words = text.split(" ");

    var ratio = 0;

    if (fullStops && words) {
        ratio = fullStops.length / words.length;
    }

    return (ratio);
}

//Number of vertical bars '|' in an element's text
function numberOfVerticalBars(text) {
    var verticalBars = text.match(/\|/g);
    var occurrences = 0;
    if (verticalBars) {
        occurrences = verticalBars.length;
    }

    return (occurrences);
}

//Number of date tokens in an element's text
//TODO: can be further expanded to include more formats
function numberOfDateTokens(text) {
    var tokens = text.match(/[0-9]+\/[0-9]+\/[0-9]+/g);
    var count = 0;

    if (tokens) {
        count = tokens.length;
    }

    return (count);
}

//Number of image tags in an element
function numberOfImages(innerHTML) {
    var count = innerHTML.match(/<img/g) ? (innerHTML.match(/<img/g)).length : 0;

    return (count);
}

//Number of table tags in an element
function numberOfTables(innerHTML) {
    var count = innerHTML.match(/<table/g) ? (innerHTML.match(/<table/g)).length : 0;

    return (count);
}

//Number of links in an element's text
function numberOfLinks(innerHTML) {
    var count = innerHTML.match(/<a/g) ? (innerHTML.match(/<a/g)).length : 0;

    return (count);
}

//Number of words in links
function wordFrequencyInLinks(innerHTML) {
    var links = innerHTML.match(/\<a.*?\>.*?\<\/a\>/gmi);
    var _wordFrequency = 0;

    if (links) {
        for (let index = 0; index < links.length; index++) {
            _wordFrequency = _wordFrequency + wordFrequency(links[index]);

        }
    }

    return (_wordFrequency);
}

//Ratio of words in links to all words in an element's text
function wordFrequencyInLinksToAll(innerHTML, text) {
    var frequencyInLinks = wordFrequencyInLinks(innerHTML);
    var frequencyOfWords = wordFrequency(text);

    var ratio = frequencyInLinks / frequencyOfWords;

    return (ratio);
}

//Average sentence length in an element's text
function averageSentenceLength(text) {
    var sentences = text.split(/([.,?,!])\s*/g);
    var totalLength = 0;

    if (sentences) {
        for (let index = 0; index < sentences.length; index++) {
            totalLength = totalLength + sentences[index].length;

        }
    }

    var avgSentenceLength = totalLength / sentences.length;

    return (avgSentenceLength);

}

//Ratio of an element's number of words to number of all words in the document
function ratioOfTermsToAll(text, extractedText) {
    var numOfTerms = wordFrequency(text);
    var allTerms = wordFrequency(extractedText);

    var ratio = numOfTerms / allTerms;

    return (ratio);
}

//Ratio of words that start with/or are uppercase to all words in an element's text
function ratioOfUppercaseWordsToAll(text) {
    var allUppercase = text.match(/(\b[A-Z][A-Z]+|\b[A-Z]\b|\b[A-Z][a-z]+)/g);
    var allWords = wordFrequency(text);

    var ratio = 0;

    if (allUppercase)
        ratio = allUppercase.length / allWords;

    return (ratio);
}


//Reference https://stackoverflow.com/questions/18516942/fastest-general-purpose-levenshtein-javascript-implementation
function levenshtein(s, t) {
    if (s === t) {
        return 0;
    }
    var n = s.length, m = t.length;
    if (n === 0 || m === 0) {
        return n + m;
    }
    var x = 0, y, a, b, c, d, g, h, k;
    var p = new Array(n);
    for (y = 0; y < n;) {
        p[y] = ++y;
    }

    for (; (x + 3) < m; x += 4) {
        var e1 = t.charCodeAt(x);
        var e2 = t.charCodeAt(x + 1);
        var e3 = t.charCodeAt(x + 2);
        var e4 = t.charCodeAt(x + 3);
        c = x;
        b = x + 1;
        d = x + 2;
        g = x + 3;
        h = x + 4;
        for (y = 0; y < n; y++) {
            k = s.charCodeAt(y);
            a = p[y];
            if (a < c || b < c) {
                c = (a > b ? b + 1 : a + 1);
            }
            else {
                if (e1 !== k) {
                    c++;
                }
            }

            if (c < b || d < b) {
                b = (c > d ? d + 1 : c + 1);
            }
            else {
                if (e2 !== k) {
                    b++;
                }
            }

            if (b < d || g < d) {
                d = (b > g ? g + 1 : b + 1);
            }
            else {
                if (e3 !== k) {
                    d++;
                }
            }

            if (d < g || h < g) {
                g = (d > h ? h + 1 : d + 1);
            }
            else {
                if (e4 !== k) {
                    g++;
                }
            }
            p[y] = h = g;
            g = d;
            d = b;
            b = c;
            c = a;
        }
    }
    for (; x < m;) {
        var e = t.charCodeAt(x);
        c = x;
        d = ++x;
        for (y = 0; y < n; y++) {
            a = p[y];
            if (a < c || d < c) {
                d = (a > d ? d + 1 : a + 1);
            }
            else {
                if (e !== s.charCodeAt(y)) {
                    d = c + 1;
                }
                else {
                    d = c;
                }
            }
            p[y] = d;
            c = a;
        }
        h = d;
    }
    return h;
}

//THIS FUNCTION IS NO LONGER USED
function textSimilarity(tag) {
    for (let tag of tags) {

        var textSimilarity = 0;
        var counter = 0;

        var lastIndex = (tag.name).lastIndexOf(".");

        var siblingFormat = (tag.name).slice(0, lastIndex);

        for (let siblingTag of tags) {

            var siblingLastIndex = (siblingTag.name).lastIndexOf(".");
            var parent = (siblingTag.name).slice(0, siblingLastIndex);

            if (siblingFormat == parent && tag.name != siblingTag.name) {
                if (tag.textContent && siblingTag.textContent) {
                    counter++;
                    textSimilarity = textSimilarity + levenshtein(tag.textContent, siblingTag.textContent);
                }
            }

        }
        return (textSimilarity / counter);
    }
}

//Function to get the HTML tags that appear in an element
function htmlCode(innerHTML) {
    var htmlTags = '0';

    if (innerHTML.length > 0) {

        htmlTags = innerHTML.replace(/\>[a-z]+[\s\S]*?\</gim);
    }

    return htmlTags;
}


function addFeatures(tag, text, innerHTML, extractedText) {

    if (tag.specialCase == 1) {
        innerHTML = innerHTML.replace(/\>[\s]*?[a-z]*?[1-9]*?[\s\S]*?\</gim, '');
        innerHTML = innerHTML.replace(/<.*?>/gim, '');
        console.log(innerHTML + "\n");

        if (innerHTML == null) {
            innerHTML = '0';
        }

        text = innerHTML;
    }

    tag['textContent'] = text;
    tag['innerHTML'] = innerHTML;
    tag['titleKeywords'] = numberOfTitles(innerHTML);
    tag['textLength'] = text.length;
    tag['avgWordLength'] = avgWordLength(text);
    tag['fullStopsRatio'] = fullStopsRatio(text);
    tag['numberOfVerticalBars'] = numberOfVerticalBars(text);
    tag['numberOfDateTokens'] = numberOfDateTokens(text);
    tag['numberOfImages'] = numberOfImages(innerHTML);
    tag['numberOfTables'] = numberOfTables(innerHTML);
    tag['wordFrequency'] = wordFrequency(text);
    tag['numberOfLinks'] = numberOfLinks(innerHTML);
    tag['wordFrequencyInLinks'] = wordFrequencyInLinks(innerHTML);
    tag['wordFrequencyInLinksToAll'] = wordFrequencyInLinksToAll(innerHTML, text);
    tag['averageSentenceLength'] = averageSentenceLength(text);
    tag['ratioOfTermsToAll'] = ratioOfTermsToAll(text, extractedText);
    tag['ratioOfUppercaseWordsToAll'] = ratioOfUppercaseWordsToAll(text);
    tag['htmlCode'] = htmlCode(innerHTML);

    // process.stdout.write("\nXpath: " + tag.xpath);
    // console.log("\tText: " + text);
    // console.log("\tInnerHTML: " + innerHTML);
    // console.log("\twordFrequency: " + tag.wordFrequency);
    // console.log("\tavgWordLength: " + tag.avgWordLength);
    // console.log("\tfullStopsRatio: " + tag.fullStopsRatio);
    // console.log("\tnumberOfVerticalBars: " + tag.numberOfVerticalBars);
    // console.log("\tnumberOfDateTokens: " + tag.numberOfDateTokens);
    // console.log("\tnumberOfImages: " + tag.numberOfImages);
    // console.log("\tnumberOfTables: " + tag.numberOfTables);
    // console.log("\tnumberOfLinks: " + tag.numberOfLinks);
    // console.log("\twordFrequencyInLinks: " + tag.wordFrequencyInLinks);
    // console.log("\twordFrequencyInLinksToAll: " + tag.wordFrequencyInLinksToAll);
    // console.log("\taverageSentenceLength: " + tag.averageSentenceLength);
    // console.log("\tratioOfTermsToAll: " + tag.ratioOfTermsToAll);
    // console.log("\tratioOfUppercaseWordsToAll: " + tag.ratioOfUppercaseWordsToAll);
    // console.log("\thtmlCode: " + tag.htmlCode);
}

//Function that normalizes the distance between two strings. Mostly used for structure, and text similarity
function normalizeDistance(tagString, siblingString, distance) {
    var length = 1;
    var score = 0;
    if (tagString == null || tagString == '' || siblingString == null || siblingString == '') {
        return 0;
    }
    if (tagString.length >= siblingString.length) {
        length = tagString.length;
    }
    else {
        length = siblingString.length;
    }

    score = 100 * (1 - (distance / length));

    return score;
}

//Function that calculates the text similarity score for an element based on the similarity between its children elements' text
function addTextSimilarity() {
    var maxValue = 987654321;

    for (let tag of tags) {
        var tempDistance = 0;
        var score = 0;
        var textSimilarity = 0;
        var counter = 0;
        var lastIndex = (tag.name).lastIndexOf(".");
        var siblingFormat = (tag.name).slice(0, lastIndex);

        for (let siblingTag of tags) {
            var length = 1;
            var distance = 0;
            var siblingLength = 0;
            var siblingLastIndex = (siblingTag.name).lastIndexOf(".");
            var parent = (siblingTag.name).slice(0, siblingLastIndex);

            if (siblingFormat == parent && tag.name != siblingTag.name) {
                if (tag.textContent && siblingTag.textContent) {
                    counter++;
                    
                    tempDistance = levenshtein(tag.textContent, siblingTag.textContent);
                    if (isNaN(tempDistance)) {
                        tempDistance = 0;
                    }
                    distance += tempDistance;
                    score += normalizeDistance(tag.textContent, siblingTag.textContent, distance);
                }
            }
        }
        if(counter == 0){
            tag['textSimilarity'] = 0;
        }
        else{
            tag['textSimilarity'] = score / counter;
        }
        
    }
}

//THIS FUNCTION IS NO LONGER USED
function addStructureRegularity() {
    for (let tag of tags) {
        var listOfRoles = [];

        if (tag.children.length > 0) {

            childrenTags = tag.children;

            for (let childTag of childrenTags) {
                listOfRoles.push(childTag.role);
            }

        }
        else
            listOfRoles.push("0");

        tag['listOfRoles'] = listOfRoles;
    }

    for (let tag of tags) {
        var structureRegularity = 0;
        var counter = 0;
        var lastIndex = (tag.name).lastIndexOf(".");
        var siblingFormat = (tag.name).slice(0, lastIndex);

        for (let siblingTag of tags) {

            var siblingLastIndex = (siblingTag.name).lastIndexOf(".");
            var parent = (siblingTag.name).slice(0, siblingLastIndex);

            if (siblingFormat == parent && tag.name != siblingTag.name) {
                let regularity = tag.listOfRoles.every((value, index) => value === siblingTag.listOfRoles[index]);
                if (regularity)
                    structureRegularity++;

                counter++;

            }
            else if (siblingFormat == parent) {
                structureRegularity++;
                counter++;
            }

        }

        structureRegularity = structureRegularity / counter;
        tag['structureRegularity'] = structureRegularity;

    }


}

//Adding the current element's tag name to the HTML code (which previously only included the children tags)
function correctHTMLCode() {
    for (let tag of tags) {
        if (tag.htmlCode != null) {
            tag.htmlCode = "<" + tag.tagName + " - " + tag.htmlCode + " - /" + tag.tagName + ">";
        }
    }
}

//THIS FUNCTION IS NO LONGER USED
function addStructureSimilarity_Levenshtein(tagsList) {
    var finalScore = 0;

    for (let tag of tagsList) {
        var tempDistance = 0;
        var score = 0;
        console.log("\nCheck: " + tag.htmlCode);
        var counter = 0;

        if(tag.htmlCode == null){
            tag.htmlCode = '0';
        }

        var tagStructure = (tag.htmlCode).match(/\<[a-z]+[1-9]+|\/[a-z]+[1-9]+\>|\<[a-z]+|\/[a-z]+\>/gmi);
        if (tagStructure == null) {
            tagStructure = '';
        }

        for (let siblingTag of tagsList) {
            var distance = 0;
            var tempScore = 0;
            if(siblingTag.htmlCode == null){
                siblingTag.htmlCode = '0';
            }

            var siblingTagStructure = (siblingTag.htmlCode).match(/\<[a-z]+[1-9]+|\/[a-z]+[1-9]+\>|\<[a-z]+|\/[a-z]+\>/gmi);
            if (siblingTagStructure == null) {
                siblingTagStructure = '';
            }

            if (tag.name != siblingTag.name) {
                if (tagStructure.toString() != null && siblingTagStructure.toString() != null) {

                    counter++;

                    tempDistance = levenshtein(tagStructure.toString(), siblingTagStructure.toString());
                    if (isNaN(tempDistance)) {
                        tempDistance = 0;
                    }
                    distance += tempDistance;

                    score += normalizeDistance(tagStructure.toString(), siblingTagStructure.toString(), distance);
                }
            }
            
        }
        if(tagsList.length == 1){
            finalScore = 100;
        }
        else{
            tempScore += score / (tagsList.length - 1);
        }
        //finalScore += score / (tagsList.length - 1);
    }

    finalScore = tempScore/tagsList.length;
    console.log("\nreturning " + finalScore);
    return finalScore;
}

//Function that calculates the structure similarity score for an element based on the similarity between its children elements' HTML code tag structure
function addStructureSimilarity() {


    for (let tag of tags) {

        var structureSimilarity = 0;
        var structureSimilarity_Levenshtein = 0;
        var tempScore = 0;
        var counter = 0;
        var furtherCheckRequired = 1;
        var tempLevenshtein = 0;


        if (tag.htmlCode != null) {

            //tag.htmlCode = "<" + tag.tagName + " - " + tag.htmlCode + " - /" + tag.tagName + ">";
            var tagStructure = (tag.htmlCode).match(/\<[a-z]+[1-9]+|\/[a-z]+[1-9]+\>|\<[a-z]+|\/[a-z]+\>/gmi);

            // console.log("\nName: " + tag.name);
            // console.log("\n\tCode: " + tag.htmlCode);
            // console.log("\n\tTag Structure: " + tagStructure);

            if (tag.children.length > 0) {
                //console.log("\n\tChildren: " + JSON.stringify(tag.children));
                childrenTags = tag.children;

                counter = tag.children.length;

                for (let child of childrenTags) {
                    var childSimilarity = 0;
                    var score = 0;
                    var distance = 0;

                    //console.log("\n\t\tChild Name: " + child.name);

                    var childTag = tags.find(function (_tag) {
                        if (_tag.name == child.name)
                            return _tag;
                    })

                    //console.log("\n\t\tChildTag Name: " + childTag.tagName);
                    //console.log("\n\t\tChildTag Code: " + childTag.htmlCode);

                    if (childTag.htmlCode == null) {
                        childTag.htmlCode = '0';
                        //console.log("\n\t\tChildTag Code Replaced With: " + childTag.htmlCode);
                    }

                    //Making sure that the tag name is also considered part of the innerHTML that will be used for the comparison between nodes
                    //childTag.htmlCode = "<" + childTag.tagName + " - " + childTag.htmlCode + " - /" + childTag.tagName + ">";
                    //console.log("\n\t\tNew ChildTag Code is: " + childTag.htmlCode);

                    for (let child_2 of childrenTags) {
                        if (child_2.name != childTag.name) {

                            var childTag_2 = tags.find(function (_tag) {
                                if (_tag.name == child_2.name)
                                    return _tag;
                            })

                            //childTag_2.htmlCode = "<" + childTag_2.tagName + " - " + childTag_2.htmlCode + " - /" + childTag_2.tagName + ">";

                            var childTagStructure = (childTag.htmlCode).match(/\<[a-z]+[1-9]+|\/[a-z]+[1-9]+\>|\<[a-z]+|\/[a-z]+\>/gmi);
                            if (childTagStructure == null) {
                                childTagStructure = '0';
                                //console.log("\n\t\t" + childTag.name + " Structure Replaced With: " + childTagStructure);
                            }

                            var childTagStructure_2 = (childTag_2.htmlCode).match(/\<[a-z]+[1-9]+|\/[a-z]+[1-9]+\>|\<[a-z]+|\/[a-z]+\>/gmi);
                            if (childTagStructure_2 == null) {
                                childTagStructure_2 = '0';
                                //console.log("\n\t\t" + childTag_2.name + " Structure Replaced With: " + childTagStructure_2);
                            }
                            //console.log("\n\t\t" + childTag_2.name + " to " + childTag.name);

                            //First measure is done by Levenshtein distance measure
                            distance = levenshtein(childTagStructure.toString(), childTagStructure_2.toString());
                            score += normalizeDistance(childTagStructure.toString(), childTagStructure_2.toString(), distance);

                            furtherCheckRequired = 1;
                            if (childTagStructure == '0' || childTagStructure_2 == '0') {
                                console.log("\n\t\t################### NULL CHILD TAG STRUCTURE DETECTED");
                                furtherCheckRequired = 0;
                            }

                            if (furtherCheckRequired == 1) {

                                //Second measure is done by checking if they are exactly the same (Strict similarity check)
                                let similarity = childTagStructure.length === childTagStructure_2.length && childTagStructure.every((value, index) => value === childTagStructure_2[index]);

                                if (similarity) {
                                    //console.log("\n\tSimilar Structure: " + childTagStructure + "-----" + childTagStructure_2);
                                    childSimilarity++;
                                }

                                
                            }

                        }
                    }
                    structureSimilarity += (childSimilarity / (counter - 1));
                    structureSimilarity_Levenshtein += score / (counter - 1);


                }

                tag['structureSimilarity'] = structureSimilarity / counter;
                tag['structureSimilarity_Levenshtein'] = structureSimilarity_Levenshtein / counter;

            }
            else {
                tag['structureSimilarity'] = 1;
                tag['structureSimilarity_Levenshtein'] = 100;
            }

            //console.log("Structure similarity = " + tag.structureSimilarity);
            //console.log("Structure similarity Levenshtein = " + tag.structureSimilarity_Levenshtein);
        }


    }
}

//Assigning margin values
function parseMargin(tag, margin) {
    margin = margin.replaceAll('px', '');
    margins = margin.split(' ');

    if (margins != null) {
        if (margins.length == 1) {
            tag.marginTop = margins[0];
            tag.marginRight = margins[0];
            tag.marginBottom = margins[0];
            tag.marginLeft = margins[0];
        }
        else if (margins.length == 2) {
            tag.marginTop = margins[0];
            tag.marginRight = margins[1];
            tag.marginBottom = margins[0];
            tag.marginLeft = margins[1];
        }
        else if (margins.length == 3) {
            tag.marginTop = margins[0];
            tag.marginRight = margins[1];
            tag.marginBottom = margins[2];
            tag.marginLeft = margins[1];
        }
        else if (margins.length == 4) {
            tag.marginTop = margins[0];
            tag.marginRight = margins[1];
            tag.marginBottom = margins[2];
            tag.marginLeft = margins[3];
        }
    }
}

//Assigning padding values
function parsePadding(tag, padding) {
    padding = padding.replaceAll('px', '');
    paddings = padding.split(" ");

    if (paddings != null) {
        if (paddings.length == 1) {
            tag.paddingTop = paddings[0];
            tag.paddingRight = paddings[0];
            tag.paddingBottom = paddings[0];
            tag.paddingLeft = paddings[0];
        }
        else if (paddings.length == 2) {
            tag.paddingTop = paddings[0];
            tag.paddingRight = paddings[1];
            tag.paddingBottom = paddings[0];
            tag.paddingLeft = paddings[1];
        }
        else if (paddings.length == 3) {
            tag.paddingTop = paddings[0];
            tag.paddingRight = paddings[1];
            tag.paddingBottom = paddings[2];
            tag.paddingLeft = paddings[1];
        }
        else if (paddings.length == 4) {
            tag.paddingTop = paddings[0];
            tag.paddingRight = paddings[1];
            tag.paddingBottom = paddings[2];
            tag.paddingLeft = paddings[3];
        }
    }
}

//Calculating an integer to represent an RGB value
function parseRGB(rgb) {
    var rgb_numerical = BigInt(0);
    if (rgb == null || rgb == '') {
        return (rgb_numerical);
    }

    rgb = rgb.replace('rgba(', '');
    rgb = rgb.replace('rgb(', '');
    rgb = rgb.replace(')', '');


    var red = BigInt(0);
    var green = BigInt(0);
    var blue = BigInt(0);
    var alpha = BigInt(0);

    var values = rgb.split(',');

    if (values.length == 0) {
        return (rgb_numerical);
    }

    red = BigInt(values[0]);
    green = BigInt(values[1]);
    blue = BigInt(values[2]);

    if (values.length == 4) {
        alpha = BigInt(Math.round(values[3]));
    }

    rgb_numerical = (red << BigInt(24)) + (green << BigInt(16)) + (blue << BigInt(8)) + (alpha);


    return rgb_numerical;
}

//Assigning border values
function parseBorder(tag, border) {

    if (border != null && border != '') {
        border = border.replaceAll('px', '');

        var values = border.split(' ');

        var rgb = values[2] + values[3] + values[4];

        if (values.length > 0) {
            tag.borderWidth = values[0];
            tag.borderStyle = values[1];
            tag.borderColor = parseRGB(rgb);
        }
    }

}

//Basic puppeteer code to connect to a page
(async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(pageLink, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: "sc.png" });

    process.stdout.write("\n\n\n####################################");
    process.stdout.write("\nStarted the Feature Extraction Process");
    process.stdout.write("\n####################################\n");

    const extractedText = await page.$eval('*', (el) => el.innerText);
    console.log("All Text: " + extractedText);
    //Loop that will run for each tag in our tags list and will populate its features fields
    for (let tag of tags) {
        counter = 0;
        //Getting the elements of a page using the XPATHs that we know from our VIPS JSON file
        const elements = await page.$x(tag.xpath);
        for (let element of elements) {
            //Get the text content of the element
            var textJSHandle = await element.getProperty('textContent');
            var innerHtmlJSHandle = await element.getProperty('innerHTML');

            //Regular expression to remove the space before and after a sentence
            var text = (await textJSHandle.jsonValue()).replace(/\s+/g, ' ').trim();
            var innerHTML = (await innerHtmlJSHandle.jsonValue()).replace(/\s+/g, ' ').trim();

            //Adding most features 
            await (addFeatures(tag, text, innerHTML, extractedText));

            //Adding the remaining features
            for (let feature of cssFeatures) {
                if (feature == 'background-color') {
                    var rgb = await eval(featureExtractor());
                    tag.background_color = BigInt(parseRGB(rgb));
                }
                else if (feature == 'color') {
                    var rgb = await eval(featureExtractor());
                    tag.color = BigInt(parseRGB(rgb));
                }
                else if (feature == 'border') {
                    var border = await eval(featureExtractor());
                    parseBorder(tag, border)
                }
                else if (counter == 1) {
                    var font_Size = await eval(featureExtractor());
                    font_Size = font_Size.replaceAll('px','');
                    tag.fontSize = font_Size;
                }
                else if (feature == 'margin') {
                    var margin = await eval(featureExtractor());
                    parseMargin(tag, margin);
                }
                else if (feature == 'padding') {
                    var padding = await eval(featureExtractor());
                    parsePadding(tag, padding);
                }
                else {
                    tag[feature] = await eval(featureExtractor());
                }


                counter = counter + 1;
            }
        }

    }

    //Corrects a mistake in the way the innerHTML code is stored in each tag that causes the loss of some information
    await (correctHTMLCode());
    //Calculates the text similarity with neighbouring segments for each tag
    await (addTextSimilarity());
    await (addStructureSimilarity());
    //await(addStructureRegularity());

    await (addLabels());
    await (printStats());

    await browser.close();
})();

//Function that returns the appropriate code string to be run by eval() functions that are called in other parts of the code
function featureExtractor() {
    var code = '';
    if (counter == 0) {
        code = "page.evaluate(el => getComputedStyle(el).getPropertyValue('background-color'), element)";
    }
    else if (counter == 1) {
        code = "page.evaluate(el => getComputedStyle(el).getPropertyValue('font-size'), element)";
    }
    else {
        code = "page.evaluate(el => getComputedStyle(el).getPropertyValue('" + cssFeatures[counter] + "'), element)";
    }
    return (code);
};

//Adding the labels to our elements
function addLabels() {

    var lines = fs.readFileSync('Segments/' + page_Name + '.txt', 'utf-8');
    lines = lines.split(/\r?\n/);

    for (let line of lines) {
        console.log('Searching for: ' + line+'\n');

        var tag = tags.find(function (_tag) {
            if (_tag.name == line){
                console.log('Found: ' + line + '\n');
                return _tag;
            }
        })

        if(tag == null){
            console.log("Null tag detected: " + line);
        }
        else{
            tag.label = 1;

            if (tag.children.length > 0) {

                childrenTags = tag.children;
    
                counter = tag.children.length;
    
                for (let child of childrenTags) {
    
    
                    var childTag = tags.find(function (_tag) {
                        if (_tag.name == child.name)
                            return _tag;
                    })
    
                    childTag.label = 2;
                }
            }
        }
        
    }

}

//Writing the output file (Dataset)
function printStats() {

    var headers = 0;
    var line = '';
    var tempLine = '';
    var headersLine = '';

    let writeStream = fs.createWriteStream(csvFileName)
    for (let tag of tags) {

        line = '';
        for (var key in tag) {

            if (key != 'children' && key != 'textContent' && key != 'innerHTML' && key != 'htmlCode' && key != 'specialCase') {
                if (headers == 0) {
                    headersLine += key + ',';
                }


                if (tag.hasOwnProperty(key)) {
                    tempLine = tag[key];
                    if (tempLine) {
                        tempLine = tempLine.toString().replace(/,/g, ' ');
                    }
                    line += tempLine + ',';
                    if (tag[key] == '0px') {
                        //console.log("\n#########appended: " + key);
                    }
                }
            }
            else {
                //console.log("Skipped: " + key);
            }
        }


        if (headers == 0) {
            headersLine = headersLine.slice(0, -1);
            headersLine += '\n';
            //console.log("Headers: " + headersLine);
            writeStream.write(headersLine);
        }
        headers = 1;

        line = line.slice(0, -1);
        line += '\n';
        //console.log("line: " + line);
        writeStream.write(line);
    }

    writeStream.end();

    writeStream.on('finish', () => {
        console.log('\n\nFinished writing...')
    }).on('error', (err) => {
        console.log(err)
    })

}
