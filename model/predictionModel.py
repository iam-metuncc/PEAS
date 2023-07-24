

import numpy as np
import pandas

from sklearn import preprocessing, svm, tree
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression, Perceptron
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             plot_precision_recall_curve,
                             precision_recall_curve, precision_score,
                             recall_score)
from sklearn.neighbors import KNeighborsClassifier


#Feature selection libraries
from sklearn.feature_selection import SelectFromModel


from sklearn.dummy import DummyClassifier

#Should be changed to the full path to the dataset
dataSet_Original = pandas.read_csv("Undersampled_Data.csv")


dataSet = dataSet_Original.copy()

# #Encoding string values
pageName_Column = dataSet.loc[:,'pageName'].to_numpy(copy=True)
name_Column = dataSet.loc[:,'name'].to_numpy(copy=True)
xpath_Column = dataSet.loc[:,'xpath'].to_numpy(copy=True)
tagName_Column = dataSet.loc[:,'tagName'].to_numpy(copy=True)
role_Column = dataSet.loc[:,'role'].to_numpy(copy=True)
classname_Column = dataSet.loc[:,'classname'].to_numpy(copy=True)
borderStyle_Column = dataSet.loc[:,'borderStyle'].to_numpy(copy=True)
shape_Column = dataSet.loc[:,'shape'].to_numpy(copy=True)

# #Encoding the values so they end up in numeric format (required by the libraries we will use).
encoder = preprocessing.LabelEncoder()
xpath_Column = encoder.fit_transform(xpath_Column)
classname_Column = encoder.fit_transform(classname_Column)


# #Assigning the encoded values
dataSet['xpath'] = xpath_Column
dataSet['classname'] = classname_Column


print(dataSet)
dataSet.info()

#Checking if the dataset contains empty fields
result = np.where(pandas.isnull(dataSet))
if(len(result[0]) > 0):
    print("\nThe dataSet set contains empty fields.\n")
else:
    print("\nThe dataSet contains no empty fields.\n")


