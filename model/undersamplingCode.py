
import numpy as np
import pandas
from sklearn import preprocessing

#SMOTE library 
import imblearn


#Should be changed to the full path to the dataset
dataSet_Original = pandas.read_csv("All_Data.csv")


dataSet = dataSet_Original.copy()

#Dropping elements with a label of 2
dataSet = dataSet[dataSet.label != 2]

print(dataSet)
dataSet.info()

#Checking if the dataset contains empty fields
result = np.where(pandas.isnull(dataSet))
if(len(result[0]) > 0):
    print("\nThe dataSet set contains empty fields.\n")
else:
    print("\nThe dataSet contains no empty fields.\n")


#Full list of features
trainingColumns = ['pageName', 'name', 'xpath', 'tagName', 'role', 'classname', 'width', 'height', 'size', 'topX', 'topY', 'fullArea',
'whiteSpace', 'whiteSpaceRatio', 'titleKeywords', 'textLength', 'avgWordLength', 'fullStopsRatio', 'numberOfVerticalBars', 'numberOfDateTokens', 'numberOfImages',
'numberOfTables', 'wordFrequency', 'numberOfLinks', 'wordFrequencyInLinks', 'wordFrequencyInLinksToAll', 'averageSentenceLength', 'ratioOfTermsToAll', 'ratioOfUppercaseWordsToAll',
'textSimilarity', 'structureSimilarity', 'structureSimilarity_Levenshtein', 'background_color', 'fontSize', 'borderWidth', 'borderStyle', 'borderColor', 'color',
'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'shape', 'level']


#Function that uses a custom approach to encode class names
def classnameEncoder():
    uniqueVals = dataSet['classname'].unique()
    valsDictionary = dict(enumerate(uniqueVals.flatten(), 1))
    print(uniqueVals)
    print("Values are ###########################")
    print(valsDictionary)

classnameEncoder()

#Function that uses a custom approach to encode XPATHs
def xpathEncoder():
    uniqueVals = dataSet['xpath'].unique()
    valsDictionary = dict(enumerate(uniqueVals.flatten(), 1))
    print(uniqueVals)
    print("Values are xpath ###########################")
    print(valsDictionary)

xpathEncoder()




#Function that generates the "level" feature
def levelCalculator (row):
    name = row['name']
    digits = sum(c.isdigit() for c in name)

    return digits

dataSet['level'] = dataSet.apply(lambda row: levelCalculator(row), axis=1)
dataSet['name'] = dataSet.apply(lambda row: levelCalculator(row), axis=1)


#Older custom name encoder that we stopped using
# def nameEncoder(row):
#     name = row['name']
#     name = re.sub('\D', '', name)
#     return int(name)
# dataSet['name'] = dataSet.apply(lambda row: nameEncoder(row), axis=1)




#Columns that will be used for classification
predictedColumn = ['label']

#Encoding string values
pageName_Column = dataSet.loc[:,'pageName'].to_numpy(copy=True)
name_Column = dataSet.loc[:,'name'].to_numpy(copy=True)
xpath_Column = dataSet.loc[:,'xpath'].to_numpy(copy=True)
tagName_Column = dataSet.loc[:,'tagName'].to_numpy(copy=True)
role_Column = dataSet.loc[:,'role'].to_numpy(copy=True)
classname_Column = dataSet.loc[:,'classname'].to_numpy(copy=True)
borderStyle_Column = dataSet.loc[:,'borderStyle'].to_numpy(copy=True)
shape_Column = dataSet.loc[:,'shape'].to_numpy(copy=True)

#Encoding the values so they end up in numeric format (required by the libraries we will use).
encoder = preprocessing.LabelEncoder()
pageName_Column = encoder.fit_transform(pageName_Column)
name_Column = encoder.fit_transform(name_Column)
xpath_Column = encoder.fit_transform(xpath_Column)
tagName_Column = encoder.fit_transform(tagName_Column)
role_Column = encoder.fit_transform(role_Column)
classname_Column = encoder.fit_transform(classname_Column)
borderStyle_Column = encoder.fit_transform(borderStyle_Column)
shape_Column = encoder.fit_transform(shape_Column)

#Assigning the encoded values
dataSet['pageName'] = pageName_Column
dataSet['name'] = name_Column
dataSet['xpath'] = xpath_Column
dataSet['tagName'] = tagName_Column
dataSet['role'] = role_Column
dataSet['classname'] = classname_Column
dataSet['borderStyle'] = borderStyle_Column
dataSet['shape'] = shape_Column

#Normalizing some features
dataSet['background_color'] = (dataSet['background_color'] - dataSet['background_color'].min())/(dataSet['background_color'].max() - dataSet['background_color'].min())
dataSet['borderColor'] = (dataSet['borderColor'] - dataSet['borderColor'].min())/(dataSet['borderColor'].max() - dataSet['borderColor'].min())
dataSet['color'] = (dataSet['color'] - dataSet['color'].min())/(dataSet['color'].max() - dataSet['color'].min())
dataSet['size'] = (dataSet['size'] - dataSet['size'].min())/(dataSet['size'].max() - dataSet['size'].min())
dataSet['color'] = (dataSet['color'] - dataSet['color'].min())/(dataSet['color'].max() - dataSet['color'].min())

dataSet['textLength'] = (dataSet['textLength'] - dataSet['textLength'].min())/(dataSet['textLength'].max() - dataSet['textLength'].min())
dataSet['avgWordLength'] = (dataSet['avgWordLength'] - dataSet['avgWordLength'].min())/(dataSet['avgWordLength'].max() - dataSet['avgWordLength'].min())
dataSet['wordFrequency'] = (dataSet['wordFrequency'] - dataSet['wordFrequency'].min())/(dataSet['wordFrequency'].max() - dataSet['wordFrequency'].min())
dataSet['wordFrequencyInLinks'] = (dataSet['wordFrequencyInLinks'] - dataSet['wordFrequencyInLinks'].min())/(dataSet['wordFrequencyInLinks'].max() - dataSet['wordFrequencyInLinks'].min())
dataSet['averageSentenceLength'] = (dataSet['averageSentenceLength'] - dataSet['averageSentenceLength'].min())/(dataSet['averageSentenceLength'].max() - dataSet['averageSentenceLength'].min())
dataSet['whiteSpace'] = (dataSet['whiteSpace'] - dataSet['whiteSpace'].min())/(dataSet['whiteSpace'].max() - dataSet['whiteSpace'].min())
dataSet['fullArea'] = (dataSet['fullArea'] - dataSet['fullArea'].min())/(dataSet['fullArea'].max() - dataSet['fullArea'].min())





trainingColumns = ['pageName', 'name', 'xpath', 'tagName', 'role', 'classname', 'width', 'height', 'size', 'topX', 'topY', 'fullArea',
'whiteSpace', 'whiteSpaceRatio', 'titleKeywords', 'textLength', 'avgWordLength', 'fullStopsRatio', 'numberOfVerticalBars', 'numberOfDateTokens', 'numberOfImages',
'numberOfTables', 'wordFrequency', 'numberOfLinks', 'wordFrequencyInLinks', 'wordFrequencyInLinksToAll', 'averageSentenceLength', 'ratioOfTermsToAll', 'ratioOfUppercaseWordsToAll',
'textSimilarity', 'structureSimilarity', 'structureSimilarity_Levenshtein', 'background_color', 'fontSize', 'borderWidth', 'borderStyle', 'borderColor', 'color',
'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'shape']



# define the undersampling method
undersample = imblearn.under_sampling.CondensedNearestNeighbour(n_neighbors=1)
undersample = imblearn.under_sampling.NearMiss(version=3, n_neighbors_ver3=3)

frames = []
i = 0

while(i < 13):

    set = dataSet.loc[dataSet['pageName'] == i]
    x = set[trainingColumns]
    y = set['label']


    # transform the dataset
    x, y = undersample.fit_resample(x, y)

    x = pandas.DataFrame(x)
    y = pandas.DataFrame(y)

    
    pageFrame = pandas.concat([x,y], axis=1, join='inner')

    frames.append(pageFrame)

    i = i + 1

dataSet = pandas.concat(frames, ignore_index=True)
#----------------------------------------------------------

#Should be replaced with full path to the output file
dataSet.to_csv("Undersampled_Data.csv", index=False)


print(dataSet)










