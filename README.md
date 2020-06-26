# Common-enumerator-of-typescript
Same way to enumerate object such as Array, List, Map or some general objects without its proto and nonenumerable property  

# Usage
Usa makeEnumerable to create a standard object, and then this object has these functions:  
    **where**: Giving a function to filt the values  
    **select**: Giving a function to translate origin value to a new one  
    **count**: Get count of your data set  
    **toArray**: Translate data set to a new array,this will create new data set immediatly  
    **orderby** and **orderbyDescending**: sort the data set, different of them is the sort-key's comparation,this will create new data set immedatly  
    **getEnumerable**: create a new enumerator for your own iteration  
    **forEach**: Giving a function to handle every value  
    **debug**: log all the values  
Mind that under the nest iteration, operation such as where and select has the ability of deferred evaluation.  