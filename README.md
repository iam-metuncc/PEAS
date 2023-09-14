# PEAS
Predicting Eye-tracking Assisted Web Page Segmentation (PEAS)

The PEAS study is one that aims to predict eye-tracking assisted web page segmentation using supervised ML models.
The idea is that we will create and train an ML model with a set of features, and a segmentation ground truth that was generated basde on eye-tracking data that was collected in task based experiments performed on a set of web pages.

The 13 web pages used in this work had their eye-tracking data collected in previous studies [[1](https://doi.org/10.1145/3372497)] and [[2](https://doi.org/10.1007/s10209-020-00708-9)].

The segmentation labels were generated using the Eye-tracking Data Driven Segmentation (EDDS) algorithm in [[1](https://doi.org/10.1145/3372497)].

After integrating the labels into our dataset, we train our model and then we can use it to predict the segmentation of web pages that do not have eye-tracking data collected for them.



This repository contains the primary components of the PEAS project. This includes:

1) The latest version of the dataset after undersampling.
2) The JS code file that was used to extract features (Node.js modules and setup is not provided)
3) The prediction model python code
4) The undersampling, encoding, and normalization python code file



A use scenario would look like:
* Generate the Vision Based Segmentation (VIPS) algorithm [[3](https://doi.org/10.1007/978-3-319-04244-2_22)] JSON file that contains the tree of elements and attributes of a web page.
* Import the VIPS file data into a data structure in our JS feature extractor file and generate the features csv file for that web page. The labels should also be imported in this step.
* Merge the csv files for all individual web pages into one data set.
* Edit the Python code file to set the path to the dataset and to select the training/testing pages. Run the file to print the prediciton results.



The full details of this work are available in the related study.



References:  
[1] Eraslan, S., Yesilada, Y., & Harper, S. (2020). “The Best of Both Worlds!” Integration of Web Page and Eye Tracking Data Driven Approaches for Automatic AOI Detection. ACM Transactions on the Web (TWEB), 14(1), 1-31. 
https://doi.org/10.1145/3372497

[2] Eraslan, S., Yesilada, Y., Yaneva, V., & Ha, L. A. (2021). “Keep it simple!”: an eye-tracking study for exploring complexity and distinguishability of web pages for people with autism. Universal Access in the Information Society, 20, 69-84.
https://doi.org/10.1007/s10209-020-00708-9

[3] Akpınar, M. E., & Yesilada, Y. (2013). Vision based page segmentation algorithm: Extended and perceived success. In Current Trends in Web Engineering: ICWE 2013 International Workshops ComposableWeb, QWE, MDWE, DMSSW, EMotions, CSE, SSN, and PhD Symposium, Aalborg, Denmark, July 8-12, 2013. Revised Selected Papers 13 (pp. 238-252). Springer International Publishing.  
https://doi.org/10.1007/978-3-319-04244-2_22