#Original list of features before dropping any of them
trainingColumns = ['pageName', 'name', 'xpath', 'tagName', 'role', 'classname', 'width', 'height', 'size', 'topX', 'topY', 'fullArea',
'whiteSpace', 'whiteSpaceRatio', 'titleKeywords', 'textLength', 'avgWordLength', 'fullStopsRatio', 'numberOfVerticalBars', 'numberOfDateTokens', 'numberOfImages',
'numberOfTables', 'wordFrequency', 'numberOfLinks', 'wordFrequencyInLinks', 'wordFrequencyInLinksToAll', 'averageSentenceLength', 'ratioOfTermsToAll', 'ratioOfUppercaseWordsToAll',
'textSimilarity', 'structureSimilarity', 'structureSimilarity_Levenshtein', 'background_color', 'fontSize', 'borderWidth', 'borderStyle', 'borderColor', 'color',
'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'shape']


#Columns that will be used for classification
predictedColumn = ['label']



#Reference: https://stackoverflow.com/questions/17778394/list-highest-correlation-pairs-from-a-large-correlation-matrix-in-pandas
def get_feature_correlation(df, top_n=None, corr_method='spearman',
                            remove_duplicates=True, remove_self_correlations=True):
    """
    Compute the feature correlation and sort feature pairs based on their correlation

    :param df: The dataframe with the predictor variables
    :type df: pandas.core.frame.DataFrame
    :param top_n: Top N feature pairs to be reported (if None, all of the pairs will be returned)
    :param corr_method: Correlation compuation method
    :type corr_method: str
    :param remove_duplicates: Indicates whether duplicate features must be removed
    :type remove_duplicates: bool
    :param remove_self_correlations: Indicates whether self correlations will be removed
    :type remove_self_correlations: bool

    :return: pandas.core.frame.DataFrame
    """
    corr_matrix_abs = df.corr(method=corr_method).abs()
    corr_matrix_abs_us = corr_matrix_abs.unstack()
    sorted_correlated_features = corr_matrix_abs_us \
        .sort_values(kind="quicksort", ascending=False) \
        .reset_index()

    # Remove comparisons of the same feature
    if remove_self_correlations:
        sorted_correlated_features = sorted_correlated_features[
            (sorted_correlated_features.level_0 != sorted_correlated_features.level_1)
        ]

    # Remove duplicates
    if remove_duplicates:
        sorted_correlated_features = sorted_correlated_features.iloc[:-2:2]

    # Create meaningful names for the columns
    sorted_correlated_features.columns = ['Feature 1', 'Feature 2', 'Correlation (abs)']

    if top_n:
        return sorted_correlated_features[:top_n]

    return sorted_correlated_features



#Original list of features before dropping any of them
trainingColumns = ['name', 'xpath', 'tagName', 'role', 'classname', 'width', 'height', 'size', 'topX', 'topY', 'fullArea',
'whiteSpace', 'whiteSpaceRatio', 'titleKeywords', 'textLength', 'avgWordLength', 'fullStopsRatio', 'numberOfVerticalBars', 'numberOfDateTokens', 'numberOfImages',
'numberOfTables', 'wordFrequency', 'numberOfLinks', 'wordFrequencyInLinks', 'wordFrequencyInLinksToAll', 'averageSentenceLength', 'ratioOfTermsToAll', 'ratioOfUppercaseWordsToAll',
'textSimilarity', 'structureSimilarity', 'structureSimilarity_Levenshtein', 'background_color', 'fontSize', 'borderWidth', 'borderStyle', 'borderColor', 'color',
'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'shape']




#----------------------------------------------------------
tr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]


trainingSet = dataSet.loc[(dataSet['pageName'].isin(tr))]
trainingLabels = trainingSet.loc[:, 'label'].to_numpy(copy=True)
print(trainingSet)

#Assigning the number of the page that we want to use for testing
testingSet = dataSet.loc[dataSet['pageName'] == 12]
testingLabels = testingSet.loc[:, 'label'].to_numpy(copy=True)



print(testingSet)
print(testingLabels)

trainingSet.drop('pageName', inplace=True, axis=1)
testingSet.drop('pageName', inplace=True, axis=1)

#------------------------------------------------------------------------------------------------------------------------
#Commented code that was used in previous experiments to find feature correlations for each page
#------------------------------------------------------------------------------------------------------------------------
# correlation = trainingSet.corr().abs()
# #correlation = testingSet.corr().abs()
# correlation = correlation.unstack()

#https://stackoverflow.com/questions/17778394/list-highest-correlation-pairs-from-a-large-correlation-matrix-in-pandas
# sorted_Correlation = correlation.sort_values(kind="quicksort", ascending=False)
# sorted_Correlation = get_feature_correlation(trainingSet)
#sorted_Correlation = get_feature_correlation(testingSet)

#sorted_Correlation = sorted_Correlation.loc[(sorted_Correlation['Feature 1'] == 'label') | (sorted_Correlation['Feature 2'] == 'label')]
#print(sorted_Correlation)
#------------------------------------------------------------------------------------------------------------------------
#------------------------------------------------------------------------------------------------------------------------

def selectFeatures(x_train, y_train, x_test, model, numOfFeatures):
    featureSelector = SelectFromModel(model, max_features=numOfFeatures)
    featureSelector.fit(x_train, y_train)
    x_train_selected = featureSelector.transform(x_train)
    x_test_selected = featureSelector.transform(x_test)
    return x_train_selected, x_test_selected, featureSelector



#The final list of features that will be used for training
trainingColumns = ['name', 'xpath', 'tagName', 'role', 'classname', 'width', 'height', 'size', 'topX', 'topY', 'fullArea',
'whiteSpace', 'whiteSpaceRatio', 'titleKeywords', 'textLength', 'avgWordLength', 'fullStopsRatio', 'numberOfImages', 'wordFrequency', 'numberOfLinks', 'wordFrequencyInLinks', 'wordFrequencyInLinksToAll', 'averageSentenceLength', 'ratioOfTermsToAll', 'ratioOfUppercaseWordsToAll',
'textSimilarity', 'structureSimilarity', 'structureSimilarity_Levenshtein', 'background_color', 'fontSize', 'borderWidth', 'borderStyle', 'borderColor', 'color',
'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']



numOfFeatures = len(trainingColumns)
print("Number of training features: ", numOfFeatures)

#Creating the model and using it to predict the price for x_test
x = trainingSet[trainingColumns]
testingSet = testingSet[trainingColumns]
y = trainingLabels


trainingLabelsNumber = np.count_nonzero(y == 1)
testingLabelsNumber = np.count_nonzero(testingLabels == 1)

print("\nNumber of 1s in the training set: ", trainingLabelsNumber)
print("Number of 0s in the training set: ", y.size - np.count_nonzero(y))

print("\nNumber of 1s in the testing set: ", testingLabelsNumber)
print("Number of 0s in the testing set: ", testingLabels.size - np.count_nonzero(testingLabels))



x = trainingSet[trainingColumns]
testingSet = testingSet[trainingColumns]
y = trainingLabels
RFC_Model = RandomForestClassifier(n_estimators=20, random_state=None)
RFC_Model.fit(x,y)

predictions = RFC_Model.predict(testingSet[trainingColumns])
print('\n\n\n\n\n')


print("\n******************* RFC Accuracy and Confusion matrix *******************")

x = testingLabels
y = predictions

score = accuracy_score(x, y)
print("\nThe prediction accuracy is:")
print(score)

precision = precision_score(x,y)
print("\nThe precision score is:")
print(precision)

recall = recall_score(x,y)
print("\nThe recall score is:")
print(recall)

F1_score = f1_score(x,y)
print("\nThe F1 score is:")
print(F1_score)


x = trainingSet[trainingColumns]
testingSet = testingSet[trainingColumns]
y = trainingLabels
decisionTree = tree.DecisionTreeClassifier()
decisionTree.fit(x,y)

predictions = decisionTree.predict(testingSet[trainingColumns])
print('\n\n\n\n\n')
# print(predictions)

print("\n******************* Decision Tree Accuracy and Confusion matrix *******************")
x = testingLabels
y = predictions

score = accuracy_score(x, y)
print("\nThe prediction accuracy is:")
print(score)

precision = precision_score(x,y)
print("\nThe precision score is:")
print(precision)

recall = recall_score(x,y)
print("\nThe recall score is:")
print(recall)

F1_score = f1_score(x,y)
print("\nThe F1 score is:")
print(F1_score)

######################################################################################################
######################################    KNN Classifier    ##########################################

model = KNeighborsClassifier(n_neighbors=30)

x = trainingSet[trainingColumns]
testingSet = testingSet[trainingColumns]
y = trainingLabels


#Using the training set for the learning stage
model.fit(x, y)

#Using the testing set for the actual classification
predictions = model.predict(testingSet[trainingColumns])




print("\n******************* KNN Accuracy and Confusion matrix *******************")
x = testingLabels
y = predictions

score = accuracy_score(x, y)
print("\nThe prediction accuracy is:")
print(score)

precision = precision_score(x,y)
print("\nThe precision score is:")
print(precision)

recall = recall_score(x,y)
print("\nThe recall score is:")
print(recall)

F1_score = f1_score(x,y)
print("\nThe F1 score is:")
print(F1_score)




######################################################################################################
######################################    SVM     ###########################################

#Creating the model and using it to predict the price for x_test
x = trainingSet[trainingColumns]
testingSet = testingSet[trainingColumns]
y = trainingLabels

SVM_Model = svm.LinearSVC(class_weight='balanced')
SVM_Model.fit(x,y)

predictions = SVM_Model.predict(testingSet[trainingColumns])
print('\n\n\n')

print("\n******************* SVM Accuracy and Confusion matrix *******************")
x = testingLabels
y = predictions


score = accuracy_score(x, y)
print("\nThe prediction accuracy is:")
print(score)

precision = precision_score(x,y)
print("\nThe precision score is:")
print(precision)

recall = recall_score(x,y)
print("\nThe recall score is:")
print(recall)

F1_score = f1_score(x,y)
print("\nThe F1 score is:")
print(F1_score)




######################################################################################################
#############################    Linear Logistic regression    #######################################

#Creating the model and using it to predict the price for x_test
x = trainingSet[trainingColumns]
testingSet = testingSet[trainingColumns]
y = trainingLabels

logisticRegressor = LogisticRegression()
logisticRegressor.fit(x,y)


predictions = logisticRegressor.predict(testingSet[trainingColumns])
print('\n\n\n\n\n')

print("\n******************* Logistic Regression Accuracy and Confusion matrix *******************")
x = testingLabels
y = predictions

score = accuracy_score(x, y)
print("\nThe prediction accuracy is:")
print(score)

precision = precision_score(x,y)
print("\nThe precision score is:")
print(precision)

recall = recall_score(x,y)
print("\nThe recall score is:")
print(recall)

F1_score = f1_score(x,y)
print("\nThe F1 score is:")
print(F1_score)





######################################################################################################
#############################    Perceptron Algorithm    #######################################

x = trainingSet[trainingColumns]
testingSet = testingSet[trainingColumns]
y = trainingLabels

perceptronModel = Perceptron(random_state=42)
perceptronModel.fit(x,y)

predictions = perceptronModel.predict(testingSet[trainingColumns])
print('\n\n\n\n\n')


print("\n******************* Perceptron Algorithm Accuracy and Confusion matrix *******************")
x = testingLabels
y = predictions

score = accuracy_score(x, y)
print("\nThe prediction accuracy is:")
print(score)

precision = precision_score(x,y)
print("\nThe precision score is:")
print(precision)

recall = recall_score(x,y)
print("\n\nThe recall score is:")
print(recall)

F1_score = f1_score(x,y)
print("\n\nThe F1 score is:")
print(F1_score)



######################################################################################################
#############################    Random Baseline    #######################################

x = trainingSet[trainingColumns]
testingSet = testingSet[trainingColumns]
y = trainingLabels

dummyClassifier = DummyClassifier(strategy='uniform')
dummyClassifier.fit(x,y)

predictions = dummyClassifier.predict(testingSet[trainingColumns])
print('\n\n\n\n\n')
# print(predictions)




print("\n******************* Random Baseline Accuracy and Confusion matrix *******************")
x = testingLabels
y = predictions

score = accuracy_score(x, y)
print("\nThe prediction accuracy is:")
print(score)

precision = precision_score(x,y)
print("\nThe precision score is:")
print(precision)

recall = recall_score(x,y)
print("\n\nThe recall score is:")
print(recall)

F1_score = f1_score(x,y)
print("\n\nThe F1 score is:")
print(F1_score)




##########################################################################################################################################################################
#############################    Extra code that was used to test a model with a different number of features in each iteration    #######################################

# for i in range(1, numOfFeatures+1):
#     x_train_selected, x_test_selected, featureSelector = selectFeatures(x, y, testingSet, model, i)
#     model.fit(x_train_selected, y)
#     predicted_selected = model.predict(x_test_selected)

#     y_test = testingLabels
#     print("\n\n------------Selected Results For I = %d------------------------" %(i))
#     score = accuracy_score(y_test, predicted_selected)
#     print("\nThe prediction accuracy is:")
#     print(score)

#     precision = precision_score(y_test,predicted_selected)
#     print("\nThe precision score is:")
#     print(precision)

#     recall = recall_score(y_test,predicted_selected)
#     print("\nThe recall score is:")
#     print(recall)

#     F1_score = f1_score(y_test,predicted_selected)
#     print("\nThe F1 score is:")
#     print(F1_score)
