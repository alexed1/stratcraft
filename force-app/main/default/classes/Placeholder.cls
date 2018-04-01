global with sharing class Placeholder {
    public Placeholder() {

    }

    @invocableMethod
    public static void Method (){ 
    }
    
    
    global class Action {
        @InvocableVariable
    	global String placeholderVar;
    }
    

}